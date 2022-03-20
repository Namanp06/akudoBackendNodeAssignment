const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require("../models/user");
const jwt = require('jsonwebtoken');
//const { token } = require('morgan');
const user = require('../models/user');
const { findById } = require('../models/user');
// const {generateOTP}=require('../middleware/OTP');
const checkAuth = require('../middleware/check-auth');

var generateOTP = function (no, country_code) {

    // Declare a digits variable 
    // which stores all digits
    var digits = no + country_code;
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * digits.length)];
    }
    return OTP;
}

router.post('/signUp', (req, res, next) => {
    
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail exits please login",
                    team: req.body.team
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    }
                    else {
                        const token = jwt.sign(
                            {
                                email: req.body.email
                            },
                            process.env.JWT_KEY,
                            {
                                expiresIn: "24h"
                            }
                        );
                        const user = new User({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            team: req.body.team,
                            contactNo: req.body.contactNo,
                            accessToken: token
                        });
                        user.save()
                            .then(result => {

                                console.log("successful");
                                res.status(201).json({
                                    message: 'User Created',
                                    team: req.body.team,
                                    token: result.accessToken,

                                });
                            })

                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });

});
router.post('/login', (req, res, next) => {
    console.log(req.body);
    //User.remove().exec();
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    })
                }
                if (result) {
                    console.log(user);
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "8h"
                        }
                    );
                    return res.status(200).json({
                        message: "auth successful",
                        token: token,
                        userId: user[0]._id
                    });
                }
                res.status(401).json({
                    message: 'auth failed'
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})
router.post('/logout', (req, res, next) => {
    User.updateOne({ _id: req.body.userId }, { accessToken: "" })
        .exec()
        .then(doc => {
            // console.log(doc);
            res.status(200).json({ status: "success" })
        })
        .catch(err => {
            console.log(err),
                res.status(500).json({ error: err })
        })
});

router.delete('/:userId', (req, res, next) => {
    User.remove(({ _id: req.params.userId }))
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})
router.post('/otpGeneration', checkAuth, async (req, res, next) => {
    //  console.log(req);
    const curr_user = await User.findOne({ email: req.body.email })
    if(!(req.body.contact_no.length==10)) {
        return res.status(500).json({
            message: "Please enter 10 digit phone number"
        })
    }
    if (curr_user) {
        // console.log("coming here again");
        let today = new Date();
        var otpExpiry = Date.now() + 300000;

        const otpGenerated = generateOTP(req.body.contact_no, req.body.country_code);
        await User.findOneAndUpdate(
            { _id: curr_user._id },
            { otpCode: otpGenerated, otpExpiry: otpExpiry, contactNo: req.body.country_code+req.body.contact_no },
            { new: true }
        )
        console.log(otpGenerated);
        // await User.find()
        return res.status(200).json({
            message: "Otp generated",
            otp: otpGenerated
        });
    } else {
        return res.status(500).json({
            message: "Please do signup first"
        })
    }
})

router.post('/checkOtp', checkAuth, async (req, res, next) => {
    // console.log("here at signUp its coming");
    //  console.log(req);
    const curr_user = await User.findOne({ email: req.body.email })

    //console.log("coming at then");
    if (curr_user) {
        // console.log("coming here again");
        // let today = new Date();
        var otpExpiry = new Date(curr_user.otpExpiry);
        let today = new Date();
        if(req.body.otp === curr_user.otpCode){
            if(otpExpiry.getTime() < today.getTime()){
                return res.status(500).json({
                    message: "OTP expired"
                })
            }else{
                await User.findOneAndUpdate(
                    { _id: curr_user._id },
                    { isUserVerified: true, otpCode:'' },
                    { new: true }
                )
                return res.status(200).json({
                    message: "OTP verified",
                    // otp: otpGenerated
                });
            }
        }else{
            return res.status(500).json({
                message: "Invalid OTP"
            }) 
        }
        // console.log(otpGenerated);
        // await User.find()
       
    } else {
        return res.status(500).json({
            message: "Please do signup first"
        })
    }
})

router.get('/getUsers', async (req, res, next) => {
    //  console.log(req);
    const users = await User.find({ isUserVerified: true }).select('email contactNo team')

    //console.log("coming at then");
    if (users) {
        return res.status(200).json({
            message: "User list retrived successfully",
            user: users
            // otp: otpGenerated
        });
        // let today = new Date();
        }else{
            return res.status(500).json({
                message: "Something went wrong",
            }) 
        }
})


module.exports = router;