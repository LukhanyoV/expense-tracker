module.exports = () => {
    const lastSunday = (date = new Date()) => {
        const previousMonday = new Date();

        previousMonday.setDate(date.getDate() - date.getDay());

        return previousMonday;
    }

    const nextSaturday = (date = new Date()) => {
        const dateCopy = new Date(date.getTime());

        const next = new Date(
            dateCopy.setDate(
                dateCopy.getDate() + ((7 - dateCopy.getDay() + 6) % 7 || 7),
            ),
        );

        return next;
    }

    const formatDate = date => {
        const whole = n => n > 9 ? n : "0" + n
        return `${date.getFullYear()}-${whole(date.getMonth() + 1)}-${whole(date.getDate())}`
    }

    return {
        lastSunday,
        nextSaturday,
        formatDate
    }
}