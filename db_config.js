
module.exports={
    "mysql":{
        host:"192.168.20.19",
        user:"root",
        password:"Azsxdc123$",
        database:"connect",
        connectionLimit:30
    },
    "mysql-session":{
        host:"192.168.20.19",
        user: "root",
        password:"Azsxdc123$",
        database:"good",
        clearExpired: true,
        checkExpirationInterval:10000,
        expiration:60000,
        connectionLimit: 5,
        endConnectionOnClose:true,
        schema: {
            tableName: 'session_lookup_log',
            columnNames: {
                session_id: 'id',
                expires: 'expires',
                data: 'data'
            }
    
        }
    },
    "adminPageInfo":{
        password:'awefawe'
    }
}