const pg = require('pg');
const { Pool, Client } = pg;
const { postgres_values } = require("./env-values-dictionnary")

const pool = new Pool({
    user: postgres_values.user,
    password: postgres_values.password,
    host: postgres_values.host,
    port: postgres_values.port,
    database: postgres_values.database,
    searchPath: ['public']
});

const client = new Client({
    user: postgres_values.user,
    password: postgres_values.password,
    host: postgres_values.host,
    port: postgres_values.port,
    database: postgres_values.database,
    searchPath: ['public']
});

(async () => {
    await client.connect();
    await client.end();
})();

module.exports = { pool, client };
