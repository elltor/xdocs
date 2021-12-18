
# Netty系列｜echo详解

> 摘要：这是一个简单的echo程序，它将接收你发过来的数据然后返回给你，通过这个echo程序能了解netty程序如何进行引导、基本组件情况。

### 程序清单

* EchoServer
* EchoServerHandler
* EchoClient
* EchoClientHandler

### 代码

**EchoServer**

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

import java.net.InetSocketAddress;

/**
 * echo server，接收打印client发送过来的数据，并把数据返回给client
 */
public final class EchoServer {

    static final int PORT = Integer.parseInt(System.getProperty("port", "8007"));

    public static void main(String[] args) throws Exception {

        // 配置服务器
        // 主event loop，负责接受（accept）socket连接
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        // 从event loop，负责处理socket的事件
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        // server 的channel处理器
        final EchoServerHandler serverHandler = new EchoServerHandler();
        try {
            // Server引导器（配置器）
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    // 设置ip地址和端口，server默认使用本地ip，也可以通过bind()来设置
                    .localAddress(new InetSocketAddress(PORT))
                    // 配置网络传输参数，例如缓存大小
                    .option(ChannelOption.SO_BACKLOG, 100)
                    // 配置日志打印
                    .handler(new LoggingHandler(LogLevel.INFO))
                    // netty核心组件，pipeline 处理器
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            // 通过channel获取管道对象
                            ChannelPipeline pipeline = ch.pipeline();
                            // 通过管道挂在handler
                            pipeline.addLast(serverHandler);
                        }
                    });

            // 绑定设置的断开（PORT），并阻塞（sync）到绑定完成，绑定完成后就开始监听close信号
            ChannelFuture f = b.bind().sync();

            // 阻塞到接收client发过来关闭（close）信号
            f.channel().closeFuture().sync();
            // 当client发过来close信号后，才会执行这里
        } finally {
            // 关闭所有event loop的线程，并关闭内部的线程
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

}
```

**EchoServerHandler**

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import java.nio.charset.StandardCharsets;

/**
 * Handler implementation for the echo server.
 */
@Sharable
public class EchoServerHandler extends ChannelInboundHandlerAdapter {

    /**  第一次建立连接调用 */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        final char[] chars = "hello client, I am Server.".toCharArray();
        // 建立连接想client发送一句话
        ctx.pipeline().writeAndFlush(Unpooled.copiedBuffer(chars, StandardCharsets.UTF_8));
    }

    /** 客户端发送过来数据调用 */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        final ByteBuf buf = (ByteBuf) msg;
        String recv = "接收：" + buf.toString(StandardCharsets.UTF_8);
        if(recv.indexOf("exit") != -1){
            ctx.close();
            return;
        }
        System.out.print(recv);
        // 将数据传回客户端
        ctx.write(Unpooled.copiedBuffer(recv.getBytes(StandardCharsets.UTF_8)));
    }

    /** 读取完毕，完成一次读事件 */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        // flush - 冲刷数据，flush一次便会触发一次或多次client的read事件，反之server也是
        ctx.flush();
    }

    /** 捕获异常 */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        // 引发异常时关闭连接会
        cause.printStackTrace();
        ctx.close();
    }

}
```

**EchoClient**

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;

import java.nio.charset.StandardCharsets;
import java.util.Scanner;

/**
 * 启动client，可以想server发送消息。server的console可以查看client发送的消息。
 */
public final class EchoClient {

    static final String HOST = System.getProperty("host", "127.0.0.1");
    static final int PORT = Integer.parseInt(System.getProperty("port", "8007"));

    public static void main(String[] args) throws Exception {
        // 配置客户端
        // client工作线程，每一个线程将和一个EventLoop绑定
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            // 客户端引导其
            Bootstrap b = new Bootstrap();
            //配置client启动参数
            b.group(group)
                    // 配置数据通道，不同的数据通道决定了IO的方式，例如Nio开头的是非阻塞IO、Oio的是阻塞IO
                    .channel(NioSocketChannel.class)
                    // 网络传输的参数，例如网络缓存缓存的大小、是否延迟
                    .option(ChannelOption.TCP_NODELAY, true)
                    // 入站、出站处理器
                    // initializer是在入站只执行一次的处理器
                    // 它用来与server建立连接、并在pipeline上挂载编解码处理器、自定义处理器
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ChannelPipeline p = ch.pipeline();
                            //p.addLast(new LoggingHandler(LogLevel.INFO));
                            p.addLast(new EchoClientHandler());
                        }
                    });

            // 与server建立连接（connect），并阻塞（sync）到连接建立
            ChannelFuture f = b.connect(HOST, PORT).sync();
            // 获取建立的连接
            final Channel clientChannel = f.channel();

            System.out.println("input 'exit' to EXIT.");
            Scanner sc = new Scanner(System.in);
            String str;
            // 读取并向server发送数据
            while (!(str = sc.next()).startsWith("exit")) {
                clientChannel.writeAndFlush(Unpooled.copiedBuffer(str.toCharArray(), StandardCharsets.UTF_8));
            }
            // 想server发送断开连接的信号
            clientChannel.close();
            // 获取关闭连接后的结果（future），并阻塞（sync）到接收到server发过来的断开连接信号
            clientChannel.closeFuture().sync();
        } finally {
            // 关闭所有的EventLoop，并终止内部的线程
            group.shutdownGracefully();
        }
    }
}
```

**EchoClientHandler**

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

import java.nio.charset.StandardCharsets;

/**
 * client 端 handler
 */
public class EchoClientHandler extends ChannelInboundHandlerAdapter {

    private final ByteBuf firstMessage;

    public EchoClientHandler() {
        firstMessage = Unpooled.copiedBuffer("start data transfer.\n".toCharArray(), StandardCharsets.UTF_8);
    }

    /**
     * 建立连接向server发送一个消息
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        ctx.writeAndFlush(firstMessage);
    }

    /**
     * client的读事件触发会调用此方法
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        System.out.println("client recv : " + ((ByteBuf) msg).toString(StandardCharsets.UTF_8));
    }

    /**
     * 读取完毕向网络发送数据，flush会触发server的read事件
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        ctx.flush();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }

}
```

通过注释能了解netty运行的组件和开发模式，但可能还会有些疑问，看下面的问题。

### 问题

1、为什么Server和Client使用不同的引导（`Bootstrap`、`ServerBootstrap`）

实际上server和client有很大的不同，client配置只需要一个连接一个线程就够了，而server需要配置多个；channel也有区别，server的channel 一方面与client建立连接（`accept`），另一方面处理client channel的读写事件。因为功能的差异，所以配置存在差异，就导致需要不同的引导器配置。

2、为什么server有两个线程组（`EventLoopGroup`），而client只有一个

server是可以只用一个线程组。这是netty线程模型的缘故，netty使用的是Reactor线程模型。

3、Future

`Future`是异步编程常见词汇，它代表了一个结果，这个结果会在未来的某个时刻发生，而功过`Future`能拿到这个结果。常见的是`ChannelFuture`，它表示了一个操作（如`bind`、监听关闭`closeFuture`）的结果。

4、sync() 方法

这个方法是一个同步方法，会阻塞上个操作，直到满足条件，例如：`closeFuture().sync()` 会阻塞到接收到关闭连接到信号到来。
