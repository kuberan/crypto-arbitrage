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

binanceWS.onDepthLevelUpdate('BTTNEO',5, (data) => {
        console.log('PAX/BTT bid:' + data.bids[0][0]);
        console.log('PAX/BTT ask:' + data.asks[0][0]);
});
