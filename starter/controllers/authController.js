//here we are taking only the promisty from util (destructureing)
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

const sendEmail = require("./../utils/email");
const crypto = require("crypto");

const signToken = id => {
    //console.log(process.env.JWT_EXPIRES_IN);
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };
  
  const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
   // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
    //console.log(hii,res.cookie);
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };
//const bcrypt = require("bcryptjs");
exports.signup = catchAsync(async (req, res, next) => {
    // console.log(req.body);
    //this is done to make sure that user cant signup as a admin ,admin role can be done manually in backed that is in the database  by the services provider..
    const newUser = await User.create({

        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })

    // res.cookie("jwt", token, {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     //secure set to true so that https (secure ) (since we are testing in postman where https is ot possible so  we dissabled it)
    //     // secure:true,
    //     //httpOnly set true so that cookie cant be modified by the broweser by any chance (that is scriptibg attack)
    //     httpOnly: true
    // })
    // //remove the password from output becasuse we dont want to show to user 
    // newUser.password = undefined;
    // //console.log(req);
    // res.status(201).json({
    //     status: "sucess",
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // })
    createSendToken(newUser, 201, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    //or we can do destructing basically the email and password values will asssigend to respective things
    //const {email,password}=req.body;


    //1 check if user email and password exits
    if (!email || !password) {
        return next(new AppError("please provide email and password!", 400));
    }
    //2 check  if user eits && password is correct

    //by using "+" we are explicitly selecting the element (since in schema we have set it to false)
    const user = await User.findOne({ email: email }).select("+password");
    //we are calling insatce method from usermodel (correctPassword)

    // const correct = await user.correctPassword(password, user.password);

    //3 if everthing is ok ,send token to clinet
    //this will check that user email is there and password matches 
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password"), 401);
    }
    // if it is true that is email and password verified then only token created
    createSendToken(user, 200, res);
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })
    // res.cookie("jwt", token, {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     //secure set to true so that https (secure ) (since we are testing in postman where https is ot possible so  we dissabled it)
    //     // secure:true,
    //     //httpOnly set true so that cookie cant be modified by the broweser by any chance (that is scriptibg attack)
    //     httpOnly: true
    // })
    // res.status(200).json({
    //     status: "sucess",
    //     token: token,
    //     data: {
    //         data: user
    //     }
    // });
});
// this method  basically used to resrict the certain user from acessing all the tours 
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    console.log( "hi"+req.cookies.jwt);
    //1 getting taken and check if its there
    //we usually send token in http header and standard format will be "athorization=Bearer sdhcbsdkjb827dwexh"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if(req.cookies.jwt){
        token = req.cookies.jwt;
       // console.log(token);
    }
    //  console.log(token);
    if (!token) {
        return next(new AppError("you are not loggend in,please log in ....!", 201))
    }
    //2 verification token
    //verify is checking with the token of user and the new genarated token from the secret key
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

     // console.log(decoded.id);
    //3 check if user still exits(wht if he is deleted or password changed)
    const currentuser = await User.findById(decoded.id);
    // console.log(currentuser);
    if (!currentuser) {
        return next((new AppError("the token belong to this user does no longer exits..", 401)));
    }

    // 4 check if user changed password after the token was isseued
    //iat means token initiated
    if (currentuser.ChangedPasswordAfter(decoded.iat)) {
        return next(new AppError("user recently changed password !please log in again...!", 401));
    }
    //Gratn ACCess to protected router
    //here we are assiging currentuser to user in request so that it can be used in further (this will be available throught the req res cycle)
    req.user = currentuser;
    //  console.log(req.user.id);
    next();
})
//only fro rendered pages ,no erros
exports.isLoggedIn = async (req, res, next) => {
    try{
        if(req.cookies.jwt){
            //verify the token
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
    
         // console.log(decoded.id);
       
        const currentuser = await User.findById(decoded.id);
      
        if (!currentuser) {
            return next();
        }
    
       
        if (currentuser.ChangedPasswordAfter(decoded.iat)) {
            return next();
        }
        //there is a login user
        res.locals.user=currentuser;
       // req.user = currentuser;
      
         return next();}
      
    }catch(err){
        return next();
    }
    next();
}
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };
  
exports.restrictTo = (...roles) => {
    //this type of function created because a middle ware cant take roles as paramter
    //we called middleware inside a function so that it can acces to the roles(the parameter)
    return (req, res, next) => {
        //roles is an array ex=["admin","lead-guide"]
        //this role comes from the currentuser from the above function
        if (!roles.includes(req.user.role)) {
            //here is "user"  then the following is returned
            return next(new AppError("you do not have permission to perform this action", 403));
        }
        next();
        //
    }
}

exports.frogotPassword = catchAsync(async (req, res, next) => {
    //1 get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("there is no user with email address", 404));
    }
    //2 genarate the random reset token
    const resetToken = await user.ChangedPasswordResetToken();
    //console.log(resetToken);
    //turn off all the validators before saving else we will get validatoe error
    await user.save({ validateBeforeSave: false });
    //3 send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `forgot your password ? submit a patch request with your new password and password to:${resetURL}.\nIf you difn't forget ,please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: "your password reset token (vaild for 10 min)",
            message
        });
        //  console.log(user);
        res.status(200).json({
            status: "success",
            message: "token sent to email"
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        //turn off all the validators before saving else we will get validatoe error
        await user.save({ validateBeforeSave: false });

        return next(new AppError("There was an error while sending the email.Try again later!", 500))
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1 get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    //here we are checking the token set through url is same as the one which is stored in the database and checking the expiry date also
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // 2 if token has not expired,and there is user ,set the the new user password
    if (!user) {
        return next(new AppError("Token is invalid or expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3 update changePassword property for the user

    //4 log the user in ,send jwt
    createSendToken(user, 200, res);
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })
    // res.cookie("jwt", token, {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     //secure set to true so that https (secure ) (since we are testing in postman where https is ot possible so  we dissabled it)
    //     // secure:true,
    //     //httpOnly set true so that cookie cant be modified by the broweser by any chance (that is scriptibg attack)
    //     httpOnly: true
    // })
    // res.status(200).json({
    //     status: "sucess",
    //     token: token
    // });
})


exports.updatePassword = catchAsync(async (req, res, next) => {
    //1 user from collection
    const user = await User.findById(req.user.id).select("+password");

    //2 check if poste password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Incorrect email or password"), 401);
    }
    //3 if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();
    //4 log user in,send jwt
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })
    // res.cookie("jwt", token, {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     //secure set to true so that https (secure ) (since we are testing in postman where https is ot possible so  we dissabled it)
    //     // secure:true,
    //     //httpOnly set true so that cookie cant be modified by the broweser by any chance (that is scriptibg attack)
    //     httpOnly: true
    // })
    // res.status(200).json({
    //     status: "sucess",
    //     token: token
    // });
    createSendToken(user, 200, res);
})

