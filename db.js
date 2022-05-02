const mysql=require('mysql');
const requestIp=require('request-ip')

var db_info={
    host:"192.168.20.19",
    user:"root",
    password:"Azsxdc123$",
    database:"connect"
}

module.exports={
    db_info : db_info,
    init:function(){
        return mysql.createConnection(db_info);
    },
    connect: function(conn){
        conn.connect(function(err){
            if(err) console.error("mysql connection error : " + err);
            else console.log('mysql is connected successfully.');
        })
    },
    options: { // 세션저장 테이블 지정하기!!!!!!!!!!꼭
        host:"192.168.20.19",
        user:"root",
        password:"Azsxdc123$",
        database:"good",
        clearExpired: true,
        checkExpirationInterval:10000,
        expiration:60000,
        connectionLimit: 5,
        endConnectionOnClose:true,
    },
    get_ip : function(req){
        const connection_info=requestIp.getClientIp(req).split(':'); // req 헤더정보 분리
        let ip='localhost';
        if(connection_info.length==4){ // ipv4 추출
            ip=connection_info[3];
        }
        return ip;
    }
}