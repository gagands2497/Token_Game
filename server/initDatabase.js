const database = require('./database');
const Sequelize = require('sequelize');
// A student can take multiple courses
// so therefore this is a one to many relation


module.exports.init = () => {
    // flag that force should be true or false
    database.sync({ force: true }).then(res => {
        console.log(" required database created ");
    }).catch(err => {
        console.log(err.message);
    })
}