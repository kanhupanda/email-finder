const jwt = require("jsonwebtoken");
const { JWT_SECRECT } = require("./constants");
module.exports.verifyUserJwtToken = (req, res, next) => {
    var token;
    if ('authorization' in req.headers) {
        const { authorization } = req.headers;
        token = authorization;
    }

    if (!token)
        return res.status(403).send({ status: "error", message: 'No token provided.' });
    else {
        jwt.verify(token, JWT_SECRECT,
            (err, decoded) => {
                if (err){
                    console.log(err);
                    return res.status(403).send({ status: "error", message: 'Token authentication failed.', });
                }
                else {
                    session = req.session;
                    req.tokenUser = decoded;
                    next();
                }
            }
        )
    }
}