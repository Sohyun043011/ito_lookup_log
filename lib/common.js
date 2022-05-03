var db=require('mysql2-promise')();
var db_config=require('../db_config')
const { json } = require('express/lib/response');

function executeSql(sql){
    return new Promise(function(resolve, reject){
        sql=`select count(*) as count from connect.hr_info where emp_id='20200002'`;
        db.configure(db_config.mysql);
        db.query(sql).spread(function(rows){
        return(JSON.parse(JSON.stringify(rows)));
    });
    })
}

module.exports={
    executeSql
}