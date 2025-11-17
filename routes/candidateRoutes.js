const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');


const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (error) {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user has not admin role" });
        }
        const body = req.body;

        const newCandidate = new Candidate(body);

        const response = await newCandidate.save();
        console.log("Data Saved Successfully");
        res.status(200).json({ response: response, });

    } catch (error) {
        console.log("Error Found", error);
        res.status(500).json("Something wrong happened");
    }
})


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user has not admin role" });
        }

        const candidateID = req.params.candidateID;
        const updateCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updateCandidateData, {
            new: true, // return updated document
            runValidators: true // Run mongoose validation
        })

        if (!response) {
            res.status(404).json({ error: "Candidate not found" });
        }

        console.log("candidate data updated");
        res.status(201).json({ message: "Candidate data updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" });
    }

})
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user has not admin role" });
        }

        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID)

        if (!response) {
            res.status(404).json({ error: "Candidate not found" });
        }

        console.log("candidate data deleted");
        res.status(201).json({ message: "Candidate data deleted" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" });
    }

})

//Voting starts here

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userID = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isVoted) {
            return res.status(404).json({ message: "you have already voted" });
        }
        if (user.role === 'admin') {
            return res.status(401).json({ message: "You are not authorized to vote" });
        }

        //update the candidate document
        candidate.votes.push({ user: userID });
        candidate.voteCount++;
        await candidate.save();

        //update user document
        user.isVoted = true;
        user.save();

        return res.send(200).json({ message: "Vote recorded successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" });
    }
})

router.get('/vote/count', async (req, res) => {
    try {
        //find all candidates and sort the voteCount in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        //map the candidate to only return their name and votecount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })

        return res.status(200).json(voteRecord);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" });
    }
})

module.exports = router;
