const express = require('express');
const app = express();
const cors = require('cors');
let swaggerJsDoc = require('swagger-jsdoc');
let swaggerUiExpress = require('swagger-ui-express');
let bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const db = require('./db');
let port = 4000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileupload());

let options = {
    definition:{
        info:{
          title:  'Users API Documentation By MK',
          verson:'1.0.1'
        },
        servers:[
            {
            url:    'http://localhost:4000/'
            },
            {
                url: 'https://myapi-production-1cb7.up.railway.app/'
            }
        ],
    },
    apis:[
        './controller/authController.js',
        './controller/hotelModule.js'
    ]
}

let swaggerSpec = swaggerJsDoc(options);
app.use('/api-docs',swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));


const authController = require('./controller/authController');
const hotelModule = require('./controller/hotelModule');
app.use('/api/v1', authController, hotelModule);

app.listen(port,()=>{
    console.log(`server listening on port ${port}`);
})

