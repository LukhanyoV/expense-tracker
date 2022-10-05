const express = require("express")
const exphbs = require("express-handlebars")
const session = require("express-session")
const flash = require("express-flash")
const path = require("path")
const app = express()

const db = require("./config/index")

app.engine("handlebars", exphbs.engine({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

///
app.use(session({
    store: new (require('connect-pg-simple')(session))({
        pgPromise: db
    }),
    secret: "mycatwalkedonmykeyboard",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 30*24*60*60*1000
    }
}))
app.use(flash())
////

const {isLoggedIn, isNotLoggedIn} = require("./services/auth-service")()
const expenseService = require("./services/expense-service")(db)
const routes = require("./routes/Routes")(expenseService)

app.get("/", isNotLoggedIn, routes.getIndex)
app.post("/login", isNotLoggedIn, routes.postIndex)

app.get("/register", isNotLoggedIn, routes.getRegister)
app.post("/register", isNotLoggedIn, routes.postRegister)

app.get("/add_expense", isLoggedIn, routes.getAddExpense)
app.post("/add_expense", isLoggedIn, routes.postAddExpense)

app.get("/expenses", isLoggedIn, routes.getExpenses)
app.post("/expenses", isLoggedIn, routes.postExpense)

app.get("/expense", isLoggedIn, routes.getExpense)

app.get("/logout", isLoggedIn, routes.userLogout)

// deta
module.exports = app

// heroku and local
// const PORT = process.env.PORT || 5000
// app.listen(PORT, console.log(`🚀 App now running at PORT: ${PORT}`))