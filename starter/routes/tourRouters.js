const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");
const reviewRouter = require("./reviewRouter");

const router = express.Router();



// //POST /tour/234fad4/reviews
// //GET /tour/234fad4/reviews
// //GET /tour/234fad4/reviews/3874347
// router.route("/:tourId/reviews").post(authController.protect, authController.restrictTo("user"),reviewController.createReview)(this also workes but it is not good pratice to have review thing in the tour so we have implimented nested routing which is the features of express)
router.use("/:tourId/reviews", reviewRouter);
//we can do this in query paramers also but below one looks way cleaner
router.route("/tours-within/:distance/centre/:latlng/unit/:unit").get(tourController.getToursWithin);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistences);
//alias routing
router.route("/top-5-cheap").get(tourController.gettopfive, tourController.getalltour);
// pipline agregation
router.route("/tour-stats").get(tourController.getTourStats);
router.route("/montly-plan/:year").get(authController.protect, authController.restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan);
// authController.protect middleware is run check the user is logied in or not to acces all user    
router.route("/").get(tourController.getalltour).post(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.createTour);

router.route("/:id").get(tourController.gettour).patch(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.updateTour).delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);



module.exports = router;