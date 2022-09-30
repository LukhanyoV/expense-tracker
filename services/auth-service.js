module.exports = () => {
    const isLoggedIn = (req, res, next) => {
        if(!req.session.user){
            res.redirect("/")
            return
        }
        next()
    }

    const isNotLoggedIn = (req, res, next) => {
        if(req.session.user){
            res.redirect("/add_expense")
            return
        }
        next()
    }

    return {
        isLoggedIn,
        isNotLoggedIn
    }
}