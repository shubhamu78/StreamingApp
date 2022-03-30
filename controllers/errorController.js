const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message =  `Invalid Input. ${errors.join('. ')}`;
    //console.log(message);
    return new AppError(message, 400);
}

const handleInvalidToken = err => {
    const message = `Invalid Token! Please Login Again!`;
    return new AppError(message, 401);
}

const handleExpiredToken = err => {
    const message = `Token Expired! Please Login Again!`;
    return new AppError(message, 401);
}

const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status:err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {

    if(err.isOperational){
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        //console.log('ERROR 💥', err);

        return res.status(500).json({
            status: 'error',
            message: 'Something Went Wrong!'
        })
    }
}

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
   
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    }else{
       
        if(err.name === 'CastError') err = handleCastErrorDB(err);
        if(err.code === 11000) err = handleDuplicateFieldsDB(err);
        if(err.name === 'ValidationError') err = handleValidationErrorDB(err);

        if(err.name === 'JsonWebTokenError') err = handleInvalidToken(err); 
        if(err.name === 'TokenExpiredError') err = handleExpiredToken(err);
        sendErrorProd(err, res);
    }
}