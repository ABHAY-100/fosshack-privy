const express = require('express')

const router = express.Router()
router.post('/post-route' , (req , res)=>{
    res.send("Hello")
})
module.exports={router}