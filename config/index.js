module.exports = require("pg-promise")({})({
    connectionString: process.env.DATABASE_URL || "postgres://mlnhywqb:rKEJA0pxA9Q0vjfWDwXE7S0q7oe994rR@jelani.db.elephantsql.com/mlnhywqb"
})