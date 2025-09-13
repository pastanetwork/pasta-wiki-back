const Joi = require('joi');

const minUsernameChar = 4
const maxUsernameChar = 32
const maxEmailChar = 32

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(minUsernameChar).max(maxUsernameChar).required(),
    email: Joi.string().email().max(maxEmailChar).required(),
    password: Joi.string().min(8).regex(/[A-Z]/, 'need-upper-case').regex(/[a-z]/, 'need-lower-case').regex(/[^\w]/, 'need-special character').regex(/[0-9]/, "need-number").required(),
});

module.exports = { registerSchema };