const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var cors = require('cors');
const userRoutes=require('./api/routes/user');

mongoose.set('debug', true);
mongoose.connect('mongodb+srv://naman:'+process.env.MONGO_ATLAS_PW+'@node-rest-shop.7znhi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true })
app.use(morgan('dev'));

app.use(cors())

//app.use('/uploads',express.static('uploads'));

// app.use(bodyParser.urlencoded({extended:false}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
// app.use(bodyParser.json());
console.log('coming here in app');
// app.use('/',productRoutes);

app.use((req, res, next) => {
    // console.log('111', 'coming here');
    res.header('Access-Control-Allow-Origin', "*");
    res.header("Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept");
        // Authorization
        // next(req,res);
        // console.log(req);
    if (req.method == 'OPTIONS') {
        // console.log('222', 'coming here');

        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
});

app.use("/user",userRoutes);

app.use((req, res, next) => {
    const error = new Error('error');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;