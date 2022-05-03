var db=require('../../db');
const { json } = require('express/lib/response');

function search_emp_id(emp_id){
    return new Promise(function(resolve, reject){
        conn=db.init();
        db.connect(conn);

        sql=`select count(*) as count from connect.hr_info where emp_id=${emp_id}`;
        
        conn.query(sql, function(err, result){
            if(err) throw err;
        
            if(JSON.parse(JSON.stringify(result))[0]['count']==1){ 
                resolve('true');
            }
            else resolve('false');
        });
        conn.end();
    })
}

module.exports={
    search_emp_id
}
