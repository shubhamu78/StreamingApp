const Users = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const { pormisift, promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');


const signToken = (id) => {
    return jwt.sign({id: id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRESIN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

exports.signUp = catchAsync(async (req, res, next) => {

    const newUser = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    //1) Take Email And Password From Body
    const {email, password} = req.body;

    //2) If Email or Password Doesn't Exist Give Error
    if(!email || !password) {
        return next(new AppError('Please Provide Email And Password',401));
    }

    //3) Get User Based On Email Provided
    const user = await Users.findOne({ email }).select('+password');

    //4) If no User Exist or Password Is Incorrect
    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError(`Incorrect Email or Password!`, 401));
    }

    createSendToken(user, 200, res);
});

exports.logout = (req, res) =>{
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true 
    })
    res.status(200).json({ status: 'success' })
}

exports.protect = catchAsync(async (req, res, next) => {

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }

    //1) If there is no Token
    if(!token) {
        return next(new AppError('You are Not Logged In! Please Log in!',401));
    }
    
    //2) Verify Token
    const decoded = await promisify (jwt.verify)(token, process.env.JWT_SECRET_KEY);
    
    //3) If There Is No User
    const freshUser = await Users.findById(decoded.id);
    if(!freshUser) {
        return new AppError('The User With To this Token No Longer Exists!',401);
    }
   
    //4) Change if User Changed Password after Issuing Token
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User Recently Changed Their Password! Please Login Again', 401));
    }

    //5) Grant Access To Protected Route
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('Your Are Not Allowed To Access This Route',401));
        }
        next();
    }
};

exports.updateMyPassword = catchAsync( async (req, res, next) => {

    const user = await Users.findById(req.user.id).select('+password');

    if(!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Wrong Current Password', 401));
    };

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    const token = signToken(req.user.id);
    createSendToken(user, 201,res)
});


exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm ){
        return next(new AppError(`Use /updatePassword To Update Your Password`, 401));
    }
    const name = req.body.name || req.user.name;
    const email = req.body.email || req.user.email;

    const user = await Users.findByIdAndUpdate(req.user.id, {name: name, email: email}, {
        runValidators: true,
        new: true
    });

    res.status(200).json({
        status:'success',
        data: {
            user
        }
    })
});

exports.forgotPassword = catchAsync(async (req, res, next) => {

    const email = req.body.email || undefined;
    if(!email) {
        return next(new AppError(`Please Provide Email Address`,401));
    }

    const user = await Users.findOne({email: email});
    if(!user) {
        return next(new AppError('No User Found With Provided Email', 401));
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
        });

        res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    console.log('HashedToke:'+hashedToken);
    const user = await Users.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() }
    });
  
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  });