#Assuming that there are not any duplicate transactions

grep 'Net Profit: (' output.file | cut -d" " -f4 > ./numbers.txt
cat numbers.txt | sort -n
echo "Total"
cat ./numbers.txt | awk '{s+=$1} END {print s}'
