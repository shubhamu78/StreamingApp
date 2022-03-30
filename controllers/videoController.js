const Videos = require('../models/videoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const fs = require('fs');


exports.getAllVideos = catchAsync(async(req, res, next) => {
    const videos = await Videos.find();
    res.status(200).json({
        status:'success',
        size: videos.length,
        data: {
            videos
        }
    });
})

exports.getVideo = catchAsync(async(req, res, next) => {
    const video = await Videos.findByIdAndUpdate(req.params.id, { $inc: { views: 1 }});

    if(!video) {
        return next(new AppError(`Cannot Find Video With ID ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        status:'success',
        data: {
            video
        }
    });
})

exports.createVideo = catchAsync(async(req, res, next) => {
    req.body.videoName = req.file.filename;
    req.body.userId = req.user.id;
    const video = await Videos.create(req.body);

    res.status(200).json({
        status:'success',
        message:'Video Created',
        data: {
            video
        }
    });
})

exports.updateVideo = catchAsync(async(req, res, next) => {
    
    const video = await Videos.findById(req.params.id);
    if(!video){
        return next(new AppError(`Cannot Find Video With ID ${req.params.id}`, 404))
    }
    
    if(`${video.userId}` !== req.user.id) {
        return next(new AppError(`You Cannot Update This Video`, 400))
    }
    const newVideo = await Videos.findByIdAndUpdate(req.params.id, {name: req.body.name}, {new: true });
    
    res.status(200).json({
        status:'success',
        message:'Video Updated',
        data: {
            newVideo
        }
    });
})

exports.updateThumbnail = catchAsync(async(req, res, next) => {

    let video = await Videos.findById(req.params.id)
    
    if(!video) {
        return next(new AppError(`Cannot Find Video With ID ${req.params.id}`, 404))
    }

    if(`${video.userId}` !== req.user.id) {
        return next(new AppError(`You Cannot Delete This Video`, 400))
    }

    const thumbnailName = video.thumbnailName;

    if(thumbnailName!=='default.png'){
        try {
            fs.unlinkSync(`./public/thumbnail/${thumbnailName}`)
        } catch(err) {
            console.error(err)
        }
    }
    
    video = await Videos.findByIdAndUpdate(req.params.id, {thumbnailName: req.file.filename}, {new: true });
    
    res.status(200).json({
        status:'success',
        message:'Thumbnail Updated',
        data: {
            video
        }
    });
})

exports.deleteVideo = catchAsync(async(req, res, next) => {

    let video = await Videos.findById(req.params.id)

    if(!video) {
        return next(new AppError(`Cannot Find Video With ID ${req.params.id}`, 404))
    }
    
    if(`${video.userId}` !== req.user.id) {
        return next(new AppError(`You Cannot Delete This Video`, 400))
    }

    const videoName = video.videoName;
    const thumbnailName = video.thumbnailName;

    video = await Videos.findByIdAndDelete(req.params.id)

    try {
        fs.unlinkSync(`./public/uploads/${videoName}`)
        if(thumbnailName !== 'default.png')
        {
            fs.unlinkSync(`./public/thumbnail/${thumbnailName}`)
        }
    } catch(err) {
        console.error(err)
    }

    res.status(202).json({
        status:'success'
    });
})