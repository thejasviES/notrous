const express = require("express");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const factory = require("./handlerFactory");


//here we are filtering the element like(admit ,and other sentitive field ) and only allowing the few fields that is (allowedFields)
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    //here we are loping through the obj and finding the alements of allweod fields and is found copying to new obj with same key value pair at the end we are sending this new object
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}
// to get all infromation of the current user
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// exports.getallUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();


//     res.status(200).json({
//         status: "succes",
//         result: users.length,
//         data: {
//             users
//         }
//     })
// })

exports.updateMe = catchAsync(async (req, res, next) => {
    //1) create an error if user post password
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("this is not for password updation .please use/updateMyPassword", 400))
    }

    //2)filtered out the unwanted fiels that are not allowed to be updated and  update the document
    const filteredBody = filterObj(req.body, "name", "email");
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "sucess",
        data: {
            user: updateUser
        }
    })
})
//here we are not explictly deleting it but setting propert active to false
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: "sucess",
        data: {
            message: "deleted"
        }
    })
})

exports.getUser = factory.getOne(User);
exports.getallUsers = factory.getAll(User);
//Do not update passwords with this
exports.updateUsers = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.creatUsers = (req, res) => {

    res.status(404).json({
        status: "fail",
    })
}
//only admin can delete the user ,if user it self want to delete the active propert set to false but
//-all the property are still available in the datat base
