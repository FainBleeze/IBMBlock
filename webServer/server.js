const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var bizNetworkConnection = new BusinessNetworkConnection();

let businessNetworkDefinition = await bizNetworkConnection.connect('admin@online-shopping');