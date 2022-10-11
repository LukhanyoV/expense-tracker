module.exports = (db) => {
    const lower = str => str.toLowerCase()
    const title = str => str.toLowerCase().replace(/./, c=>c.toUpperCase())

    const findUserByEmail = async (email) => {
        return await db.oneOrNone("SELECT * FROM users WHERE email = $1", [lower(email)])
    }

    const loginUser = async ({email, password}) => {
        const results = await findUserByEmail(email)
        if(results === null) return false
        return await db.oneOrNone("SELECT firstname, lastname, email FROM users WHERE email = $1 AND password = $2", [email, password])
    }

    const createNewUser = async ({firstname, lastname, email, password}) => {
        const results = await findUserByEmail(email)
        if(results !== null) return false
        return await db.none("INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)", [title(firstname), title(lastname), lower(email), password])
    }

    const addNewExpense = async ({email, amount, category, date}) => {
        let user = await findUserByEmail(email)
        return await db.none("INSERT INTO expenses (user_id, category_id, amount, date) VALUES ($1, $2, $3, $4)", [user.id, category, amount, date])
    }

    const getCategories = async () => {
        return await db.manyOrNone("SELECT * FROM categories")
    }

    const getExpenses = async (email, date) => {
        let user = await findUserByEmail(email)
        return await db.manyOrNone("SELECT category, amount, date FROM expenses AS e INNER JOIN users AS u ON u.id = e.user_id INNER JOIN categories AS c ON c.id = e.category_id WHERE e.user_id = $1 AND e.date >= $2 ORDER BY e.date DESC", [user.id, date])
    }

    const checkYesterday = async (yesterday, user_id) => {
        return await db.manyOrNone("SELECT * FROM expenses WHERE date = $1 AND user_id = $2", [yesterday, user_id])
    }

    return {
        findUserByEmail,
        loginUser,
        createNewUser,
        addNewExpense,
        getCategories,
        getExpenses,
        checkYesterday
    }
}