// this does not work at all, fix

function getTime() {
let loggingTime = new Date
let logTimeYear = loggingTime.getFullYear(); logTimeMonth = pad(loggingTime.getMonth()); logTimeDay = pad(loggingTime.getDate()); // YYYY/MM/DD
let logTimeHours = pad(loggingTime.getHours()); logTimeMinutes = pad(loggingTime.getMinutes()); logTimeSeconds = pad(loggingTime.getSeconds()) //HH:MM:SS
let logTimeDate = logTimeYear + "/" + logTimeMonth + "/" + logTimeDay
let logTimeTime = logTimeHours + ":" + logTimeMinutes + ":" + logTimeSeconds
let logTimeFull = logTimeDate + " " + logTimeTime + " | "
return logTimeFull.toString()
}

function pad(num) {
    if(num < 10) {
        num = "0" + num
        return num
    } else {
        return num
    }
}

module.exports = getTime()
