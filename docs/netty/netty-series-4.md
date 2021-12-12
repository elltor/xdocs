
# Netty系列｜ChannelPipeline




> ChannelPipeline是ChannelHandler链的容器，可以说是业务逻辑处理的大动脉，所有的IO事件都在这里流转。


**ChannelPipeline负责ChannelHandler的编排，其次是传递Channel的事件通知。**


<img src="https://oss.elltor.com/uploads/2021/ChannelPipeline_1638368797834.png" alt="ChannelPipeline" style="zoom: 100%" />



### 通过图说明ChannelPipeline的要点

1、每一个ChannelPipeline和Channel唯一绑定

2、ChannelPipeline是一个带有头和尾的双向管道，事件可以从头到尾流动，也可以从尾到头流动。

3、写ChannelPipeline的事件会是从Pipeline的头部开始流动事件

4、通常，如果事件从头到尾流动我们称为**入站**，从尾到头称为**出站**，入站的第一个ChannelHandler的序号是1，出站的第一个ChannelHandler是序号4。

