function errHandler(err,req, res, next) {
    if (err.name === 'UnauthorizedError'){
        return res.status(401).json({message:"No authorization token was found"})
    }
    else if(err.name === 'ValidationError'){
        return  res.status(401).json({message:"ValidationError was found"})

    }
   return res.status(500).json("e"+err)

}  


module.exports = errHandler