const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: './config.env' });
process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log("UNHANDLED Exception.....")
    server.close(() => {
        process.exit(1);
    });
})

//console.log(process.env.DATABASE);



const DB = process.env.DATABASE.replace(
    `<password>`,
    process.env.DATABASE_PASSWORD
);

console.log(DB);

mongoose.connect(DB, {
    useNewUrlParser: true,
    usercreatedIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    // console.log(con.connections);
    console.log("database connected.....");
});



const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log("app running...");
});


//unhandeled error are handled here
process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION.....")
    server.close(() => {
        process.exit(1);
    });
});
//
