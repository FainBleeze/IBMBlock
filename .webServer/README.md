# 网页应用后端Node.js服务器

###### BY 刘莊

+ 已完成后端的部署，

+ 通过node.js连接IBM区块链平台提供的API，实现了web服务器的功能

+ 服务器和网页前端之间使用websocket进行通讯。

+ 前端需要的语句：

  1. 建立基本的websocket连接,以下内容复制粘贴即可

  ~~~javascript
  //var ws = new WebSocket('ws://127.0.0.1:8181/');
  ws = new WebSocket('ws://f23950z739.qicp.vip:47012/');
  ws.onopen = function (event) {
  			console.log("WS was opened.");
  		};
  ws.onerror = function (event) {
  		console.log("WS fired an error");
  		//toast.show('网络连接出错！');
  		};
  ws.onclose = function (event) {
  		console.log("WebSocket instance closed.");
  		};
~~~
  
2. 向服务器发送消息
  
   ~~~ javascript
  //添加商家
var data1 = {
  			tag: 'addSeller',
			money:0
  		};
  ws.send(JSON.stringify(data1));
  //添加商品
  var data2 = {
  			tag: 'addCommodity',
  			userID:'string',
      		name:'string',
      		num:1,
      		price:5.0
  		};
  ws.send(JSON.stringify(data2));
   ~~~
  
  + 在上面的实例里，我们首先定义了一个字典类型的data数据，为了便于交互，我们本次项目服务器和前端之间互相发送的数据都是这样一个字典类型的数据，而且一定要有tag元素来标记数据的类型，不同的操作命令就是根据这个tag标签来区分的。目前服务器端可以接受的tag有：
    - getSeller*获取全部商家信息,不需要其他数据*
    - getBuyer*获取全部客户信息,不需要其他数据
    - getOrder*获取全部订单信息,不需要其他数据
    - addSeller*添加商家，需要数据 money*
    - addBuyer*添加客户，需要数据money*
    - addCommodity*添加商品，需要userID商家ID，name商品名，num商品数量，price商品价格，注意，在代码中，这些数据的变量名要和此文档严格一致*
    - delCommodity*删除商品，需要商家的userID，name 商品名*
    - makeOrder*添加订单,需要sellerID,buyerID，要购买的商品数量num，商品名name*
    - cancelOrder*删除订单，需要订单orderID*
    - confirmGet*确认收货，需要订单orderID*
    - sendOut*确认发货，需要订单orderID*
  + 前端应该在有需要的时候向后端发送这些命令，后端会传回响应的信息，回传时的tag和前端发送使用的tag相同。例如，发送getSeller命令之后，后端会传回包含所有的商家的一个列表，传回的消息也含有值为为getSeller的tag，要对传回的消息进行处理，请看第3点。
  
  3. 接受来自服务器的数据msg，此部分内容一般和第1点的内容放在一起，不同的指令用if语句区分，向服务器发送请求之后，对前端页面的更新操作要放在if语句中执行。

~~~ javascript
ws.onmessage=function (event) {
	var msg = JSON.parse(event.data);
    if (msg.tag == 'getSeller') {
        //获取所有卖家后，做一些刷新页面之类的工作
    }
    if(msg.tag == 'addCommodity'){
        //添加商品后，要刷新商品列表
    }
~~~

- 不同tag命令的应答数据的结构：

  等待更新...