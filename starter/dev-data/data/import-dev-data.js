const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
//const app = require("./app");
dotenv.config({ path: './config.env' });
const Tour = require("./../../models/tourModels");
const Review = require("./../../models/reviewModel");
const User = require("./../../models/userModel");
//console.log(process.env.DATABASE);


//console.log(DB);
const DB = process.env.DATABASE.replace(
    `<password>`,
    process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {
    useNewUrlParser: true,
    usercreatedIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    // console.log(con.connections);
    console.log("db connected");
});

//READE JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));


//IMPORT DATA INTO DATABASE

const importdata = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);

        console.log("data loaded");
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

const deletedata = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log("data deleted");
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv[2] === "--import") {
    importdata()
}
else if (process.argv[2] === "--delete") {
    deletedata()
}

console.log(process.argv);