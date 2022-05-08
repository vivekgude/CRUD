const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const User = mongoose.model('User');

router.get('/getuser', requireLogin, async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
    .select('-password -_id -__v')
    .then(user => {
      res.json({ user });
    })
    .catch(err => {
      return res.status(404).json({ error: err });
    });
});

router.get('/allusers', requireLogin, async (req, res) => {
  const users = await User.find()
    .select('-password -_id -__v')
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      return res.status(404).json({ error: err });
    });
});

module.exports = router;
