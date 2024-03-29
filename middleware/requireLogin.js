const jwt = require('jsonwebtoken');
const { JWT_KEYWORD } = require('../config/keys');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// Controller for Verifying whether user is Logged In or not
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'You are not Logged In' });
  }
  const token = authorization.replace('Bearer ', '');
  jwt.verify(token, JWT_KEYWORD, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'You must be Logged In' });
    }
    const { id } = payload;
    User.findById(id).then(userdata => {
      req.user = userdata;
      next();
    });
  });
};
