const express = require('express');
const router  = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (error) {
        return false;
    }
}

router.post('/',jwtAuthMiddleware,  async (req, res)=>{
    try {
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user has not admin role"});
        }
        const body = req.body;

        const newCandidate = new Candidate(body);

        const response = await newCandidate.save();
        console.log("Data Saved Successfully");
        res.status(200).json({response: response,});
        
    } catch (error) {
        console.log("Error Found", error);
        res.status(500).json("Something wrong happened");
    }
})


router.put('/:candidateID',jwtAuthMiddleware, async (req, res)=>{
    try {
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user has not admin role"});
        }

        const candidateID = req.params.candidateID;
        const updateCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updateCandidateData, {
            new: true, // return updated document
            runValidators: true // Run mongoose validation
        })

        if(!response){
            res.status(404).json({error: "Candidate not found"});
        }

        console.log("candidate data updated");
        res.status(201).json({message: "Candidate data updated"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal server error"});
    }

})
router.delete('/:candidateID',jwtAuthMiddleware,  async (req, res)=>{
    try {
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user has not admin role"});
        }

        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID)

        if(!response){
            res.status(404).json({error: "Candidate not found"});
        }

        console.log("candidate data deleted");
        res.status(201).json({message: "Candidate data deleted"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal server error"});
    }

})

module.exports = router;
