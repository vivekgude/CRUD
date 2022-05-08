const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const config = require('../config/keys');

let gfs;

mongoose.connection
  .once('open', () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
  })
  .on('error', function (error) {
    console.log('Error is: ', error);
  });

// Create storage engine
const storage = new GridFsStorage({
  url: config.MONGOURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage: storage }).single('file');

exports.getAllFiles = (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
  });
};

exports.uploadFile = (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      res.sendStatus(500);
    }
    next();
  });
};

// Display all files in JSON
exports.getFiles = (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist',
      });
    }
    // Files exist
    return res.json(files);
  });
};

// Display single file object
exports.getFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
      });
    }
    res.setHeader('Content-Type', file.contentType);
    const readstream = gfs.createReadStream(file.filename);

    readstream.pipe(res);
  });
};

exports.getFileData = async (req, res) => {
  gfs.files.findOne({ filename: res.user.image }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
      });
    }
    res.setHeader('Content-Type', file.contentType);
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
};
