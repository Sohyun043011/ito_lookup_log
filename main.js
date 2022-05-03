const req=require('request');
const http=require('http');
const url = require('url');
const path=require('path')
const express=require('express');
const res = require('express/lib/response');
const session=require('express-session');
const mysql_store=require('express-mysql-session')(session);
const { DEC8_SWEDISH_CI } = require('mysql/lib/protocol/constants/charsets');
var bodyParser = require('body-parser');
const { json } = require('express/lib/response');
var UserRouter=require('./routes/users')
var AdminRouter=require('./routes/admin')
const db_config=require('./db_config')
var cookieParser=require('cookie-parser')

var session_store= new mysql_store(db_config['mysql-session']);
const port=3001; //포트접속정보(중계DB상에서 포트정보 충돌나는지 확인할 것)

const app=express();

app.set('views','./views');
app.set('view engine','ejs');


app.use(cookieParser());
app.use(session({
    secret:'kjwlakwf@$#!',
    resave:false,
    saveUninitialized: false,
    cookie:{
        path:'/',
        maxAge:60000,
        httpOnly:false
    },
    store:session_store,
    rolling:true
}));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/views')));
app.use(express.static(path.join(__dirname+'/lib')));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
app.use('/users', UserRouter)
app.use('/admin', AdminRouter)
app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
});

app.listen(port, function(){ // 3001번 포트로 listen
    console.log(`Server running at ${port}`);
});