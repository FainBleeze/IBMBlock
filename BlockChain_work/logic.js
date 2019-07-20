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
      delCommodity.seller0.record = "下架商品" + delCommodity.seller0.commodityList[i].cmdName;
      delCommodity.seller0.commodityList.splice(i, 1);
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
async function onMakeOrder(makeOrder) {
  var date = new Date();
  let factory = getFactory();
  let id0 = date.toTimeString() + makeOrder.seller0.userID + makeOrder.buyer0.userID;
  for (var i = 0, len = makeOrder.seller0.commodityList.length; i < len; i++) {
    if (makeOrder.seller0.commodityList[i].cmdName == makeOrder.cmd.cmdName) {
      if (makeOrder.seller0.commodityList[i].cmdNum < makeOrder.cmd.cmdNum) {
        makeOrder.seller0.record = "接受订单失败：" + id0;
        makeOrder.buyer0.record = "下单失败：" + id0;
      }
      else {
        var temp = factory.newResource('ibm.work', 'order', id0);
        temp.seller0 = makeOrder.seller0;
        temp.buyer0 = makeOrder.buyer0;
        temp.cmd = makeOrder.cmd;
        temp.state = 'recieved';
        temp.cmd.cmdPrice = makeOrder.seller0.commodityList[i].cmdPrice * temp.cmd.cmdNum;
        makeOrder.seller0.commodityList[i].cmdNum -= temp.cmd.cmdNum;
        makeOrder.seller0.orders.push(id0);
        makeOrder.seller0.record = "接到订单：" + id0;
        makeOrder.buyer0.orders.push(id0);
        makeOrder.buyer0.record = "已下单：" + id0;
        makeOrder.buyer0.money -= temp.cmd.cmdPrice;
        let assetRegistry0 = await getAssetRegistry('ibm.work.order');
        await assetRegistry0.add(temp);
      }
      break;
    }
  }
  let participantRegistry0 = await getParticipantRegistry('ibm.work.seller');
  await participantRegistry0.update(makeOrder.seller0);
  let participantRegistry1 = await getParticipantRegistry('ibm.work.buyer');
  await participantRegistry1.update(makeOrder.buyer0);
}

/**
* A transaction processor function description
* @param {ibm.work.cancelOrder} cancelOrder A human description of the parameter
* @transaction
*/
async function onCancelOrder(cancelOrder) {
  cancelOrder.order0.state = "canceled";
  cancelOrder.order0.buyer0.money += cancelOrder.order0.cmd.cmdPrice;
  for (var i = 0, len = cancelOrder.order0.seller0.commodityList.length; i < len; i++) {
    if (cancelOrder.order0.seller0.commodityList[i].cmdName == cancelOrder.order0.cmd.cmdName) {
      cancelOrder.order0.seller0.commodityList[i].cmdNum += cancelOrder.order0.cmd.cmdNum;
      break;
    }
  }
  for (var i = 0, len = cancelOrder.order0.seller0.orders.length; i < len; i++) {
    if (cancelOrder.order0.seller0.orders[i] == cancelOrder.order0.orderID) {
      cancelOrder.order0.seller0.orders.splice(i, 1);
      break;
    }
  }
  for (var i = 0, len = cancelOrder.order0.buyer0.orders.length; i < len; i++) {
    if (cancelOrder.order0.buyer0.orders[i] == cancelOrder.order0.orderID) {
      cancelOrder.order0.buyer0.orders.splice(i, 1);
      break;
    }
  }
  let assetRegistry = await getAssetRegistry('ibm.work.order');
  let participantRegistry0 = await getParticipantRegistry('ibm.work.buyer');
  let participantRegistry1 = await getParticipantRegistry('ibm.work.seller');
  await assetRegistry.update(cancelOrder.order0);
  await participantRegistry0.update(cancelOrder.order0.buyer0);
  await participantRegistry1.update(cancelOrder.order0.seller0);
}
/**
* A transaction processor function description
* @param {ibm.work.sendOut} sendOut A human description of the parameter
* @transaction
*/

function onSendOut(sendOut) {
  if(sendOut.order0.state == 'recieved'){
  	sendOut.order0.state = 'transporting';
  }
  return getAssetRegistry('ibm.work.order')
    .then(
      function (assetRegistry) {
      return assetRegistry.update(sendOut.order0);
    });
}

/**
* A transaction processor function description
* @param {ibm.work.confirmGet} confirmGet A human description of the parameter
* @transaction
*/

async function onConfirmGet(confirmGet) {
  if(confirmGet.order0.state=='transporting'){
  	confirmGet.order0.state = 'finished';
  	confirmGet.order0.seller0.money += confirmGet.order0.cmd.cmdPrice;
  }
  let participantRegistry1 = await getParticipantRegistry('ibm.work.seller');
  await participantRegistry1.update(confirmGet.order0.seller0);
  let assetRegistry = await getAssetRegistry('ibm.work.order');
  await assetRegistry.update(confirmGet.order0);
}