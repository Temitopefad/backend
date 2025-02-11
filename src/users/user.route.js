const express = require('express');
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Ensure correct path



// register endpoint
router.post('/register', async (req, res) => {
    try{
        const{ username, email, password} = req.body;
        const user = new User({ email, username, password});    
        await user.save();
        res.status(201).send({message: "user registered successfully!"})
    }  catch (error) {
        console.error("error registering user", error);
        res.status(500).send({ message: "Server error", error: error.message });
    

    }
})

//login user endpoint
router.post('/login', async(req, res) => {
const {email, password} = req.body;
try{
    const user = await User.findOne({email});
if(!user){
    return res.status(404).send({message: 'user not found'})

}
const isMatch = await user.comparePassword(password);
if(!user) {
    return res.status(404).send({message: 'user not found'})
}
if(!isMatch) {
    return res.status(401).send({message: 'Password not match'})
 
}

const token = await generateToken(user._id);

res.cookie('token', token,{ 
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    
})

res.status(200).send({
 message : 'user logged in successfully!',token, user:{
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    bio: user.bio,
    profession: user.profession,
 }})}

catch (error) 
{  console.error("error logged in user", error);
    res.status(500).send({ message: " error logged in user",  });

}
})
router.get("/users",verifyToken, async(req, res)=> {
    res.send({message: "protected users"})
})



// logout endpoint
router.post('/logout', (
    
req, res) => {
    res.clearCookie('token')
    res.status(200).send({message: 'logged out successfully!'})

})

// delete a user
router.delete('/users/:id', async(req, res) => {
    try{
           const {id} = req.params;
           const user = await User.findByIdAndDelete(id)
            if(!user) {
                return res.status(404).send({message: 'user not found'})
            }
            res.status(200).send({message: 'user deleted successfully!'})


    }  catch (error) {
        console.error("error deleting user", error);
        res.status(500).send({ message: "error deleting user", });
    }
    })

    //get all users
    router.get('/users', async(req, res) => {
        try {
            const users = await User.find({}, 'id email role').sort({createdAt: -1});           
        } catch (error) {
            console.error("error fetching user", error);
        res.status(500).send({ message: "error ipdatinguser", });
            
        }

    })

// update user role
router.put('/users/:id', async(req, res) => {
    try {
        const { id } = req.params;  
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).send({ message: 'user not found' });
            }
            res.status(200).send({ message: 'user role updated successfully!' });
            } catch (error) {
                console.error("error updating user role", error);
                res.status(500).send({ message: "error updating user role", });
            }
})

//edit or update profile
router.patch('/edit-profile', async(req,res) => {
    try {
        const {userId, username, profileImage, bio, profession } = req.body
    if (!userId){
        return res.status(400).send({ message: 'user id is required' });

    }
    const user = await user.findById(userId);
    if(!user) 
    {
        return res.status(404).send({ message: 'user not found' });
    }

    //update profile

    if(username !== undefined) user.username = username;
    if(profileImage !== undefined) user.profileImage = profileImage;
    if(bio !== undefined) user.bio = bio;
    if(profession !== undefined) user.profession;

      await user.save();
      res.status(200).send({
         message: 'profile updated successfully!',
      user:{
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      profession: user.profession,
      },
    });

    } catch (error) {
        console.error("error updating user profile", error);
        res.status(500).send({ message: "error updating user profile", });
    }
}
)
module.exports = router;