const mongoose = require("mongoose");
const express = require("express");
//const User = require("./userModel");
const Tour = require("./tourModels");

const reviewSchema = mongoose.Schema({

    review: {
        type: String,
        require: [true, "review of the tour is required ...!"]
    },

    rating: {
        type: Number,
        // require: [true, 'Rating for this Tour is Required'],
        max: [5, "cant have more than 5"],
        min: [1, "cant have less than 1"]
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a tour"]
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user"]
    },

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//this make sure that same user cant give the review to same tour more than once
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    // console.log("hii");
    // this.populate({
    //     //here the path where we specify with propert of the document sholud be populated 
    //     path: "tour",
    //     select: "name"

    // });
    // this.populate({
    //     //here the path where we specify with propert of the document sholud be populated 
    //     path: "user",
    //     select: "name ,photo"
    // });

    this.populate({
        //here the path where we specify with propert of the document sholud be populated 
        path: "user",
        select: "name photo"
    });

    next();
})

//this is satatic function which will be called directly from the model 
reviewSchema.statics.calcAverageRatings = async function (tourid) {
    //here we are using aggregate 
    const stats = await this.aggregate([
        {
            $match: { tour: tourid }

        },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

   // console.log(stats);
    if (stats.lenght > 0) {
        await Tour.findByIdAndUpdate(tourid, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        })
    }
    else {
        await Tour.findByIdAndUpdate(tourid, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
}

//post cant have acces to next middleware for saving the ratings of particular tour
reviewSchema.post("save", function () {
    //this point to current review
    this.constructor.calcAverageRatings(this.tour)

})

//changing rating whene review is deleted and updated
//here this /^findOneAnd/ is called hook(s)
//here we cant use post insteaed of pre because we cant use "this" keyword 
reviewSchema.pre(/^findOneAnd/, async function (next) {
    //here we can get acces to the current review document
    //createing the variable on this document so that we can use it in the next middleware that is in the very next to it
    this.r = await this.findOne();
    // console.log(this.r);
    next();
})
//we are doing all this things just because by this time query will be executed we will not getting the document of that course 
reviewSchema.post(/^findOneAnd/, async function (next) {
    //this.findOne()  cant work here because query will be executed already here ...
    await this.r.constructor.calcAverageRatings(this.r.tour);
})
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;