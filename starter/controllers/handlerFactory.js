const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures")

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    // console.log(req.params.id);
    //here model means which type of database model (User,Tour,Review)

    const doc = await Model.findByIdAndDelete(req.params.id);
    // console.log(doc);
    if (!doc) {

        return next(new AppError("no document found with that id", 404))
    }
    next();
    res.status(204).json({
        status: "success",
    })

    // try {
    // }
    // catch (err) {
    //     res.status(404).json({
    //         status: "failed",
    //         message: err
    //     })
    // }

});

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError("No deocument found with that id", 404))
    }

    res.status(201).json({
        status: "sucess",
        data: {
            data: doc
        }
    })
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) {
        return next(new AppError("cant create...!", 404))
    }

    res.status(201).json({
        status: "sucess",
        data: {
            doc: doc
        }
    })

});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions)
    // const doc = await Model.findById(req.params.id).populate("reviews");
    const doc = await query;
    if (!doc) {
        return next(new AppError("No document  found with that id", 404))
    }

    res.status(200).json({
        status: "success",

        data: {
            doc: doc

        }
    })
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    //here we taking all the  reviews for particular tour (this for review controler function only)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitfield().pagination();
    const doc = await features.query;
    //SEND RESPONSE
    res.status(200).json({
        status: "success",
        result: doc.length,
        data: {
            doc: doc
        }
    })
});