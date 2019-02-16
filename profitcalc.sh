#Assuming that there are not any duplicate transactions

grep 'Net Profit after fee: (' usdt_backtest.file | sort -n | uniq | cut -d" " -f6 > ./usdt_profits.txt
cat usdt_profits.txt | sort -n
echo "Total"
cat ./usdt_profits.txt | awk '{s+=$1} END {print s}'
