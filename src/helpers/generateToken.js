const jwt = require('jsonwebtoken');

const generateToken = (payload) => { 
    const token = jwt.sign(payload, process.env.SECRET_JWT, { expiresIn: '24h' });
    return token;
}

module.exports = generateToken;