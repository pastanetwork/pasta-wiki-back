require('dotenv').config();

// Values from .env file

const express_values = {
    port : process.env.EXPRESS_PORT,
    public_route : process.env.EXPRESS_PUBLIC_ROUTE

}

const postgres_values = {
    user : process.env.POSTGRES_USER,
    password : process.env.POSTGRES_PASSWORD,
    host : process.env.POSTGRES_HOST,
    port : process.env.POSTGRES_PORT,
    database : process.env.POSTGRES_DATABASE
}

const jwt_values = {
    secret : process.env.JWT_SECRET
}

module.exports = { express_values, postgres_values, jwt_values }