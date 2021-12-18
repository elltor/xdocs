
# Netty系列｜ChannelHandler

Handler是处理器，那它处理什么呢？网络中有什么它就做那些处理，常见的有连接的建立，响应读写事件，网络中数据的处理如编码、解码等，这些都输**处理器**做的，Netty中的处理器是`ChannelHandler`接口，所有的处理器都是这个接口的实现。

首先说下Netty处理器的定位，它是Netty架构**网络处理**与**业务逻辑**的解耦，**处理器代表了与用户相关的业务逻辑**，如数据读取后端计算和发送，而网络连接管理、线程控制、网络事件监听处理都由Netty接管，使我们可以更加专注业务逻辑，站在开发的角度使用Netty开发接触最多的就是`ChannelHandler`。

处理器有许多种类，通过以下分类你可以先在脑海中建立一个简单的概念。

### 处理器分类

- 入站处理器：处理read事件的数据，通常是解码操作
- 出站处理器：处理write事件的数据，通常是编码操作
- 编解码器：一种专用的数据转换器，例如字节转换为字符串，称之为“解码器”，反之把字符串转换为“字节”称之为“编码器”
- 转换器：复合处理器，把一种数据转换为另一种数据，例如HTTP1转换为HTTP2

### ChannelHandler层次结构

![Handler结构.png](https://oss.elltor.com/uploads/2021/Handler%E7%BB%93%E6%9E%84_1638366848504.png)

### 常用类使用

最常使用的是 ChannelInboundHandlerAdapter、ChannelDuplexHandler、ChannelOutboundHandlerAdapter的实现类，这些类定义了作为不同的类型的方法，例如InboundHandler与OutBoundHandler定义的方法就有很大的差别。

以入站为代表的方法有ByteToMessageDecoder、SimpleChannelInboundHandler。

例如`ByteToMessageDecoder`使用时重写`decode`方法即可，编码器重写 `encode`。

```java
      public class SquareDecoder extends {@link ByteToMessageDecoder} {
          @Override
          public void decode(ChannelHandlerContext ctx,  ByteBuf in, List<Object> out)
                  throws  Exception {
              out.add(in.readBytes(in.readableBytes()));
          }
      }
```

`SimpleChannelInboundHandler<T>` 使用时重写 `channelRead0` 方法即可，Adapter里已经帮我们做好了类型转换。

```java
       public class StringHandler extends SimpleChannelInboundHandler<String> {
            @Override
           protected void channelRead0(ChannelHandlerContext ctx, String message)
                   throws Exception {
               System.out.println(message);
           }
       }
```

ChannelDuplexHandler的继承类实现多是进行数据转换，例如：ByteToMessageCodec将入站的byte数据转化为对象，出站时将对象转换为byte，类似的还有MessageToMessageCodec，实现两个对象间的转化。

### ChannelHandler的几个注意点

1、执行顺序。按照被添加的顺序执行。

2、共享Handler与非共享Handler。共享的handler会帮定到多个Channel，当Channel并行执行时可能存在线程安全问题；非共享handler绑定时就会创建一个，Channel独享不存在线程安全问题。

3、Handler的read会执行多次。当Channel中的数据未处理完，上一个handler会多次触发下个handler的read事件。

(end)
