const catchAsync = require('./../utils/catchAsync');
const Videos = require('./../models/videoModel');

exports.getLogin = (req, res) => {
    res.status(200).render('login');
}

// exports.getProducts = catchAsync(async (req, res, next) => {
//     const products = await Products.find();
//     res.status(200).render('products', {
//         products
//     });
// })

// exports.getProductDetails = catchAsync(async (req, res, next) => {
//     const product = await Products.findOne({slug: req.params.slug});
//     res.status(200).render('productDetails', {
//         product: product
//     });
// })

// exports.createProduct = catchAsync(async (req, res, next) => {
//     res.status(200).render('createProduct');
// })

exports.getHome = catchAsync(async (req, res, next) => {
    const videos = await Videos.find();
    res.status(200).render('home', {videos});
});

exports.getVideoPlayer = catchAsync(async (req, res, next) => {
   const videoName = req.params.videoName;
   await Videos.findOneAndUpdate({videoName: videoName}, {$inc: { views: 1 }})
   res.status(200).render('player', { videoName });
});

exports.getMyVideos = catchAsync(async (req, res, next) => {
    const videos = await Videos.find({userId: req.user.id});
    res.status(200).render('myVideos', {videos});
 });

 exports.getVideoDetails = catchAsync(async (req, res, next) => {
     console.log(req.params.videoId)
    const video = await Videos.findById(req.params.videoId)
    console.log(video)
    res.status(200).render('videoDetails', {video});
 });

 exports.getUploadVideo = catchAsync(async (req, res, next) => {
    res.status(200).render('uploadVideo');
 });

 exports.getSingup = catchAsync(async (req, res, next) => {
    res.status(200).render('signup');
 });