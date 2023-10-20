
const express = require("express");
const router = express.Router();
const usersControllers = require("./../controllers/usersController");
const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");
//bacically they aslo middleware (below)
router.post('/signup', authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.frogotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

//this middlware make sure that all the routing things happens after the users are authentecated(that is all the roters below this middleware)
//this is small trick to add protect function to  all routes in one shot insted of adding to each one of theme  
router.use(authController.protect);


router.get("/me", usersControllers.getMe, usersControllers.getUser)
router.patch("/updateMyPassword", authController.updatePassword);
router.patch("/updateMe", usersControllers.updateMe);
router.delete("/deleteMe", usersControllers.deleteMe);

router.use(authController.restrictTo("admin"));
router.route("/").get(usersControllers.getallUsers).post(usersControllers.creatUsers);
router.route("/:id").get(usersControllers.getUser).post(usersControllers.updateUsers).delete(usersControllers.deleteUser).patch(usersControllers.updateUsers);







module.exports = router;