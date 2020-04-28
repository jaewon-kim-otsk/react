const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

const { user } = require('./models/user');

const config = require('./config/key');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    // useFindAndModify: false,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Example app Listening on port ${port}!`));


app.post('/register', (req, res) => {

  const userInfo = new user(req.body);

  // Save into MongoDB
  userInfo.save((err, doc) => {
    if (err) return res.json({ success: false, err});
    return res.status(200).json({ success: true});
  })
})

