const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: [true, 'User With This Email Already Exists'],
        validate: [validator.isEmail, 'Please Provide a Valid Email!']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function(el) {
                return el === this.password
            },
            message: 'Passwords Do Not Match!'
        }
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
});

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimeStamp;
    }
    //False Means Not Changed
    return false;
} 

userSchema.methods.generatePasswordResetToken = function() {

    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    console.log(resetToken, {ResetToken: this.passwordResetToken });
    return resetToken;
}

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 14);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next){

    if(!this.isModified('password')|| this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})


const Users = mongoose.model('Users', userSchema); 
module.exports = Users;