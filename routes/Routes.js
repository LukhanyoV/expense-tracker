const ShortUniqueId = require("short-unique-id")
const uid = new ShortUniqueId({ length: 10 });

const {lastSunday, nextSaturday, formatDate} = require("./dates.js")()

const calculateAvg = items => {
    let avg = 0;
    for(const item of items){
        avg += item.amount
    }
    return avg / items.length
}

module.exports = (expenseService) => {
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
                    req.session.user = user
                    res.redirect(`/add_expense`)
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
            const {user} = req.session
            let {firstname: name} = user
            let categories = await expenseService.getCategories()
            let d = new Date()

            res.render("add_expense", {
                name,
                categories,
                minDate: formatDate(lastSunday(d)),
                maxDate: formatDate(nextSaturday(d))
            })
        },
        postAddExpense: async (req, res) => {
            try {
                let verify = Object.values(req.body)
                let today = new Date(req.body.date)
                let check = today.getDay() == 0
                let yesterday = new Date(today.setDate(today.getDate()-1))
                // sunday is the start of the week do not check
                let condition = await expenseService.checkYesterday(formatDate(yesterday), req.session.user.id)

                if(verify.length !== 3){
                    req.flash("error", "Please fill in all the fields")
                } else if(condition.length == 0 && !check) {
                    req.flash("error", "Missing entry for "+formatDate(yesterday))
                } else {
                    await expenseService.addNewExpense({...req.body, email: req.session.user.email})
                    req.flash("success", "Expense has been added")
                }
            } catch (error) {
                console.log(error.stack)
                req.flash("error", "An error occured while adding expense")
            } finally {
                res.redirect("back")
            }
        },
        getExpenses: async (req, res) => {
            const {user} = req.session
            let {email} = user

            let d = new Date()

            d.setDate(d.getDate()-7)
            let date = formatDate(d)

            let expenses = await expenseService.getExpenses(email, date)
            // get the categories
            let categories = await expenseService.getCategories()

            // map the expenses
            let expensesMap = {}

            // initialize the categories as 0
            categories.forEach(category => {
                if(expensesMap[category.category] === undefined){
                    let obj = {
                        expenses: [],
                        amount: 0
                    }
                    expensesMap[category.category] = obj
                }
            })
            // loop through the expenses and add to the map
            expenses.forEach(expense => {
                expensesMap[expense.category].amount += expense.amount
                expensesMap[expense.category].expenses.push(expense)
            })

            res.render("expense", {
                expenses: expensesMap,
                duration: `Weekely`,
                helpers: {
                    formatDate: date => new Date(date).toDateString()
                }
            })
        },
        postExpense: async (req, res) => {
            const {user} = req.session
            let {email} = user

            let {days: n} = req.body
            let d = new Date()

            // last n days
            d.setDate(d.getDate()-(n||30))

            let date = formatDate(d)

            // get the expenses
            let expenses = await expenseService.getExpenses(email, date)
            // get the categories
            let categories = await expenseService.getCategories()

            // map the expenses
            let expensesMap = {}

            // initialize the categories as 0
            categories.forEach(category => {
                if(expensesMap[category.category] === undefined){
                    let obj = {
                        expenses: [],
                        amount: 0
                    }
                    expensesMap[category.category] = obj
                }
            })
            // loop through the expenses and add to the map
            expenses.forEach(expense => {
                expensesMap[expense.category].amount += expense.amount
                expensesMap[expense.category].expenses.push(expense)
            })

            res.render("expense", {
                expenses: expensesMap,
                duration: `${n} days`,
                helpers: {
                    formatDate: date => new Date(date).toDateString()
                }
            })
        },
        getExpense: async (req, res) => {
            const {user} = req.session
            let {email} = user

            let d = new Date()

            d.setDate(d.getDate()-30)
            let date = formatDate(d)

            let expenses = await expenseService.getExpenses(email, date)

            res.render("expenses", {
                expenses,
                helpers: {
                    formatDate: date => new Date(date).toDateString()
                }
            })
        },
        getChart: async (req, res) => {
            const {user} = req.session
            let {email} = user

            let d = new Date()

            d.setDate(d.getDate()-30)
            let date = formatDate(d)

            let expenses = await expenseService.getExpenses(email, date)
            // get the categories
            let categories = await expenseService.getCategories()

            // map the expenses
            let expensesMap = {}

            // initialize the categories as 0
            categories.forEach(category => {
                if(expensesMap[category.category] === undefined){
                    let obj = {
                        expenses: [],
                        amount: 0,
                        average: 0
                    }
                    expensesMap[category.category] = obj
                }
            })
            // loop through the expenses and add to the map
            expenses.forEach(expense => {
                expensesMap[expense.category].amount += expense.amount
                expensesMap[expense.category].expenses.push(expense)
                expensesMap[expense.category].average = calculateAvg(expensesMap[expense.category].expenses)
            })
            res.render("chart", {
                expensesMap: JSON.stringify(expensesMap),
                duration: "Monthly"
            })
        },
        getWeekChart: async (req, res) => {
            const {user} = req.session
            let {email} = user

            let d = new Date()

            d.setDate(d.getDate()-7)
            let date = formatDate(d)

            let expenses = await expenseService.getExpenses(email, date)
            // get the categories
            let categories = await expenseService.getCategories()

            // map the expenses
            let expensesMap = {}

            // initialize the categories as 0
            categories.forEach(category => {
                if(expensesMap[category.category] === undefined){
                    let obj = {
                        expenses: [],
                        amount: 0,
                        average: 0
                    }
                    expensesMap[category.category] = obj
                }
            })
            // loop through the expenses and add to the map
            expenses.forEach(expense => {
                expensesMap[expense.category].amount += expense.amount
                expensesMap[expense.category].expenses.push(expense)
                expensesMap[expense.category].average = calculateAvg(expensesMap[expense.category].expenses)
            })
            res.render("chart", {
                expensesMap: JSON.stringify(expensesMap),
                duration: "Weekly"
            })
        },
        userLogout: (req, res) => {
            req.session.destroy()
            res.redirect("/")
        }
    }
}