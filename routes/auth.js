const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_KEYWORD } = require('../config/keys');
const User = mongoose.model('User');
const requireLogin = require('../middleware/requireLogin');
const { uploadFile } = require('../middleware/fileController');

router.post('/signup', uploadFile, async (req, res) => {
  const { name, email, password, gender, age, address, city, state, zip } =
    req.body;
  if (
    !email ||
    !password ||
    !name ||
    !gender ||
    !age ||
    !address ||
    !city ||
    !state ||
    !zip
  ) {
    return res.status(422).json({ error: 'Add all the fields properly' });
  }

  let image = req.file?.filename || '';
  await User.findOne({ email })
    .then(savedUser => {
      if (savedUser) {
        return res.status(422).json({ error: 'User already exists' });
      }
      bcrypt.hash(password, 12).then(hashedpassword => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          gender,
          age,
          address,
          city,
          state,
          zip,
          image,
        });
        user
          .save()
          .then(user => {
            res.json({ message: 'User saved successfully' });
          })
          .catch(err => {
            console.log(err);
          });
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: 'Please fill all the fields' });
  }
  await User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(422).json({ error: 'Invalid Email or Password' });
    }
    bcrypt
      .compare(password, user.password)
      .then(matched => {
        if (matched) {
          const token = jwt.sign({ id: user._id }, JWT_KEYWORD);
          user = user.toObject();
          delete user.password;
          delete user._id;
          delete user.__v;
          res.json({ token, user });
        } else {
          return res.status(422).json({ error: 'Invalid Email or Password' });
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

router.patch('/updateuser', requireLogin, async (req, res) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 12);
  }
  User.findOneAndUpdate(
    { email: req.body.email },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        console.log(err);
        return res.json({ error: 'Try Again, User details are not updated' });
      } else {
        return res.json({
          message: 'User details updated successfully changed',
          user,
        });
      }
    },
  );
});

router.delete('/deleteuser', requireLogin, async (req, res) => {
  User.findOneAndDelete({ email: req.body.email }, err => {
    if (err) {
      console.log(err);
      return res.json({ error: 'Try Again, User not deleted' });
    } else {
      return res.json({ message: 'User is deleted successfully' });
    }
  });
});

module.exports = router;
