var useAPI=function(cmdType,data,callback) {
    var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象

    //addSeller, addBuyer, addCommodity, delCommodity, makeOrder, cancelOrder, confirmGet, sendOut
    var base_url = 'http://148.100.87.124:3000/api/ibm.work.';
    var url=base_url+cmdType;
    
    httpRequest.open('POST', url, true); //第二步：打开连接
    httpRequest.setRequestHeader("Content-type", "application/json");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
    httpRequest.send(JSON.stringify(data));//发送请求 将请求体写在send中

    httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
            var json = httpRequest.responseText;//获取到服务端返回的数据
            callback(JSON.parse(json));
        }
    };
};
module.export=useAPI;