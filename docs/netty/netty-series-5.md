
# Netty系列｜ChannelHandlerContext



ChannelHandlerContext的主要功能是关联 ChannelPipeline与ChannelHandler然后管理ChannelHandler，另一方面是管理和同一个Pipeline中的其他Handler的交互，也就是Handler之间的事件传递。



### ChannelHandlerContext的能力



![image](https://oss.elltor.com/uploads/2021/image-20211202112535841_1638453359892.png)



通过上图里的方法可以看出ChannelHandlerContext的能力：

* 获取ByteBuf分配器
* 获取绑定的Channel
* 获取绑定的Pipeline
* 进行事件通知，以 `fire*` 开头的方法
* 连接管理（`bind`、`connect`、`disconnect`)
* 数据读写（`write`、`wiriteAndFlush`、`read`)



### ChannelHandlerContext与Channel、ChannelPipeline的关系

![image](https://oss.elltor.com/uploads/2021/image-20211202114448544_1638453404832.png)

说明：

1. 每一个ChannelHandlerContext与一个ChannelHandler绑定，一旦关联不会改变，因此缓存ChannelHandlerConntext是安全的
2. 每一个ChannelHandlerContext也与一个ChannelPipeline关联，关联后不会改变
3. 使用ChannelHandlerContext的方法触发的事件从**下一个**节点流转，而使用Pipeline、Channel产生的事件从pipeline头部流转。

特殊情况：由于ChannelHandler可以是共享的，也就是说可以和多个Pipeline关联，此时ChannelHandler对于每一个关联的Pipeline都创建一个ChannelHandlerContext。



### ChannelHandlerContext应用

1. 缓存起来，在其他方法或线程中使用（因为ChannelHandlerContext的绑定是不变的可以放心使用）
2. 控制pipeline，实现协议的切换


EOF : -)
