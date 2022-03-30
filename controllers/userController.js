const Users = require('./../models/userModel');

exports.getAllUser = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'This Route is Not Yet Implemented'
    });
}

exports.getUser = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'This Route is Not Yet Implemented'
    });
}

exports.createUser = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'Use /api/v1/users/signup To Create an Account!'
    });
}

exports.updateUser = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'Use /api/v1/users/updateMe To Update Your Account!'
    });
}

exports.deleteUser = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'This Route is Not Yet Implemented'
    });
}