var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var arbitrageFunctions = require('./arbitrage_functions');

const url = 'mongodb://myUserAdmin:abc123@localhost:27017';
const dbName = 'binance';
const client = new MongoClient(url);
client.connect(function(err, client) {
	assert.equal(null, err);
	const db = client.db(dbName);

	var cursor = db.collection('binanceOrderBook').find({}).forEach(function(doc) {
		arbitrageFunctions.findTriangularArbitrage(doc.timestamp, doc.binanceOrderData, checkOrderQuantity=true, profitThresholdPercent=0.0, baseCurrency='BTC', debug=true, feePercent=0.3, callback=null);
	}, function(err) {
		console.log(err);
		client.close();
	});
});


