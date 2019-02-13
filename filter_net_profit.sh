grep 'Net Profit: ' output.file | grep '%' | cut -d" " -f3 | sort -n
