// HEROKU 를 사용하는 경우, MONGO_URI 는 사이트에 입력된 값을 가져오도록 구성
module.exports = {
    mongoURI: process.env.MONGO_URI
}