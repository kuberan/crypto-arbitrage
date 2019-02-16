var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var arbitrageFunctions = require('./arbitrage_functions');

//const url = 'mongodb://adminuser:oNsz2kXGlBiMd9S2@cluster0-shard-00-00-kokgx.mongodb.net:27017,cluster0-shard-00-01-kokgx.mongodb.net:27017,cluster0-shard-00-02-kokgx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
const url = 'mongodb://myUserAdmin:abc123@localhost:27017';
const dbName = 'binance';
const client = new MongoClient(url);

client.connect(function(err, client) {
	assert.equal(null, err);
	const db = client.db(dbName);

	// Insert a single document
	var cursor = db.collection('binanceOrderBook').find({}).forEach(function(doc) {
		arbitrageFunctions.findTriangularArbitrage(doc.binanceOrderData,checkOrderQuantity=true, profitThresholdPercent=0.3, baseCurrency='BNB', debug=true);
	}, function(err) {
		console.log(err);
		client.close();
	});
});


