const express = require("express");
const authController = require("../controllers/authController");

const reviewController = require("../controllers/reviewController");
//POST /tour/234fad4/reviews
//or /reviews both will worke because of meregeparams set true 

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router.route("/").get(reviewController.getAllReview).post(authController.restrictTo("user"), reviewController.createReview);

router.route("/:id").get(reviewController.getReview).patch(authController.restrictTo("user", "admin"), reviewController.updateReview).delete(authController.restrictTo("user", "admin"), reviewController.deleteReview);
module.exports = router;