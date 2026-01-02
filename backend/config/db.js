let mongoose = require("mongoose")


let connected = () => {
    mongoose.connect(process.env.MONGO_DB).then(() => {
        console.log("Your Db Is Connected");

    })
}

module.exports = connected;