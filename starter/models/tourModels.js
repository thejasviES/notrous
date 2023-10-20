const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("./userModel");
//const validator = require("validator");
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "atour must have a name"],
        unique: true,
        trim: true,
        //validate: [validator.isAlpha, "tour name must contain alphabates only"]
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "a tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficult"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "difficulty is either :easy,medium,difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, "cant have more than 5"],
        min: [1, "cant have less than 1"],
        //making sure that  the avg rating should be of having only one digit after (.) that is like (4.6)(3.5)
        //this like small trick
        set: val => Math.round(val * 10) / 10,

    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //this only work on current doc thats creating not on updating
                return val < this.price;
            },
            message: "discount cant greater than the price"
        }


    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A tour must have description"]
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have cover image"]
    },
    images: [String],

    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secrectTour: {
        type: Boolean,
        default: false
    },
    slug: String,
    //geo stational property
    startLocation: {
        //GeoJson
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    //document inside an document (always start off with "["  and ends with "]")
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],

    guides: [
        {
            type: mongoose.Schema.ObjectId,
            //this is reference to other model(user model)
            ref: "User"
        }
    ]
},
    //to set virtual function run or active
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

//applying index for the price and soo on (1 means sort in assending order -1 means sort in decending order)
//to increeases the performence 
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
//virtual populate(that is populating the reviews without even storeing here)
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});
//mongoose middleware
//Document middleware :runs before .save( ) and .create()
//pre save middleware
tourSchema.pre('save', function (next) {
    //console.log(this);
    this.slug = slugify(this.name, { lower: true });
    next();
});
// //post save middleware
// //
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// })
//embeeding the guides to tours 
// tourSchema.pre("save", async function (next) {
//     const guidesPromises = this.guides.map(async id => User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });
//query middle wares
// //here the populate populates the guides (which are saved as and user id) to there full details
//this is mongoose thing(populate function)
tourSchema.pre(/^find/, function (next) {
    this.populate({
        //here the path where we specify with propert of the document sholud be populated 
        path: "guides",
        //this will deselect the __v and passwordChangedAt

        select: "-__v -passwordChangedAt"
    });

    next();
})

//filters the SecrectTour
tourSchema.pre(/^find/, function (next) {
    //tourSchema.pre('find', function (next) {
    this.find({ secrectTour: { $ne: true } });
    next();
})

//aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secrectTour: { $ne: true } } });
//     next();
// })

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
