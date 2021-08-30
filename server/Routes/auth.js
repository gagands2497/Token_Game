const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../Controller/authController')
const User = require('../Model/User')
router.post('/register',
    body('email_id')
        .trim()
        .isEmail()
        .withMessage("Please Enter a valid Email")
        .custom(value => {
            return User.findOne({ where: { email_id: value } }).then(stu => {
                if (stu) {
                    return Promise.reject('E-mail is already in use');
                }
            });
        })
    ,
    body('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be of greater than 8 chars"),
    body('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage("name cannot be empty")

    , authController.register)


router.post('/login',

    body('email_id')
        .trim()
        .isEmail()
        .withMessage("Not a valid Email"),
    body('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be of min lenght 8")
    , authController.login);

module.exports = router;
