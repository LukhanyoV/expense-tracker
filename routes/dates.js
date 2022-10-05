module.exports = () => {
    const lastSunday = date => {
        for (let i = 0; i < 7; i++) {
            date.setDate(date.getDate() - i)
            if (date.getDay() == 0) {
                return date
            }
        }
    }

    const nextSaturday = date => {
        for (let i = 0; i < 7; i++) {
            date.setDate(date.getDate() + i)
            if (date.getDay() == 6) {
                return date
            }
        }
    }

    const formatDate = date => {
        const whole = n => n>9?n:"0"+n
        return `${date.getFullYear()}-${whole(date.getMonth()+1)}-${whole(date.getDate())}`
    }

    return {
        lastSunday,
        nextSaturday,
        formatDate
    }
}