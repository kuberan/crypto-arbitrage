const api = require('binance');

const binanceWS = new api.BinanceWS(true);

/*
binanceWS.onDepthLevelUpdate('BTCUSDT',5, (data) => {
	console.log('BTC/USDT bid:' + data.bids[0][0]);
	console.log('BTC/USDT ask:' + data.asks[0][0]);
});

binanceWS.onDepthLevelUpdate('BTTUSDT',5, (data) => {
	console.log('BTT/USDT bid:' + data.bids[0][0]);
        console.log('BTT/USDT ask:' + data.asks[0][0]);
});
*/

//binanceWS.onDepthLevelUpdate('BTCUSDT',5, (data) => {
//        console.log('BTC/USDT bid:' + data.bids[0][0]);
//        console.log('BTC/USDT ask:' + data.asks[0][0]);
//});

binanceWS.onDepthLevelUpdate('BTCUSDT',20, (data) => {
        console.log('BTC/USDT bid price: ' + data.bids[0][0]);
	console.log('BTC/USDT bid qty: ' + data.bids[0][1]);
        console.log('BTC/USDT ask price: ' + data.asks[0][0]);
	console.log('BTC/USDT ask qty: ' + data.asks[0][0]);
	console.log(data);
});
