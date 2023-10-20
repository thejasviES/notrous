const express = require("express");

const path = require("path");
//const helmet =require("helmet");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');

//to limit the rate that is brute force attack 
//const rateLimit = require("express-rate-limit");
//to add https(secure)

//to sanitise the mongodb query that possibly hack our website 
//const mongoSanitize = require("express-mongo-sanitize");
//to sanitise the html and javacript hack our website 
//const xss = require("xss-clean");
//to check the parameter pollution
//const hpp = require("hpp");
//const cors = require("cors");
//security HTTP headers middleware
const tourRouter = require("./starter/routes/tourRouters");
const viewRouter=require("./starter/routes/viewRouter");
const AppError = require("./starter/utils/appError");
const globalErrorHandler = require('./starter/controllers/errorController');
const usersRouter = require("./starter/routes/usersRouters");
const reviewRouter = require("./starter/routes/reviewRouter");

const app = express();

app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname + "/starter", "views"));
// const CSP = 'Content-Security-Policy';
// const POLICY =
//   "default-src 'self' https://*.mapbox.com ;" +
//   "base-uri 'self';block-all-mixed-content;" +
//   "font-src 'self' https: data:;" +
//   "frame-ancestors 'self';" +
//   "img-src http://localhost:8000 'self' blob: data:;" +
//   "object-src 'none';" +
//   "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
//   "script-src-attr 'none';" +
//   "style-src 'self' https: 'unsafe-inline';" +
//   'upgrade-insecure-requests;';

// app.use((req, res, next) => {
//   res.setHeader(CSP, POLICY);
//   next();
// // });
// app.use(cors({
//   origin: "http://localhost:8000",
//   // You can add other CORS options here if needed
// }));
app.use(express.static(path.join(__dirname + "/starter", "public")));
//app.use(helmet({ contentSecurityPolicy: false }))


//this limit the the incmoing requests from the user and limits to 100 requests per 1 hour
//and it is a global middle ware 

// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000, //one hour window
//     message: "too many requests from this IP ,please try again in an hour!"
// });

//we are applying this for all with api route
//to limit the number of times of acces per certain time (here we have set it for 1 hour)
// app.use("/api", limiter);
//body parser ,reading data from body into req.body
// this limit limites the data comming to 10kb as specifies this is done to stop attackers send bigg data and crashing our server 
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(morgan("dev"));

//data sanitization againt NOSQL query injection(like if we give {$gt:{ }} in the email section in the login with password we can login, since {$gt:{ }} this will give always true )
//against mangodb query  

// app.use(mongoSanitize());

// app.use((req, res, next) => {
//     res.setHeader(
//       'Content-Security-Policy',
//       "script-src  'self' api.mapbox.com",
//       "script-src-elem 'self' api.mapbox.com",
//     );
//     next();
//   });
//data sanitization against cross platfrom attack (XSS)

//sanitize any html code and javascript that could be inserted into database and cause data leak
// app.use(xss());

//prevent paramter pollution that like if we give query (sort=duration&sort=price) it will consider only sort=price
//we can alow this just by nameing the things we want to allow likw duration below in whitelist
// app.use(hpp({
//     whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
// }));

//middleware
//console.log(`${__dirname}/public`);
//app.use(express.static(`${__dirname}/public`));

//serving static files
//to add the time to req
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
     console.log(req.cookies);
    next();
})



//route handlee
// app.get("/api/v1/tours", getalltour);
// app.get("/api/v1/tours/:id", gettour);
// app.post("/api/v1/tours", posttour);
// app.patch("/api/v1/tours/:id")

//routing>.........
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/",viewRouter)


//to handle unknow route
app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: `cant find ${req.originalUrl}`
    // // });
    // const err = new Error(`cant find ${req.originalUrl}`);
    // err.status = "fail";
    // err.statusCode = 404;
    //when we pass object in next() it througs to global error middleware handler without executing other middleware
    next(new AppError(`cant find ${req.originalUrl}`, 404));
});


// this is the gobal error handlre middleware .whene we pass err parameter to the middleware express automatically detectes it as global error handler middleware
app.use(globalErrorHandler);

module.exports = app;
