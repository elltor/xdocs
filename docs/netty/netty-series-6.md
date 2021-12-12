
# Netty系列｜异常处理

## 异常处理

> 摘要：异常处理在任何系统中都是重要的组成部分，Netty的异常处理是通过在ChannelHandler中重写exceptionCaught方法来实现，这篇文章聚焦于此。

> Netty 版本：4.1.70.Final

### 一、异常处理方式

1、捕获异常处理

```java
    public static class InboundHandler extends ChannelInboundHandlerAdapter {
        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
            // 处理异常
            System.err.println(this.getClass().getSimpleName() + " ---- " + cause.getMessage());
            // 向下一个handler传递异常
            ctx.fireExceptionCaught(cause);
        }
    }
```

P.S. 传递异常将从下个handler一直往后传递，不会跳过OutboundHandler。

<br>

2、通过监听Funture、Promise处理

1）在调研`write`、`writeAndFlush`可以获得得到ChannelFeature，进而可以监听执行结果是否成功、异常。通常在InboundHandler中使用。

```java
            ctx.executor().schedule(()->{
                channelFuture.addListener(new ChannelFutureListener() {
                    @Override
                    public void operationComplete(ChannelFuture future) throws Exception {
                        System.out.println("writeAndFlush done.");
                        if(future.isSuccess()){
                            System.out.println("send success.");
                        }else{
                       		// 处理异常
                            System.out.println("send fail!");
                        }
                    }
                });
            }, 0, TimeUnit.SECONDS);
```



2）在OutboundHandler中，write方法的入参会带有个`Promise`参数，通过Promise对象可以处理异常，处理后将通知之前的handler。使用时通过`setSuccess`、`setFailure`设置。



### 三、源码分析

1、是谁触发 `exceptionCaught` 方法

主要是AbstractChannelhandlerContext#invokeExceptionCaught方法。

```java
    private void invokeExceptionCaught(final Throwable cause) {
        if (invokeHandler()) {
            try {
                // 
                handler().exceptionCaught(this, cause);
            } catch (Throwable error) {
                if (logger.isDebugEnabled()) {
                    logger.debug(
                        "An exception {}" +
                        "was thrown by a user handler's exceptionCaught() " +
                        "method while handling the following exception:",
                        ThrowableUtil.stackTraceToString(error), cause);
                } else if (logger.isWarnEnabled()) {
                    logger.warn(
                        "An exception '{}' [enable DEBUG level for full stacktrace] " +
                        "was thrown by a user handler's exceptionCaught() " +
                        "method while handling the following exception:", error, cause);
                }
            }
        } else {
            fireExceptionCaught(cause);
        }
    }
```

当channel触发事件调用invokeChannelActive、invokeChannelRead过程中出现异常调用invokeExceptionCaught。

```java
    private void invokeChannelActive() {
        if (invokeHandler()) {
            try {
                ((ChannelInboundHandler) handler()).channelInactive(this);
            } catch (Throwable t) {
            	// 处理异常
                invokeExceptionCaught(t);
            }
        } else {
            fireChannelInactive();
        }
    }

    private void invokeChannelRead(Object msg) {
        if (invokeHandler()) {
            try {
                ((ChannelInboundHandler) handler()).channelRead(this, msg);
            } catch (Throwable t) {
            	// 处理异常
                invokeExceptionCaught(t);
            }
        } else {
            fireChannelRead(msg);
        }
    }
```

<br>

2、如果我们创建的Handler不处理异常，那么会由Pipeline中名为`tail` 的ChannelHandlerContext来捕获异常并打印。

可以看到DefaultChannelPipeline中有两个内部类：TailContext、HeadContext，最后的异常就是被TailContext的实力`tail`处理的，可以看到 `onUnhandledInboundException` 方法中使用 `warn` 级别输出了异常信息。

```java
   // A special catch-all handler that handles both bytes and messages.
    final class TailContext extends AbstractChannelHandlerContext implements ChannelInboundHandler {

        TailContext(DefaultChannelPipeline pipeline) {
            super(pipeline, null, TAIL_NAME, TailContext.class);
            setAddComplete();
        }

        @Override
        public void userEventTriggered(ChannelHandlerContext ctx, Object evt) {
            onUnhandledInboundUserEventTriggered(evt);
        }

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            // 处理最后的异常，方法如下
            onUnhandledInboundException(cause);
        }
        // 省略...
    }
    
    /**
     * 处理最后的异常
     * Called once a {@link Throwable} hit the end of the {@link ChannelPipeline} without been handled by the user
     * in {@link ChannelHandler#exceptionCaught(ChannelHandlerContext, Throwable)}.
     */
    protected void onUnhandledInboundException(Throwable cause) {
        try {
            logger.warn(
                    "An exceptionCaught() event was fired, and it reached at the tail of the pipeline. " +
                            "It usually means the last handler in the pipeline did not handle the exception.",
                    cause);
        } finally {
            ReferenceCountUtil.release(cause);
        }
    }
    
    final class HeadContext extends AbstractChannelHandlerContext
            implements ChannelOutboundHandler, ChannelInboundHandler {

        private final Unsafe unsafe;

        HeadContext(DefaultChannelPipeline pipeline) {
            super(pipeline, null, HEAD_NAME, HeadContext.class);
            unsafe = pipeline.channel().unsafe();
            setAddComplete();
        }
		
        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            ctx.fireExceptionCaught(cause);
        }
        // 省略...
    }
```


EOF