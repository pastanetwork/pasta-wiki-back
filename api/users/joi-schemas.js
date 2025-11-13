const Joi = require('joi');

const minUsernameChar = 5
const maxUsernameChar = 32
const maxEmailChar = 32

const username_validation = Joi.string().alphanum().min(minUsernameChar).max(maxUsernameChar).required();
const email_validation = Joi.string().email().max(maxEmailChar).required();
const password_validation = Joi.string().min(8).regex(/[A-Z]/, 'need-upper-case').regex(/[a-z]/, 'need-lower-case').regex(/[^\w]/, 'need-special character').regex(/[0-9]/, "need-number").required();

const registerSchema = Joi.object({
    username: username_validation,
    email: email_validation,
    password: password_validation,
});

const usernameSchema = Joi.object({
    username:username_validation
});

const emailSchema = Joi.object({
    email:email_validation
});

const passwordSchema = Joi.object({
    password:password_validation
});

module.exports = { registerSchema, usernameSchema, emailSchema, passwordSchema };