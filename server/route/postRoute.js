const express = require('express')

const router = express.Router()
router.post('/post-route' , (req , res)=>{
    res.status(200)
})
module.exports={router}