const expressJwt = require('express-jwt');

function auth(){
    const secret = process.env.JWT_SECRET;
    
    return expressJwt({
        secret ,
        algorithms:['HS256'],
        isRevoked: isRevokedCallback
    }).unless({
        path:[
            {url: /\/public\/uploads(.*)/, methods: ['GET','OPTIONS']},
            {url: /\/api\/products(.*)/, methods: ['GET','OPTIONS']},
            {url: /\/api\/categories(.*)/, methods: ['GET','OPTIONS']},

            '/api/users/login',
            '/api/users/register',


        ]
    })
};
async function isRevokedCallback (req, payload, done) {

    if(!payload.isAdmin){
      return   done(null,true);

    }
    return done();
}


module.exports = auth