const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Hotel = require('../module/hotelSchema');


router.use(bodyParser.urlencoded({ extended:true}));
router.use(bodyParser.json());


router.post("/addHotel",(req,res)=>{
    Hotel.find({hotelEmail: req.body.hotelEmail}).then((data)=>{
        if(data.length<=0){
            req.body['hotelAvailable'] = true;
            Hotel.create(req.body).then((result)=>{
                res.status(200).send({
                    status: 200,
                    message: 'hotel added successfully',
                    result: result
                })
            }).catch((err)=>{
                res.status(500).send({
                    status: 500,
                    message:'something went wrong'
                })
            })
        }else{
            res.status(400).send({
                status: 400,
                message:'Hotel already exists'
            })
        }
    }).catch((err)=>{
        res.status(500).send({
            status: 500,
            message:'Something went wrong'
        })
    })
})

router.delete('/deleteHotel/:id',(req, res)=>{
    let id = req.params.id;
    Hotel.delete({_id:id}).then((result)=>{
        res.status(200).send({
            status: 200,
            message: 'hotel deleted successfully',
            result: result
        })
    }).catch((err)=>{
        res.status(500).send({
            status: 500,
            message: 'Something went wrong'
        })
    })
})


router.post('/hotelList',async (req, res)=>{

    let query = {};
    let email= req.body.hotelEmail;
    let available = req.body.hotelAvailable;
    if(email){
        query = {hotelEmail: email};
    }

    if(available){
        query = {hotelAvailable: available};
    }

    let total;
    await Hotel.find(query).count().then((count)=>{
        total =  count
    }).catch((err)=>{
        console.log(err);
    })

    await Hotel.find(query).then((result)=>{
        res.status(200).send({
            status: 200,
            result: result,
            totalCount: total
        })
    })
})


router.patch("/removeHotel",(req,res)=>{
    Hotel.find({_id: req.body.id}).then((data)=>{
        if(data.length>0){
            Hotel.updateOne({_id: req.body.id},{$set: {hotelAvailable: false}}).then((result)=>{
                res.status(200).send({
                    status: 200,
                    message: 'hotel updated successfully',
                }).catch((err)=>{
                    res.status(500).send({
                        status: 500,
                        message: 'something went wrong'
                    })
                })
            })
        }else{
            res.status(400).send({
                status: 400,
                message: 'hotel not found'
            })
        }
    })
})


module.exports = router;


/**
 * @swagger
 * /api/v1/addHotel:
 *   post:
 *     tags: [Hotel]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: hotelName
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: hotelAddress
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: hotelEmail
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: hotelHonor
 *         in: formData
 *         type: string
 *         required: true
 *         description:
 *       - name: hotelMobile
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
 * /api/v1/hotelList:
 *   post:
 *     tags: [Hotel]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: hotelEmail
 *         in: formData
 *         type: string
 *         required: false
 *         description: search by hotel email id
 *       - name: hotelAvailable
 *         in: formData
 *         type: boolean
 *         required: false
 *         description: 
 *     responses:
 *       200:
 *         description: forget password
 *
 */



/**
 * @swagger
 * /api/v1/disableHotel:
 *   patch:
 *     tags: [Hotel]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: formData
 *         type: string
 *         required: true
 *         description: hotel id
 *     responses:
 *       200:
 *         description: remove hotel
 *
 */