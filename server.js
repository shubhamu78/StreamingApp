const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err)=> {
    console.log('Uncaught Exception! Shutting Down Server....');
    console.log(err.name, err.message);
    process.exit(1);
})

const app = require('./index');
dotenv.config({path: './config.env'});


const DB = process.env.MongoDB.replace('<password>', process.env.MongoDB_Password);
const DB1 = "mongodb+srv://AnandPal:V3xGVYKheRnEWC49@cluster0.eajhy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(DB1, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=> console.log('✅Database Connected Successfully!✅'));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, ()=>{
    console.log(`${process.env.NODE_ENV}`);
    console.log(`✅ Server Started On Port ${PORT}!✅`);
});

process.on('unhandledRejection', (err)=>{
    console.log('Unhandled Rejection!! Shutting Down!');
    console.log(err.name + " : " + err.message);
    server.close(()=>{
        process.exit(1);
    })
});

