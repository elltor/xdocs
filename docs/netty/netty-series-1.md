
# Netty系列｜开篇词



> 摘要：这是最近学习的一些成果，预计会有十几篇文章，我准备用通俗有趣的语言把它分享给你，让你学习Neety变的Easy，敬请期待。

当我们打开Netty官网，会看到一个赫然的标题。

> Netty is an asynchronous event-driven network application framework for rapid development of maintainable high performance protocol servers & clients.

译文：Netty是一个异步事件驱动网络编程框架，用于快速开发可维护的高性能协议服务器和客户端。

从中我们提取一些重点：异步、事件驱动、协议、服务器和客户端。

没错，这就是Netty的特点，基于Reactor线程模型异步能力，基于epoll处理IO的能力，内置了许多协议处理器和编解码器，只需要简单配置，就能实现高性能的服务器-客户端应用。

Netty发展十几年，Java生态许多高性能的中间件都是用了它，例如：Apache Flink、Apache Spark、Elastic Search等，这说明Netty是优良网络编程框架。

> P.S. 你可以点击这个链接了解使用Netty的开源项目 https://netty.io/wiki/related-projects.html



那么Netty有哪些优点呢？以下是几点（不是以上的特点）

1. 基于Reactor模型
2. 使用直接内存避免拷贝开销
3. 提供了多种协议的编解码器，开箱即用
4. 提供了测试工具、内存泄露检测工具等



单拿协议处理器来说，Netty实现了一下协议的处理器，开箱即用！

| 协议                 | 说明                                                         |
| -------------------- | ------------------------------------------------------------ |
| HTTP/HTTP2/Websocket | /                                                            |
| DNS                  | 域名解析服务                                                 |
| MQTT                 | 消息队列遥测传输协议，低功耗的消息传输协议，常用在移动设备的消息推送 |
| SMTP                 | 简单邮件协议                                                 |
| SOCKS                | 一种用于穿透内网防火墙的协议，常实现代理服务器               |
| SCTP                 | 一种基于TCP、UDP优点的传输协议，适用于音视频传输，WebRTC技术就应用了这种协议 |
| STOMP                | 一种简单消息传输协议                                         |
| UDT                  | 基于UDP的可靠传输协议，现在已经废弃                          |



相信到这里你已经有些心动了，当你使用Netty实现一个CS程序时你会不由地感叹Netty的强大与便捷。



### Netty核心组件简介

* Channel：对应于网络的Socket，是一个双向管道，即可以写数据又可以读数据。
* EventLoop：事件循环，每一个事件循环仅与一个线程绑定，用来处理epoll事件。
* Handler：所有的数据读写、编解码、计算等都在这里进行，可以说它是Netty业务逻辑处理等单元。
* Codec：编辑码器，对读取的数据进行解码，对将要发送的数据进行编码，另外它还负责数据压缩和协议转换。
* Pipeline：是Handler链的容器，可以说是业务逻辑处理的大动脉，所有的IO事件都在这里流转。
* ChannelFeaure：代表channel处理的一个结果。
* ChannelHandlerContext：处理器Handler的上下文，从中可以获取Channel，或者进行读写操作关闭链接等操作。



### 网络编程的注意点有哪些？

网络编程总是跟并发密切相关，当你写完第一个网络编程程序会有更加深刻的体会，第一个点是注意线程安全，防止数据出现不一致。

第二点，数据传输安全，通常在没有SSL/TLS保护的应用程是不安全的。

第三点，数据完整性，避免数据缺失等。



先到这里，Netty还有很多🐂技术，比如FastThreadLocal、Jemalloc等，下回见。