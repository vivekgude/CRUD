const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MONGOURI } = require('./config/keys');

const PORT = process.env.PORT || 3001;

mongoose.connect(MONGOURI);
mongoose.connection.on('connected', () => {
  console.log('Connected to dbms');
});
mongoose.connection.on('error', err => {
  console.log(err);
});

app.listen(PORT, () => {
  console.log('Server is running on', PORT);
});

require('./models/user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./routes/auth'));
app.use(require('./routes/user'));

if (process.env.NODE_ENV == 'production') {
  app.use(express.static('client/build'));
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
