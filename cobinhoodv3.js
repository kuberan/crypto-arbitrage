var unirest = require('unirest');
var assert = require('assert');

const Client = require('node-cobinhood');
let client = new Client({ key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW5faWQiOiJmNjI0ZmRkNS0wODVlLTQ2ZGQtOTI0MC1kOTc2YzVmNDRlMjciLCJzY29wZSI6WyJzY29wZV9leGNoYW5nZV90cmFkZV9yZWFkIiwic2NvcGVfZXhjaGFuZ2VfdHJhZGVfd3JpdGUiLCJzY29wZV9leGNoYW5nZV9vYXV0aDJfY2xpZW50X3JlYWQiLCJzY29wZV9leGNoYW5nZV9vYXV0aDJfY2xpZW50X3dyaXRlIl0sInVzZXJfaWQiOiI1MzMxYThlZS1mMjYzLTQ3MDMtOWVjZS03NjVmMTI5ZWRlZWQifQ.tVFgka4j84S_fAUD9Gi6Md1vqNUF5Nxl6k3zTNMlQ_4.V2:a9e07e63edf4a3f66c91c866252190bd1e40aabe4fa7fd343e243752a3f79eba', disableWS: true});

function run()
{
	var tickerData = {};
	unirest.get('https://api.cobinhood.com/v1/market/tickers/BTC-USDT')
	.end(function (response) {
		if(response.error)
		{
			console.log(response.error);
			return;
		}
}

//setInterval(run, 1000);
run();
