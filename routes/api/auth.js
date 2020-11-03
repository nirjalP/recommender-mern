const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {checkout, validationResult, check} = require('express-validator/check'); 


const User = require('../../model/User');

router.get('/',async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    res.send('Auth route');
});

router.post('/',[
    check('email','Please enter valid email').isEmail(),
    check('password',
    'Password is required!').exists(),
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:error.array()});
    }
    
    const { email,password } = req.body;


    try{
        let user = await User.findOne({email});

        if(!user){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}] });
        }
    

    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(payload,config.get('jwtSecret'),
    {
        expiresIn: 360000
    },
    (err,token) =>{
        if(err) throw err;
        res.json({ token });
    }
    );

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;