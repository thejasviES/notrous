const express = require("express");
const AppError = require("./../utils/appError");
const Tour=require("./../models/tourModels");
const catchAsync=require("./../utils/catchAsync");

exports.getOverview=catchAsync(async(req,res,next)=>{
    //1 get tour data from collection
const tours =await Tour.find();
    //2 build templete

    //3 render that templete using tour data from 1
    res.status(200).render("overview",{
        title:"all tours",
        tours
    })
})

exports.getTour=catchAsync(async (req,res,next)=>{

    const tour =await Tour.findOne({slug:req.params.slug}).populate({
        path:"reviews",
        fields:"review ratings user"
    });
   // console.log(tour.user[]);
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
      }
    res.status(200).render("tour",{
        title:`${tour.name} Tour`,
        tour
    });
})

exports.login=(req,res)=>{
res.status(200).render("login",{
    title:"Log into your account"
});
}

exports.about=(req,res)=>{
    res.status(200).render("about",{
        title:"Log into your account"
    });
    }