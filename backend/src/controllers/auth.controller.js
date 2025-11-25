const userModel = require('../models/user.model')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function registerController(req,res) {
    try {
        const{fullname:{firstname,lastname},email,password}=req.body;
        console.log("BODY: ", req.body);

        // Validate required fields
        if (!firstname || !firstname.trim()) {
            return res.status(400).json({
                message: "First name is required"
            });
        }
        if (!lastname || !lastname.trim()) {
            return res.status(400).json({
                message: "Last name is required"
            });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const isUserAlreadyExists= await userModel.findOne({
            email
        })
        if(isUserAlreadyExists){
            return res.status(400).json({
                message:"User with this email already exists"
            })
        }

        const user = await userModel.create({
            fullname:{firstname:firstname.trim(),lastname:lastname.trim()},
            email:email.trim(),
            password: await bcrypt.hash(password,10)
        })

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.cookie('token',token )
        
        res.status(201).json({
            message:"User registered successfully",
            user:{
                email:user.email,
                id:user._id,
                fullname:user.fullname
            }
        })
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "An error occurred during registration",
            error: error.message
        });
    }
}

async function loginController(req,res) {
     const{email,password}=req.body;
     const user = await userModel.findOne({
        email
     })
     if(!user){
        return res.status(400).json({
            message:"invaild email and password "
        })
     }
     const isPasswordVaild = await bcrypt.compare(password,user.password)
     
       if(!isPasswordVaild){
    return res.status(401).json({
        message:'invaild email and password '
    })
}
const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
res.cookie('token',token)
res.status(201).json({
    message:"user login succesfully ",
     user:{
            email:user.email,
            id:user._id,
            fullname:user.fullname
        }
})
    
}



module.exports= {
    registerController,
    loginController
}