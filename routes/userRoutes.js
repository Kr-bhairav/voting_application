const express = require('express');
const router  = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

router.post('/signUp', async (req, res)=>{

    try {
        const body = req.body;

        const newUser = new User(body);

        const response = await newUser.save();
        console.log("Data Saved Successfully");
        const payLoad = {
            id : response.id,
        }
        console.log(JSON.stringify(payLoad));
        const token = generateToken(payLoad);
        console.log("Token is : ", token);

        console.log("Data saved successfully");
        res.status(200).json({response: response, token: token});
        
    } catch (error) {
        console.log("Error Found", error);
        res.status(500).json("Something wrong happened");
    }
})


router.get('/logIn', async(req, res)=>{
    try{
        const {aadharCardNumber, password} = req.body;
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json("Invalid Username or Password");
        }

        const payLoad = {
            id: user.id,
        }
        const token = generateToken(payLoad);

        res.json({token});
    }catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
})

router.get('/profile', jwtAuthMiddleware, async (req, res)=>{
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(201).json({user});
        
    } catch (error) {
        console.log(error);
        res.status(401).json({error: "Can't Fetch User-Data"});
    }

})

router.put('/profile/password', async (req, res)=>{
    try {
        const userId = req.user.id; // Extract the password from id
        const {currentPassword, newPassword} = req.body;

        const user = await User.findById(userId);

        if(!(await user.comparePassword(password))){
            return res.status(401).json("Invalid Username or Password");
        }

        user.password = newPassword;
        await user.save();

        console.log("Password Changed");
        res.status(200).json({message: "Password Updated"});


    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal server error"});
    }

})

module.exports = router;
