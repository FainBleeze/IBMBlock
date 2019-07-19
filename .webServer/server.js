var request = require('request');
var getAll = function (cmdType, callback) {
    //addSeller, addBuyer, addCommodity, delCommodity, makeOrder, cancelOrder, confirmGet, sendOut
    var base_url = 'http://148.100.87.124:3000/api/ibm.work.';
    var url0 = base_url + cmdType;

    request(url0, function (error, response, body) {
        if (!error && response.statusCode == 200) {//验证请求是否发送成功
            callback(JSON.parse(body));
        }
    });
    return;
};

var useAPI = function (cmdType, data, callback) {
    var base_url = 'http://148.100.87.124:3000/api/ibm.work.';
    var url0 = base_url + cmdType;
    var cfg = {
        url: url0,
        method: "POST",
        json: true,
        headers: {
            "Content-type": "application/json",
        },
        body: data
    };

    request(cfg, function (error, response, body) {
        if (!error && response.statusCode == 200) {//验证请求是否发送成功
            callback(JSON.parse(body));
        }
    });
};
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8181 });
var sellernum = 10;
var buyernum = 10;
wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (msg) {
        console.log(msg);
        msg = JSON.parse(msg);

        //获取商家全部信息
        if (msg.tag == 'getSeller') {
            if (typeof (msg.id) != 'undefined') {
                getAll('seller/' + msg.id, function (resp) {
                    console.log('getting one');
                    console.log(JSON.stringify(resp));
                    resp.tag = 'getSeller';
                    ws.send(JSON.stringify(resp));
                    console.log(JSON.stringify(resp));
                });
            }
            else {
                getAll('seller', function (resp) {
                    console.log('getting sellers');
                    resp.tag = 'getSeller';
                    ws.send(JSON.stringify(resp));
                    console.log(JSON.stringify(resp));
                });
            }
        }

        //获取买家全部信息
        if (msg.tag == 'getBuyer') {
            if (typeof (msg.id) != 'undefined') {
                getAll('buyer/' + msg.id, function (resp) {
                    resp.tag = 'getBuyer';
                    ws.send(JSON.stringify(resp));
                });
            }
            else {
                getAll('buyer', function (resp) {
                    resp.tag = 'getBuyer';
                    ws.send(JSON.stringify(resp));
                });
            }
        }
        //获取全部订单信息
        if (msg.tag == 'getOrder') {
            if (typeof (msg.id) != 'undefined') {
                getAll('order/' + msg.id, function (resp) {
                    resp.tag = 'getOrder';
                    ws.send(JSON.stringify(resp));
                });
            }
            else {
                getAll('order', function (resp) {
                    resp.tag = 'getOrder';
                    ws.send(JSON.stringify(resp));
                });
            }
        }

        //需要数据 money注册资金
        if (msg.tag == 'addSeller') {
            sellernum++;
            data = {
                "$class": "ibm.work.seller",
                "cmdName": [],
                "cmdPrice": [],
                "cmdNum": [],
                "orders": [],
                "userID": 's' + sellernum,
                "money": 0,
                "record": "string"
            };
            useAPI('seller', data, function (resp) {
                resp.tag = 'addSeller';
                ws.send(JSON.stringify(resp));
            });
        }
        //添加客户，需要数据money,注册资金
        if (msg.tag == 'addBuyer') {
            buyernum++;
            data = {
                "$class": "ibm.work.seller",
                "orders": [],
                "userID": 'b' + sellernum,
                "money": msg.money,
                "record": "new buyer"
            };
            useAPI('buyer', data, function (resp) {
                resp.tag = 'addSeller';
                ws.send(JSON.stringify(resp));
            });
        }

        //添加商品，需要商家id，商品名，商品数量，商品价格
        if (msg.tag == 'addCommodity') {
            data = {
                "$class": "ibm.work.addCommodity",
                "seller0": "resource:ibm.work.seller#" + msg.userID,
                "newCommodity": {
                    "$class": "ibm.work.cmds",
                    "cmdNum": msg.name,
                    "cmdName": msg.num,
                    "cmdPrice": msg.price
                }
            }
            useAPI('addCommodity', data, function (resp) {
                resp.tag = 'addCommodity';
                ws.send(JSON.stringify(resp));
            });
        }
        //删除商品，需要商家id，商品名
        if (msg.tag == 'delCommodity') {
            data = {
                "$class": "ibm.work.addCommodity",
                "seller0": "resource:ibm.work.seller#" + msg.userID,
                "cmdName": msg.name
            }
            useAPI('delCommodity', data, function (resp) {
                resp.tag = 'delCommodity';
                ws.send(JSON.stringify(resp));
            });
        }
        //添加订单,需要商家ID,买家ID，要购买的商品数量，商品名
        if (msg.tag == 'makeOrder') {
            data = {
                "$class": "ibm.work.makeOrder",
                "seller0": "resource:ibm.work.seller#" + msg.sellerID,
                "buyer0": "resource:ibm.work.seller#" + msg.buyerID,
                "cmd": {
                    "$class": "ibm.work.cmds",
                    "cmdNum": msg.num,
                    "cmdName": msg.name,
                    "cmdPrice": 0
                }
            };
            useAPI('makeOrder', data, function (resp) {
                resp.tag = 'makeOrder';
                ws.send(JSON.stringify(resp));
            });
        }

        //删除订单，需要订单ID
        if (msg.tag == 'cancelOrder') {
            data = {
                "$class": "ibm.work.cancelOrder",
                "order0": "resource:ibm.work.order#" + msg.orderID,
            };
            useAPI('cancelOrder', data, function (resp) {
                resp.tag = 'cancelOrder';
                ws.send(JSON.stringify(resp));
            });
        }

        //确认收货，需要订单ID
        if (msg.tag == 'confirmGet') {
            data = {
                "$class": "ibm.work.cancelOrder",
                "order0": "resource:ibm.work.order#" + msg.orderID,
            };
            useAPI('confirmGet', data, function (resp) {
                resp.tag = 'confirmGet';
                ws.send(JSON.stringify(resp));
            });
        }
        //确认发货，需要订单ID
        if (msg.tag == 'sendOut') {
            data = {
                "$class": "ibm.work.cancelOrder",
                "order0": "resource:ibm.work.order#" + msg.orderID,
            };
            useAPI('sendOut', data, function (resp) {
                resp.tag = 'sendOut';
                ws.send(JSON.stringify(resp));
            });
        }

    });
});