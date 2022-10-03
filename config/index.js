const {
    DATABASE_URL
} = require("../config.json")

module.exports = require("pg-promise")({})({
    connectionString: DATABASE_URL
})