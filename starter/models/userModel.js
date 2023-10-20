const mongoose = require("mongoose");
const validator = require("validator");
//for encyption of password
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "username required...!"],
        unique: true
    },
    email: {
        type: String,  // email is unique and not empty
        required: [true, "must have email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "please provide a valid email"]
    },

    photo: String,
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "please provide a password"],
        minlength: 8,
        //this will not show the password 
        select: false
    },

    passwordConfirm: {
        type: String,
        required: [true, "please confirm a password"],
        //this validation works when the cretate() or save() called
        //that is doesnt work for updateing the password
        validate: {
            //if validator set tu
            validator: function (el) {
                return el === this.password;

            },
            message: "password didnt match"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

//middleware for encrypting the password beforre saving it into the database
userSchema.pre("save", async function (next) {
    //we dont want to encrypt the password while updating only the email soo...
    if (!this.isModified("password"))
        return next();
    //if not updating that is creating the new user or changing the password
    //hash the passowrd before saving it to database
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    // this.passwordChangedAt = new Date();
    next();
})


userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew)
        return next();
    //we are store 1 second early(past) because saving takes time mongodb
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//query middleware this will filter all the documnets that having property active set true 
//here active means account not deleted
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();

})
//instance method will available in all the documents in a collection
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    //this will automatically encrypt the password(candidate password) and compare with the userPassword
    return await bcrypt.compare(candidatePassword, userPassword);
}
//instance method for checking the password changed or not
userSchema.methods.ChangedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
       // console.log(JWTTimestamp, changedTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    //false means not changed
    return false
}
//instance method
userSchema.methods.ChangedPasswordResetToken = async function () {

    const resetToken = crypto.randomBytes(32).toString("hex");
    //just encypting kind of thing is done with sha256 algorithm
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");


    // console.log("hi" + this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;//expires in 10 minutes
    // console.log("hlo" + this.passwordResetExpires);
    return resetToken;


};

const User = mongoose.model("User", userSchema);

module.exports = User;