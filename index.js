const express = require("express")
const exphbs = require("express-handlebars")
const session = require("express-session")
const flash = require("express-flash")
const path = require("path")
const app = express()

const db = require("./config")

app.engine("handlebars", exphbs.engine({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

///
app.use(session({
    secret: "mycatwalkedonmykeyboard",
    resave: false,
    saveUninitialized: false
}))
app.use(flash())
////

const expenseService = require("./services/expense-service")(db)
const routes = require("./routes/Routes")(expenseService)

app.get("/", routes.getIndex)
app.post("/login", routes.postIndex)

app.get("/register", routes.getRegister)
app.post("/register", routes.postRegister)

app.get("/add_expense/:name", routes.getAddExpense)
app.post("/add_expense/:name", routes.postAddExpense)

app.get("/expenses/:name", routes.getExpenses)
app.post("/expenses/:name", routes.postExpense)

app.get("/expense/:name", routes.getExpense)

module.exports = app