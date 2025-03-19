const express = require('express')

const router = express.Router()
router.post('/post-route', (req, res) => {
    console.log(req);
    res.send({ message: "Server Alive!" });
});
module.exports={router}
