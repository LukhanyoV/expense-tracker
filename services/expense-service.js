module.exports = (db) => {
    const findUserByName = async (name) => {
        return await db.oneOrNone("SELECT * FROM users WHERE firstname = $1", [name])
    }

    const findUserByEmail = async (email) => {
        return await db.oneOrNone("SELECT * FROM users WHERE email = $1", [email])
    }

    const loginUser = async ({email, password}) => {
        const results = await findUserByEmail(email)
        if(results === null) return false
        return await db.oneOrNone("SELECT firstname, lastname, email FROM users WHERE email = $1 AND password = $2", [email, password])
    }

    const createNewUser = async ({firstname, lastname, email, password}) => {
        const results = await findUserByEmail(email)
        if(results !== null) return false
        return await db.none("INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)", [firstname, lastname, email, password])
    }

    const addNewExpense = async ({name, amount, category, date}) => {
        let user = await findUserByName(name)
        return await db.none("INSERT INTO expenses (user_id, category_id, amount, date) VALUES ($1, $2, $3, $4)", [user.id, category, amount, date])
    }

    const getCategories = async () => {
        return await db.manyOrNone("SELECT * FROM categories")
    }

    const getExpenses = async (name, date) => {
        let user = await findUserByName(name)
        return await db.manyOrNone("SELECT category, amount, date FROM expenses AS e INNER JOIN users AS u ON u.id = e.user_id INNER JOIN categories AS c ON c.id = e.category_id WHERE e.user_id = $1 AND e.date >= $2 ORDER BY e.date DESC", [user.id, date])
    }

    return {
        findUserByName,
        findUserByEmail,
        loginUser,
        createNewUser,
        addNewExpense,
        getCategories,
        getExpenses
    }
}