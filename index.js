const express = require('express')
const request = require('request');
const querystring = require('querystring');
const bodyParser = require("body-parser")
const host = 80
const app = express()
var mysql = require('mysql');

var pool = mysql.createPool({
    host     : 'localhost',
    port     : 3306,
    database : 'smart_billiards',
    user     : 'root',
    password : 'xyh980311'
});
app.listen(80);

app.post('/getcode', function(req, res ){
    var data = {
        'appid': 'wx8eaab2c5cabfcecb',
        'secret': '3305c212e727421f9578b9183cf59d06',
        'js_code': req.query.abc,
        'grant_type': 'authorization_code'
    };
    console.log(data);
    var content = querystring.stringify(data)
    var url = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
    request.get({
        'url': url
    }, (error, response, body) => {
        let result = JSON.parse(body);
        console.log(result);
        let sql = `select * from user_info where open_id = '${result.openid}'`;
        console.log(sql);
        pool.getConnection(function(err, connection){
            connection.query(sql, function(err, rows){
                if(err){
                    console.log('err:', err.message);
                }else{
                    if(rows.length == 0){
                        let sql = `insert into user_info(user_id, status) values('${result.userid}','0')`;
                        console.log(sql);
                        connection.query(sql, function (err, rows) {
                            if (err) {
                                console.log('err:', err.message);
                            }else{
                                console.log(rows);
                                result.id=rows.insertId
                                result.status =0
                                result.userid =null
                                console.log(result);
                                res.json(result)
                            }
                        });
                    }else{
                        console.log(rows);
                        result.id=rows[0].id
                        result.status=rows[0].status
                        result.userid=rows[0].userid
                        console.log(result);
                        res.json(result)
                    }
                }
            });
            connection.release();
        });
    })
});


app.get('/getcode',(req, res) =>{
    console.log(req)
    var data = {
        'appid': 'wx8eaab2c5cabfcecb',
        'secret': '3305c212e727421f9578b9183cf59d06',
        'js_code': req.query.abc,
        'grant_type': 'authorization_code'
    };
    console.log(data);
    // querystring???stringify??????????????????
    var content = querystring.stringify(data);
    // ?????????????????????????????????API
    var url = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
    // ???url????????????get??????
    request.get({
        'url': url
    }, (error, response, body) => {
        // ???body?????????????????????
        let result = JSON.parse(body);
        result.code = req.query.abc;
        console.log(result)
        // ??????JSON????????????
        res.json(result)
    })
})
var server = app.listen(80, function () {
    var port = server.address().port;
})



