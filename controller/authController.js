const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
let config = require('../config');
const fileupload = require('express-fileupload');
const nodemailer = require("nodemailer");
const formidable = require('formidable');
const User = require('../module/userSchema');
const sgMail = require('@sendgrid/mail');
router.use(bodyParser.urlencoded({ extended:true}));
router.use(bodyParser.json());
router.use(fileupload());

sgMail.setApiKey(API_KEY);

router.get('/',(req, res) => {
    res.send({
        status: 200,
        message:'server is working find'
    })
})

router.post('/register',(req, res) => {

    if(req.body.email &&  req.body.name && req.body.password && req.body.phone && req.body.address){

        let pass = bcrypt.hashSync(req.body.password,8);
        let postData = {
            name: req.body.name,
            email: req.body.email,
            password: pass,
            phone: Number(req.body.phone),
            address: req.body.address,
            isActivated: true,
            createdAt: new Date(),
            UpdatedAt: new Date(),
            loginFail: 0 
        }
        User.find({ email: req.body.email}).then((user)=>{
            if(user.length>0){
                    res.status(400).send({
                        status: 400,
                        message: 'User already exists'
                    })
            }else{
                User.create(postData).then((newUser)=>{
                    res.status(200).send({
                        status: 200,
                        message: 'User registered successfully',
                        result: newUser
                    })
                })
            }
        }).catch((error)=>{
            res.status(500).send({
                status: 500,
                message:'something went wrong'
            })
        })    
    }else{
        let msg;
        if(req.body.name==undefined){
            msg = 'name is required';
        }else if(req.body.email==undefined){
            msg = 'email is required';
        }else if(req.body.phone==undefined){
            msg = 'phone is required';
        }else if(req.body.address==undefined){
            msg = 'address is required';
        }else{
            msg = 'password is required';
        }
        res.status(404).send({
            status:404,
            message: msg
        })
    }
    

})


router.post('/usersList', async (req, res)=>{

    let query = {};
    let email = req.body.email;
    let phone = req.body.phone;
    let address = req.body.address;
    if(email && phone && address) {
        query = { email: email,phone: phone,address: address};
    }
    if(email){
        query = { email: email};
    }else if(phone){ 
        query = { phone: phone};
    } else if(address){
        query = { address: address};
    }

    let totalUsers = 0;
    await User.find().count().then((count)=>{
        totalUsers = count
    }).catch((err)=>{
        console.log('count error'+err)
    })

   await User.find(query).then((users)=>{
        res.send({
            status: 200,
            message:'users fetched successfully',
            result: users,
            totalCount: totalUsers
        })
    }).catch((error)=>{
        res.status(500).send({
            status:500,
            message: 'something went wrong'
        })
    })
})


router.post('/login',(req, res)=>{
    User.find({email: req.body.email}).then((user)=>{
        if(user.length>0){
            let fails = user[0].loginFail;
            let time = new Date(user[0].UpdatedAt);
            let current = new Date();
            let diff = current.getTime() - time.getTime();
            let min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            let timeRem = 4-min;
            if(fails<=3){
                let validPass = bcrypt.compareSync(req.body.password,user[0].password);
                if(validPass){
                        User.updateOne({email: req.body.email,$set:{loginFail: 0}}).then((res)=>{
                        }).catch((err)=>{
                        })
                        let accessToken = jwt.sign({id:user[0]._id},config.secretKey,{expiresIn:84600});    
                        res.send({
                            status: 200,
                            result: user[0],
                            accessToken: accessToken,
                            message: 'login successful'
                        })

                }else{
                    let fails = user[0].loginFail;
                    // let setFail = fails >= 3 ? 0 : fails;
                    // console.log(setFail+"failed to login")
                    User.updateOne({email: req.body.email,$set:{loginFail: fails+1,UpdatedAt: new Date()}}).then((res)=>{
                    }).catch((err)=>{
                    })
                    res.status(403).send({
                        status:403,
                        message: 'Invalid password'
                    })
                }
            }  else{
                res.status(403).send({
                    status:403,
                    message: `user blocked try after sometime`,

                })
            } 
            }else{
                res.status(200).send({
                    status:200,
                    message: 'user not found'
                })
            }
        }).catch((err)=>{
            console.log(err+"===============================")
            res.status(500).send({
                status:500,
                message:'something went wrong'
            })
        })
})



router.post('/forgetPassword', (req, res)=>{
    let first = Math.floor(Math.random(10)*10);
    let second = Math.floor(Math.random(10)*10);
    let third = Math.floor(Math.random(10)*10);
    let forth = Math.floor(Math.random(10)*10);
    let fifth = Math.floor(Math.random(10)*10);
    let sixth = Math.floor(Math.random(10)*10);
    let pass = `${first}${second}${third}${forth}${fifth}${sixth}`;
    let bcryptpass = bcrypt.hashSync(pass,8);
    console.log(pass);
    User.find({email:req.body.email}).then(async (user)=>{
        if(user.length>0){

            await User.updateOne({email:req.body.email},{$set : {password:bcryptpass,loginFail:0}}).then((result)=>{

            }).catch(()=>{

            })
            res.status(200).send({
                status:200,
                message:"password changed successfully check your mail"
            })
        }else{
            res.status(400).send({
                status:400,
                message:'User not found'
            })
        }
    }).catch((err)=>{
        console.error(err);
        res.status(500).send({
            status:500,
            message:'Something went wrong'
        });
    })
})
router.delete('/deleteUser/:id',(req, res)=>{
    let id = req.params.id;
    if(id){
        User.deleteOne({_id: id}).then((result)=>{
            res.status(200).send({
                status: 200,
                message:'user deleted successfully'
            })
        }).catch((err)=>{
            res.status(500).send({
                status: 500,
                message:'Something went wrong'
            })
        })
    }else{
        res.status(500).send({
            status: 500,
            message:'id is required'
        })
    }
    
})


router.patch('/userUdate/:id',(req, res)=>{
    User.find({_id: req.params.id}).then((result)=>{
        if(result.length>0){
                User.updateOne({_id: req.params.id},{$set: req.body}).then((data)=>{
                    res.status(200).send({
                        status: 200,
                        message:'user updated successfully'
                    })
                })
        }else{
            res.status(400).send({
                status: 400,
                message:'user not found'
            })
        }
    }).catch((err)=>{
        res.status(500).send({
            status: 500,
            message:'something went wrong'
        })
    })
})


router.post('/upload', (req, res)=>{
    console.log(req.files);
    console.log(req.body.file);
    res.status(200).send({
        status: 200,
        message: "ok"
    });
})

module.exports = router;


/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags: [User]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: password
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *     responses:
 *       200:
 *         description: login.
 *
 */


/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     tags: [User]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: email
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: phone
 *         in: formData
 *         type: number
 *         required: true
 *         description:
 *       - name: password
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: address
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *     responses:
 *       200:
 *         description: Register user.
 *
 */


/**
 * @swagger
 * /api/v1/userUdate/{id}:
 *   patch:
 *     tags: [User]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *         description:
 *       - name: name
 *         in: formData
 *         type: string
 *         required: false
 *         description:
 *       - name: email
 *         in: formData
 *         type: string
 *         required: false
 *         description:
 *       - name: phone
 *         in: formData
 *         type: number
 *         required: false
 *         description:
 *       - name: password
 *         in: formData
 *         type: string
 *         required: false
 *         description:
 *       - name: address
 *         in: formData
 *         type: string
 *         required: false
 *         description:
 *     responses:
 *       200:
 *         description: user update.
 *
 */


/**
 * @swagger
 * /api/v1/usersList:
 *   post:
 *     tags: [User]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: formData
 *         type: string
 *         required: false
 *         description: search by email
 *       - name: phone
 *         in: formData
 *         type: number
 *         required: false
 *         description: search by phone
 *       - name: address
 *         in: formData
 *         type: string
 *         required: false
 *         description: search by address
 *     responses:
 *       200:
 *         description: users list.
 *
 */


/**
 * @swagger
 * /api/v1/forgetPassword:
 *   post:
 *     tags: [User]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *     responses:
 *       200:
 *         description: forget password
 *
 */

/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     tags: [Upload]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: file
 *         in: path
 *         type: file
 *         required: true
 *         description:
 *     responses:
 *       200:
 *         description: delete user
 */
