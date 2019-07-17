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
  var temp = addCommodity.newCommodity;
  addCommodity.seller0.commodityList.push(temp);
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
  var date = new Date();
  let factory = getFactory();
  let id0=date.toTimeString()+makeOrder.seller0.userID+makeOrder.buyer0.userID;

  temp = factory.newResource('ibm.work', 'order', 'orderID:'+id0);
  temp.seller0 = makeOrder.seller0;
  temp.buyer0 = makeOrder.buyer0;
  temp.cmd=makeOrder.cmd;
  temp.state = 'recieved';

  for(var i = 0, len = makeOrder.seller0.commodityList.length; i < len; i++){
    if(makeOrder.seller0.commodityList[i].cmdName == makeOrder.cmd.cmdName){
      temp.cmd.cmdPrice=makeOrder.seller0.commodityList[i].cmdPrice*temp.cmd.cmdNum;
      makeOrder.seller0.commodityList[i].cmdNum-=temp.cmd.cmdNum;
      break;
    }
  }
  makeOrder.seller0.orders.push(id0);
  makeOrder.seller0.record="接到订单："+id0;
  makeOrder.buyer0.orders.push(id0);
  makeOrder.buyer0.record="已下单："+id0;
  makeOrder.buyer0.money -= temp.cmd.cmdPrice;

  let assetRegistry0=await getAssetRegistry('ibm.work.order');
  let participantRegistry0 = await getParticipantRegistry('ibm.work.seller');
  let participantRegistry1 = await getParticipantRegistry('ibm.work.buyer');
  await assetRegistry0.update(temp);
  await participantRegistry0.update(makeOrder.seller0);
  await participantRegistry1.update(makeOrder.buyer0);
}

/**
* A transaction processor function description
* @param {ibm.work.cancelOrder} cancelOrder A human description of the parameter
* @transaction
*/
async function onCancelOrder(cancelOrder){
  cancelOrder.order0.state = canceled;
  cancelOrder.order0.buyer0.money += cancelOrder.order0.cmd.cmdPrice;
  let assetRegistry = await getAssetRegistry('ibm.work.order');
  let participantRegistry = await getParticipantRegistry('ibm.work.buyer');
  await assetRegistry.update(cancelOrder.order0);
  await participantRegistry.update(cancelOrder.order0.buyer0);
}

//创建新订单时不能直接使用new，下面是官方文档给出的生成新资源的JS语句：
// let factory = this.businessNetworkDefinition.getFactory();此句照抄
// 下面调用的函数的三个参数是，命名空间，资源名称，辨识ID定义
// owner = factory.newResource('ibm.work', 'order', 'orderID:1234567890');
// 接下来就可以对新生成的资源进行各种操作
// owner.firstName = 'Fred';
// owner.lastName = 'Bloggs';