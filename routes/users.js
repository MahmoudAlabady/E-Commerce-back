const {User} = require('../models/user');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const userList = await User.find({});
// console.log(userList)
    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})
router.get(`/:id`, async (req, res) =>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({success: false, message:"user not found"})
    } 
    res.status(200).send(user);
})
router.post('/', async (req,res)=>{
    let user = await User.findOne({email: req.body.email});
    if(user){return res.status(400).send('User already registered')} 

     user =new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country,


    })
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt)
 user= await user.save(); 
 if(!user){return res.status(404).send('the user cannot be created!')}
 res.send(user);
})

router.post('/register', async (req,res)=>{
    let user = await User.findOne({email: req.body.email});
    if(user){return res.status(400).send('User already registered')} 

     user =new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country,


    })
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt)
 user= await user.save(); 
 if(!user){return res.status(404).send('the user cannot be created!')}
 res.send(user);
})

//login
router.post('/login', async (req,res)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){return res.status(400).send('User not fond')} 
    const isMatch = await bcrypt.compare(req.body.password,user.password);
    // console.log(isMatch)
    if(user && isMatch){
    const token = jwt.sign(
        {
            _id:user.id.toString(),
            isAdmin: user.isAdmin
        } ,
        process.env.JWT_SECRET,
        {expiresIn : '1w'}
            )

        return res.status(200).send({user,token})
    }
  return res.status(400).send("user not authenticated")
    
 
})

//update
router.patch('/:id', async (req,res)=>{
    let user = await User.findById( req.params.id);
    if(!user){return res.status(400).send('User not found')} 
    const userData =req.body;
    const updates = Object.keys(userData);
    const allowedUpdates = ["name","email","password","phone","isAdmin","street","apartment","zip","city","country"];
    var isValid = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValid){
        return res.status(400).send('can\'t update');
    }
    updates.forEach((update)=>user[update]=userData[update]);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt)
    
 user= await user.save(); 
 res.send(user);
})

router.get('/get/count',async (req,res)=>{
   
    const userListCount = await User.countDocuments()
    if(!userListCount){
        res.status(500).json({success:false})
    }
    res.send({
        userListCount : userListCount
    })
   
    
})

router.delete('/:id', async (req,res)=>{
    User.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success: true,message:"deleted"})
        }
        else {
            return res.status(404).json({success: false,message:"not deleted"})
        }
    }).catch(error=>{
        return res.status(500).json({success: false,error: error})
    })
})

module.exports =router;