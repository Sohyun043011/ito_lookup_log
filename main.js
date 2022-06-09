const req=require('request');
const res = require('express/lib/response');
const http=require('http');
const url = require('url');
const path=require('path')
const express=require('express');
const session=require('express-session');
const mysql_store=require('express-mysql-session')(session);
const { DEC8_SWEDISH_CI } = require('mysql/lib/protocol/constants/charsets');
var bodyParser = require('body-parser');
const { json } = require('express/lib/response');
var UserRouter=require('./routes/users')
var AdminRouter=require('./routes/admin')
const db_config=require('./db_config')
var cookieParser=require('cookie-parser')

var session_store= new mysql_store(db_config['mysql-session']); // session_store를 사용하여 세션 데이터를 연동 DB에 저장
const port=3001; // 포트접속정보

const app=express();

app.set('views','./views');
app.set('view engine','ejs'); // ejs engine linking

/*
    app.use로 필요한 middleware를 사용함을 명시
*/
app.use(cookieParser());
app.use(session({
    secret:'awefeawfe', // 암호화코드
    resave:true, // request가 들어올 때마다 세션을 다시 저장하는 것
    saveUninitialized: false, // request가 들어오면 로직과 관계 없이 빈 세션을 생성
    cookie:{
        maxAge:300000*6, // 30분
        httpOnly:false // 웹서버에서만 쿠키에 접근할 수 있도록 쿠키에 플래그 지정
    },
    store:session_store,
    rolling:true //세션 획득한 상태에서 다른 페이지로 이동 할 때마다 maxAge 시간 변경 등에 변화를 줄 것인지 여부
}));
app.use(express.static(__dirname)); 
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/views')));
app.use(express.static(path.join(__dirname+'/lib')));
app.use(express.static(path.join(__dirname+'/data')));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
app.use('/users', UserRouter) //router 객체 설정
app.use('/admin', AdminRouter)

app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
    // res.render('error',{error:'<h1>Sorry, page not found.</h1>'})
});

app.listen(port, function(){ // 3001번 포트로 listen
    console.log(`Server running at ${port}`);
});