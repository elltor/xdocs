#!/bin/bash

# 变量
msg=$1
date=`date "+%m-%d"`
auth=lqc
addr=origin
branch=main

# 执行脚本无参数处理
if [ -z $msg ] 
then
    msg="\"$date $auth\""
else
    msg="\"$msg. $date $auth\""
fi

# 追踪变更
git add . && git status

# 等待一会，方便终止push
# sleep 5
echo $msg
# commit & push
git commit -m "$msg"
# git push $addr HEAD:$branch

echo "OK."
