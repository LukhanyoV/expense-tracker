const ShortUniqueId = require("short-unique-id")
const uid = new ShortUniqueId({ length: 10 });

module.exports = (expenseService) => {
    const whole = n => n>10?n:"0"+n
    return {
        getIndex: (req, res) => {
            res.render("index")
        },
        postIndex: async (req, res) => {
            try {
                let {email} = req.body
                const user = {...req.body}
                const verify = await expenseService.loginUser(user)
                if(verify === false){
                    req.flash("error", "Email address does not exist")
                    res.redirect("back")
                } else if(verify === null){
                    req.flash("error", "Password is incorrect")
                    res.redirect("back")
                } else {
                    const user = await expenseService.findUserByEmail(email)
                    res.redirect(`/add_expense/${user.firstname}`)
                }
            } catch (error) {
                console.log(error.stack)
                req.flash("error", "Account login failed")
                res.redirect("back")
            } 
        },
        getRegister: (req, res) => {
            res.render("register")
        },
        postRegister: async (req, res) => {
            try {
                const user = {...req.body, password: uid()}
                const added = await expenseService.createNewUser(user)
                if(added === false){
                    req.flash("error", "Email address has already been taken")
                } else {
                    req.flash("success", "Account registered successfully, password is "+user.password)
                }
            } catch (error) {
                console.log(error.stack)
                req.flash("error", "Account creation failed")
            }
            res.redirect("back")
        },
        getAddExpense: async (req, res) => {
            let {name} = req.params
            let categories = await expenseService.getCategories()
            let d = new Date()
            res.render("add_expense", {
                name,
                categories,
                maxDate: `${d.getFullYear()}-${whole(d.getMonth()+1)}-${whole(d.getDate())}`
            })
        },
        postAddExpense: async (req, res) => {
            try {
                await expenseService.addNewExpense(req.body)
                req.flash("success", "Expense has been added")
            } catch (error) {
                console.log(error.stack)
                req.flash("error", "An error occured while adding expense")
            } finally {
                res.redirect("back")
            }
        },
        getExpenses: async (req, res) => {
            let {name} = req.params

            let d = new Date()
            // last 30 days
            d.setDate(d.getDate()-7)
            let date = `${d.getFullYear()}-${whole(d.getMonth()+1)}-${whole(d.getDate())}`

            let expenses = await expenseService.getExpenses(name, date)
            // get the categories
            let categories = await expenseService.getCategories()

            // map the expenses
            let expensesMap = {}

            // initialize the categories as 0
            categories.forEach(category => {
                if(expensesMap[category.category] === undefined){
                    expensesMap[category.category] = 0
                }
            })

            // loop through the expenses and add to the map
            expenses.forEach(expense => {
                expensesMap[expense.category] += expense.amount
            })

            res.render("expense", {
                name,
                expenses: expensesMap,
                duration: `Weekely`
            })
        },
        postExpense: async (req, res) => {
            let {name, days: n} = req.body
            let d = new Date()

            // last n days
            d.setDate(d.getDate()-(n||30))

            let date = `${d.getFullYear()}-${whole(d.getMonth()+1)}-${whole(d.getDate())}`

            // get the expenses
            let expenses = await expenseService.getExpenses(name, date)
            // get the categories
            let categories = await expenseService.getCategories()

            // map the expenses
            let expensesMap = {}

            // initialize the categories as 0
            categories.forEach(category => {
                if(expensesMap[category.category] === undefined){
                    expensesMap[category.category] = 0
                }
            })

            // loop through the expenses and add to the map
            expenses.forEach(expense => {
                expensesMap[expense.category] += expense.amount
            })

            res.render("expense", {
                name,
                expenses: expensesMap,
                duration: `${n} days`
            })
        },
        getExpense: async (req, res) => {
            let {name} = req.params

            let d = new Date()
            // last 30 days
            d.setDate(d.getDate()-7)
            let date = `${d.getFullYear()}-${whole(d.getMonth()+1)}-${whole(d.getDate())}`

            let expenses = await expenseService.getExpenses(name, date)

            res.render("expenses", {
                expenses,
                name
            })
        }
    }
}