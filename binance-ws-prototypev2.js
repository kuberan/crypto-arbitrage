const binance = require('node-binance-api')().options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});

/*binance.websockets.depth(['BNBBTC', 'BNBUSDT'], (depth) => {
  let {e:eventType, E:eventTime, s:symbol, u:updateId, b:bidDepth, a:askDepth} = depth;
  console.log(symbol+" market depth update " + (new Date()).getTime());
  console.log(bidDepth, askDepth);
});*/

//first leg order
binance.buy('BNBBTC', 1, 23.0,{type:'LIMIT'}, (error, response) => {
  console.log("Limit Buy response", response);
  console.log("order id: " + response.orderId);
	if (response.orderId)
	{
		var secondLegOrderType = 'BUY';
		//second leg order
		if(secondLegOrderType == 'BUY')
		{
			binance.buy('BNBBTC', 1, 23.0,{type:'LIMIT'}, (error, response2) => {
				//third leg order
				if(response2.orderId)
				{
					binance.sell('BNBBTC', 1, 23.0,{type:'LIMIT'});
				}
			});
		}
		else{
			binance.sell('BNBBTC', 1, 23.0,{type:'LIMIT'}, (error, response2) => {
				//third leg order
				if(response2.orderId)
				{
					binance.sell('BNBBTC', 1, 23.0,{type:'LIMIT'});
				}
                        });

		}
	}
});

/*binance.websockets.depthCache(['BNBBTC', 'BNBUSDT'], (symbol, depth) => {
  let bids = binance.sortBids(depth.bids);
  let asks = binance.sortAsks(depth.asks);
  console.log(symbol+" depth cache update");
  console.log("bids", bids);
  console.log("asks", asks);
  console.log("best bid: "+binance.first(bids));
  console.log("best ask: "+binance.first(asks));
});*/
