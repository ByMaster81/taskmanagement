import {body} from "express-validator";

export const validateUserName = [
    
    body("name")
        .isEmpty()
        .withMessage('Name cant be empty')
        .isString()
        .withMessage("Name must be string")
        .custom(value => {
            if (value.trim().split(/\s+/).length < 2){
                throw new Error("Name and surname must contains at least 2 words")
            }
            return true;
        })        
];


export const validateEmail = [
    body("email")
        .isEmpty()
        .withMessage('Email cant be empty')
        .isString()
        .withMessage("Email info must be string")
        .isEmail()
        .withMessage("Invalid email info")
];


