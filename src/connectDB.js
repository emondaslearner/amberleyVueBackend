const mongoose = require('mongoose')
const url = 'mongodb+srv://database:database@cluster0.9pksi.mongodb.net/vueAmberley?retryWrites=true&w=majority'

const connectDB = () => {
    mongoose
    .connect(url)
    .then((data) => {
      console.log("Database Connection established", data.connection.host);
    })
    .catch((err) => {
      console.error(err.message);
    });
}

module.exports = connectDB;