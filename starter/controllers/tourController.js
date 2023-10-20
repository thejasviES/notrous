const express = require("express");
const Tour = require("./../models/tourModels");
//const AppError = require("./../utils/appError");
const AppError = require("./../utils/appError");
//const router = express.Router();
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// const catchAsync = fn => {
//     return (req, res, next) => {
//         fn(req, res, next).catch(next);
//     }
// }


//alias routing
//this is middleware

exports.gettopfive = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    console.log("hi");
    next();
}


exports.gettour = factory.getOne(Tour, { path: "reviews" });

// exports.gettour = catchAsync(async (req, res, next) => {
//     // console.log(req.params.id);

//     const tour = await Tour.findById(req.params.id).populate("reviews");
//     if (!tour) {
//         return next(new AppError("no tour found with that id", 404))
//     }

//     res.status(200).json({
//         status: "success",

//         data: {
//             tour: tour

//         }
//     })
// try {

// }
// catch (err) {
//     res.status(404).json({
//         status: "fail",
//         message: "couldnt find that id"
//     })
// }

//});

exports.getalltour = factory.getAll(Tour);
// exports.getalltour = catchAsync(async (req, res, next) => {

//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitfield().pagination();
//     const tours = await features.query;
//     //SEND RESPONSE
//     res.status(200).json({
//         status: "success",
//         result: tours.length,
//         data: {
//             tours
//         }
//     })
//     // try {

//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: "failed",
//     //         message: err
//     //     })
//     // }
// });


exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     if (!newTour) {
//         return next(new AppError("cant create...!", 404))
//     }

//     res.status(201).json({
//         status: "sucess",
//         data: {
//             tour: newTour
//         }
//     })

//     // try {

//     // }
//     // catch (err) {
//     //     res.status(400).json({
//     //         status: "failed",
//     //         message: err
//     //     })
//     // }
// });
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     })
//     if (!tour) {
//         return next(new AppError("no tour found with that id", 404))
//     }

//     res.status(201).json({
//         status: "sucess",
//         data: {
//             tour: tour
//         }
//     })
// try {

// }
// catch (err) {
//     res.status(404).json({
//         status: "failed",
//         message: err
//     })
// }

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     // console.log(req.params.id);
//     const tour = await Tour.deleteOne({ _id: req.params.id });

//     if (!tour) {
//         return next(new AppError("no tour found with that id", 404))

//     }

//     res.status(201).json({
//         status: "sucess",
//         data: {
//             tour: tour
//         }
//     })
//     // try {

//     // }
//     // catch (err) {
//     //     res.status(404).json({
//     //         status: "failed",
//     //         message: err
//     //     })
//     // }
//     next();
// });
//Agregation function
exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numtours: { $sum: 1 },
                avrrating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },

            }
        },
        {

            $sort: { avgPrice: 1 }
        }
    ]);
    res.status(200).json({
        status: 'sucess',
        data: {
            stats
        }
    });
    // try {

    // } catch (err) {
    //     res.status(404).json({
    //         status: "failed",
    //         message: err
    //     })
    // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        }, {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {

        },
        {
            $addFields: { month: '$_id' }
        }, {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        }, {

            $limit: 12
        }

    ]);
    res.status(200).json({
        status: 'sucess',
        data: {
            plan
        }
    });
    // try {

    // } catch (err) {
    //     res.status(404).json({
    //         status: "failed",
    //         message: err
    //     })

    // }

});
//getting the tours within the range
exports.getToursWithin = catchAsync(async (req, res, next) => {
    //destructuring
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    //
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
    //


    if (!lat || !lng) {
        next(new AppError("please provide latitude and longitude in the format lat,lng", 400))
    }
    console.log(distance, lat, lng, unit, radius);
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
    res.status(200).json({
        status: "sucess",
        results: tours.length,
        data: {
            data: tours
        }
    })
})
exports.getDistences = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    //
    //
    const multiplier = unit === "mi" ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(new AppError("please provide latitude and longitude in the format lat,lng", 400))
    }
    const distances = await Tour.aggregate([{
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [lng * 1, lat * 1]
            },
            distanceField: "distance",
            distanceMultiplier: multiplier
        }
    }, {//to display only distnce and name of the tour
        $project: {
            distance: 1,
            name: 1
        }
    }])

    res.status(200).json({
        status: "sucess",

        data: {
            data: distances
        }
    })
})