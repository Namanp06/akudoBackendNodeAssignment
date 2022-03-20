# Creating a RESTful API with Node.js

## Usage

 ```npm install```.
 ```npm start```

Routes -
- Signup
localhost:3000/user/signup (POST)
 sample body
 {
    "email": "naman@gmail.com",
    "password":"newpass",
    "team":"irnoMan"
}
- Generate OTP
localhost:3000/user/otpGeneration (POST) (Add token in header received from signup api)
sample body
{
    "email": "naman@gmail.com",
    "contact_no":"3434344756",
    "country_code":"22"
}
- Check OTP
localhost:3000/user/checkOtp (POST) (Add token in header received from signup api)
sample body
{
    "email": "naman@gmail.com",
    "otp":"225434"
}

- Get verified users
localhost:3000/user/getUsers (GET)
```
