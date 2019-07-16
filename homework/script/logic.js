/**
 * 逻辑执行文件,每个函数前必须有一段注释，尤其注意第二行定义了对应的事务和函数使用的参数名。
 * 下面的第一个函数已在playground中验证可以正常运行，还剩5个未实现的功能。
 * 未发货自动退款和超过10天未签收会自动退货、订单签收一周后自动确认
 *            等自动化功能可以在状态转换时通过setTimeOut(回调函数, 毫秒数)实现
 */

/**
* A transaction processor function description
* @param {ibm.work.addCommodity} addCommodity A human description of the parameter
* @transaction
*/
function onAddCommodity(addCommodity) {
  var temp = addCommodity.newCommodity
  addCommodity.seller0.commodityList.push(temp);
  //更新资产时获取资产注册表getAssetRegistry,此处更新的是参与者，所以有所不同
  return getParticipantRegistry('ibm.work.seller').then(
    function (participantRegistry) {
      return participantRegistry.update(addCommodity.seller0);
    });
}

/**
* A transaction processor function description
* @param {ibm.work.delCommodity} delCommodity A human description of the parameter
* @transaction
*/
function onDelCommodity(delCommodity) {
  for (var i = 0, len = delCommodity.seller0.commodityList.length; i < len; i++) {
    if (delCommodity.seller0.commodityList[i].cmdName == delCommodity.cmdName) {
     	delCommodity.seller0.record="下架商品"+delCommodity.seller0.commodityList[i].cmdName;
      delCommodity.seller0.commodityList.splice(i,1);
      break;
    }
  }
  return getParticipantRegistry('ibm.work.seller').then(
    function (participantRegistry) {
      return participantRegistry.update(delCommodity.seller0);
    });
  }

/**
* A transaction processor function description
* @param {ibm.work.makeOrder} makeOrder A human description of the parameter
* @transaction
*/
async function onMakeOrder(makeOrder){
  var myDate = new Date();
  let factory = this.businessNetworkDefinition.getFactory();
  temp = factory.newResourse('ibm.work', 'order', 'orderID:1234567890');
  temp.seller0 = seller0;
  temp.buyer0 = buyer0;
  temp.state = recieved;
  temp.time = myDate.getTime();
  for(var i = 0, len = makeOrder.seller0.commodityList.length; i < len; i++){
    if(makeOrder.seller0.commodityList[i].cmdName == makeOrder.cmdName){
      temp.cmd = makeOrder.seller0.commodityList[i];
      break;
    }
  }
  makeOrder.seller0.orders.push(temp);
  makeOrder.buyer0.orders.push(temp);
  //makeOrder.seller0.money += temp.cmd.cmdPrice;
  makeOrder.buyer0.money -= temp.cmd.cmdPrice;
  let participantRegistry0 = await getParticipantRegistry('ibm.work.seller');
  let participantRegistry1 = await getParticipantRegistry('ibm.work.buyer');
  await participantRegistry0.update(makeOrder.seller0);
  await participantRegistry1.update(makeOrder.buyer0);
  setTimeout(
    function(){
      if(temp.state != got && temp.state != finished && temp.state != cancled){
        temp.state = cancled;
        makeOrder.buyer0.money += temp.cmd.cmdPrice;
      }
    }
  ,864000000);
}

/**
* A transaction processor function description
* @param {ibm.work.cancleOrder} cancleOrder A human description of the parameter
* @transaction
*/
function onCancleOrder(cancleOrder){
  cancleOrder.order0.state = cancled;
  cancleOrder.order0.buyer0.money += cancleOrder.order0.cmd.cmdPrice;
  let assetRegistry = await getAssetRegistry('ibm.work.order');
  let participantRegistry = await getParticipantRegistry('ibm.work.buyer');
  await assetRegistry.update(cancleOrder.order0);
  await participantRegistry.update(cancleOrder.order0.buyer0);
}

//创建新订单时不能直接使用new，下面是官方文档给出的生成新资源的JS语句：
// let factory = this.businessNetworkDefinition.getFactory();此句照抄
// 下面调用的函数的三个参数是，命名空间，资源名称，辨识ID定义
// owner = factory.newResource('ibm.work', 'order', 'orderID:1234567890');
// 接下来就可以对新生成的资源进行各种操作
// owner.firstName = 'Fred';
// owner.lastName = 'Bloggs';