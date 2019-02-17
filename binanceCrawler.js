var unirest = require('unirest');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

function run()
{
	const url = 'mongodb://myUserAdmin:abc123@localhost:27017';
	const dbName = 'binance';
	const client = new MongoClient(url);

	var utcTimeStampMs = (new Date()).getTime();
	var dateStr = (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString();

	unirest.get('https://api.binance.com/api/v3/ticker/bookTicker')
	.end(function (response) {
		if(response.error)
		{
			console.log(response.error);
			return;
		}
  		//console.log(response.body);
		var jsonStr = response.body;
		var jsonDoc = {'timestamp': utcTimeStampMs, 'time_pst': dateStr, 'binanceOrderData': jsonStr};
		client.connect(function(err, client) {
  			assert.equal(null, err);

  			const db = client.db(dbName);

  			// Insert a single document
  			db.collection('binanceOrderBook').insertOne(jsonDoc, function(err, r) {
    			assert.equal(null, err);
    			assert.equal(1, r.insertedCount);

      			client.close();
  			});
		});

	});
}


setInterval(run, 1000);
