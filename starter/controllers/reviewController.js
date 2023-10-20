const AppError = require("./../utils/appError");
const Review = require("./../models/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");


exports.createReview = catchAsync(async (req, res, next) => {
    //if any fields not in schema of database then they are simply ignored during creation if we use req.use.body as parameter to create 
    //allowing nested routes
    if (!req.body.tour) {
        //if no tour id coming in body then assgin req.params.tourId to it which basically coming from the url
        req.body.tour = req.params.tourId
    }
    if (!req.body.user) {
        //this comming from protect
        req.body.user = req.user.id;
    }
    const newReview = await Review.create(req.body);
    if (!newReview) {
        return next(new AppError("cant create..!", 404))
    }

    res.status(201).json({
        status: "sucess",
        data: {
            tour: newReview
        }
    })

})

// exports.getAllReview = catchAsync(async (req, res, next) => {
//     let filter = {};
//     //here we taking all the  reviews for particular tour 
//     if (req.params.tourId) filter = { tour: req.params.tourId };
//     const reviews = await Review.find(filter)
//     if (!reviews) {
//         return next(new AppError("no reviews found ", 404))
//     }

//     res.status(201).json({
//         status: "sucess",
//         data: {
//             tour: reviews
//         }
//     })
// })

exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getAllReview = factory.getAll(Review);