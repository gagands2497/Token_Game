const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const sequalize = require('sequelize');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('../Model/User');


module.exports.register = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error("validation failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error
    }
    const email = req.body.email_id;
    const name = req.body.name;
    const password = req.body.password;
    // we need to validate the data in routes
    bcrypt
        .hash(password, 12)
        .then(hashpw => {
            User.create({
                email_id: email,
                password: hashpw,
                name: name
            }).then(resData => {
                res.status(201).json({
                    // data: resData,
                    message: "Registered"
                })
            }).catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                    // Internal server error
                }
                next(err);
            })
        }).catch(err => {
            if (!err.statusCode) {

                err.statusCode = 500;
                // internal server error
            }
            if (!err.data) {
                err.data = [{
                    msg: err.message ? err.message : "Internal Server Error"
                }]
            }
            next(err);
        })
}



module.exports.login = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error("validation failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error
    }
    console.log(req.body);
    const email = req.body.email_id;
    const password = req.body.password;
    User.findOne({ where: { email_id: email } })
        .then(user => {

            if (!user) {
                const error = new Error("User not found Please register first");
                error.statusCode = 404;
                error.data = [{
                    msg: "User not found Please register first",
                }];
                throw error;
            }
            else {
                return bcrypt.compare(password, user.password);
            }
        })
        .then(same => {
            if (!same) {
                const error = new Error("Wrong password");
                error.statusCode = 401;
                error.data = [{
                    msg: "Wrong Password"
                }]
                throw error;
            } else {
                const time = 24 * 60 * 60 * 1000;
                const token = jwt.sign({
                    email_id: email,
                    userType: "student"
                }, "secret_key", { expiresIn: time });
                res.status(201).json({
                    Access_Token: token,
                    message: "Login Student success"
                })
            }
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            if (!err.data) {
                err.data = [{
                    msg: err.message ? err.message : "Internal Server Error"
                }]
            }
            next(err);
        })
}
