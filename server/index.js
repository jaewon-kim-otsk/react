const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 5000;

const { auth } = require('./middleware/auth');
const { User } = require('./models/user');

const config = require('./config/key');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

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


app.get('/api/hello', (req, res) => {
  res.send("메세지전달")
});

app.post('/api/users/register', (req, res) => {

  const userInfo = new User(req.body);

  // Save into MongoDB
  userInfo.save((err, doc) => {
    if (err) return res.json({ success: false, err});
    return res.status(200).json({ success: true});
  })
});


app.post('/api/users/login', (req, res) => {

  // MongoDB 에서 데이터를 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
          return res.json({
              loginSuccess: false,
              message: "제공된 E-mail 에 해당하는 사용자를 찾을 수 없습니다."
          });
      };


      user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
          return res.json({
            loginSuccess: false,
            message: "비밀번호가 틀렸습니다."
          });

          user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);

            // 받아온 토큰을 저장한다. 여기에선 쿠키에 저장 (x_auth 는 임의로 정한 이름)
            res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
          });
      });
  });
});



app.get('/api/users/auth', auth, (req, res) => {

  // 인증(auth)이 성공한 경우에만 작동
  // auth.js 에서 리턴을 req.token 과 req.user 을 했기 때문에, 여기서 바로 사용할 수 있다.

  // admin 은 정하기 나름 ( role 0 이 아니면 : admin,  role 0 : user )
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});




app.get('/api/users/logout', auth, (req, res) => {
  // 인증을 통해서 token 이 MongoDB 에 입력되어 있다.
  // logout 은 이 token 을 지우는 것이라고 보면 된다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: ""}, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true })
  });
});