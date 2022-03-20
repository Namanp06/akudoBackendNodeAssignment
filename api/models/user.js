const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
    name:String,
    contactNo: {
        type:String,
    },
    email:{
        type:String, 
        required:true,
        unique:true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password:{type:String,required:true},
    team:{
        type: String,
        enum : ['ironMan','captainAmerica']
    },
    accessToken:String ,
    otpCode:String,
    otpExpiry:Date,
    isUserVerified:{
        type:Boolean,
        default:false
    }
    // createdAt: { type: Date, expires: 10, default: Date.now }

},);
module.exports = mongoose.model('User',userSchema);