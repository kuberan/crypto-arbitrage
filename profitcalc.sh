#Assuming that there are not any duplicate transactions

grep 'Net Profit after fee: (' usdt_backtest.file | sort -n | uniq | cut -d" " -f6 > ./usdt_profits.txt
cat usdt_profits.txt | sort -n
echo "Total Profit (USDT)"
cat ./usdt_profits.txt | awk '{s+=$1} END {print s}'

grep 'Net Profit after fee: (' btc_backtest.file | sort -n | uniq | cut -d" " -f6 > ./btc_profits.txt
cat btc_profits.txt | sort -n
echo "Total Profit (BTC)"
cat ./btc_profits.txt | awk '{s+=$1} END {print s}'

grep 'Net Profit after fee: (' eth_backtest.file | sort -n | uniq | cut -d" " -f6 > ./eth_profits.txt
cat eth_profits.txt | sort -n
echo "Total Profit (ETH)"
cat ./eth_profits.txt | awk '{s+=$1} END {print s}'

grep 'Net Profit after fee: (' bnb_backtest.file | sort -n | uniq | cut -d" " -f6 > ./bnb_profits.txt
cat bnb_profits.txt | sort -n
echo "Total Profit (BNB)"
cat ./bnb_profits.txt | awk '{s+=$1} END {print s}'
