#!/bin/sh
# 替换 flag.php 中的 {{flag}} 为环境变量 $FLAG
sed -i "s/{{flag}}/$FLAG/g" /var/www/localhost/htdocs/flag.php
# 清除环境变量（安全措施）
export FLAG="flag"
FLAG="flag"
# 启动 Apache
httpd -D FOREGROUND
