
# Netty系列｜EventLoop

## EventLoop

> EventLoop是Netty的工作线程，EventLoop是单线程的，每一个EventLoop永远只和一个Java线程绑定，这使得EventLoop处理读写事件是线程安全的（非共享Handler）。



> Netty 版本：4.1.70.Final

### EventLoop类结构

![EventLoop类结构](https://oss.elltor.com/uploads/2021/image_1639217389525.png)



无论是EpollEventLoop、NioEventLoop、KQueueEventLoop都是直接接触SingleThreadEventLoop实现的，这个类也再次验证了EventLoop是单线程的。



### 类、接口主要作用



| 名字                           | 类型 | 作用                                                         |
| ----------------------------- | ------ | ----------------------------------------------------------- |
| Executor                       | 接口   | 主要定义一个可执行的execute方法                              |
| ExecutorService                | 接口   | 定义了对任务（Task）的控制方法，如提交（submit）、结束（shutdown）和状态方法（isShutdown）等 |
| ScheduledExecutorService       | 接口   | 定义了定时类任务提交方法，特点是方法入参须传入时间和时间单位 |
| AbstractExecutorService        | 抽象类 | 默认实现了ExecutorService的方法                      |
| EventExecutorGroup             | 接口   | 定义了组Executor的操作方法，核心方法是next用于返回一个组管理的Executor。 |
| EventLoopGroup                 | 接口   | 特殊的EventExecutorGroup，允许注册Channel，用于选择Channel   |
| EventExecutor                  | 接口   | 定义了一些方法，检测线程是否在EventLoop中运行 |
| AbstractEventExecutor          | 抽象类 | 默认EventExecutor接口的实现                                  |
| AbstractScheduledEventExecutor | 抽象类 | 支持定时任务的EventExecutor接口的默认实现                    |
| SingleThreadEventExecutor      | 抽象类 | 单线程EventExecutor的默认实现，单线程Executor基类            |
| EventLoop                      | 接口   | 定义获取父EventLoop的方法parent                              |
| SingleThreadEventLoop          | 抽象类 | EventLoop的抽象基类，它在单个线程中执行所有提交的任务。      |
| NioEventLoop                   | 类     | 聚合Nio Selector对象的类                                     |
| EpollEventLoop                 | 类     | 聚合Epoll fd、Epoll event的类                                |



### EventLoop核心源码分析



#### AbstractScheduledEventExecutor

ScheduledEventExecutor的核心功能是创建执行执行定时任务，这些功能对应的方法是：

```java
public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit)
public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit) 
public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit)
public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit)
```



上边的这些方法最后都会调用一个私有的`schedule`方法，这个方法是ScheduledEventExecutor的核心。

```java
    /**
     * 核心方法，所有暴露的schedule方法最后都调用此方法
     * @param task 可执行的对象（实现Runnable）且具有返回值（实现Future）
     * @return task执行结果，可获取执行结果（success/failure），可以监听状态
     */
    private <V> ScheduledFuture<V> schedule(final ScheduledFutureTask<V> task) {
        // 判断在哪里创建（schedule）定时任务
        if (inEventLoop()) {
            // 在EventLoop线程中
            // 如果是在EventLoop（handler执行上下文）中创建的定时任务，就放到任务执行队列中
            scheduleFromEventLoop(task);
        } else {
            // 在外部线程 e.g. main线程调用schedule创建定时任务

            // 截止时间 （当前 - ScheduleFutureTask创建时间）
            final long deadlineNanos = task.deadlineNanos();
            // 任务提交前回调判断，true 立即执行任务，false 延迟执行
            if (beforeScheduledTaskSubmitted(deadlineNanos)) {
                // execute表示调用执行（立即run），是个未实现的方法，未来由子类实现，由父类调用
                execute(task);
            } else {
                // 在不重写父类lazyExecute时默认仍然使用当前EventLoop线程执行
                lazyExecute(task);
                // 任务提交之后回调，方法返回true唤醒当前EventLoop线程，false不唤醒
                if (afterScheduledTaskSubmitted(deadlineNanos)) {
                    // 官方解释是为了避免线程竞争
                    // WAKEUP_TASK这个任务run方法没有执行的语句，使线程保持活跃（等待->可执行，持有CPU资源），避免线程竞争CPU开销
                    execute(WAKEUP_TASK);
                }
            }
        }
        return task;
    }
```



```java
    // 在EventLoop中创建的定时任务放在taskQueue, 方便EventGroup调度
	final void scheduleFromEventLoop(final ScheduledFutureTask<?> task) {
        // nextTaskId a long and so there is no chance it will overflow back to 0
        scheduledTaskQueue().add(task.setId(++nextTaskId));
    }
```



#### SingleThreadEventExecutor

这个类主要实现了任务的**启动、执行、结束**。

```java
private void doStartThread();
// 执行一个任务
public void execute(Runnable task);
// 关闭
public Future<?> shutdownGracefully(long quietPeriod, long timeout, TimeUnit unit);
```



#### SingleThreadEventLoop

SingleThreadEventLoop是EventLoop的抽象基类，且继承了SingleThreadEventExecutor，这个类的主要作用是通过构造器组装父类需要的属性。



#### NioEventLoop

这个类继承了SingleThreadEventLoop，内部聚合Nio Selector，作用是将Channel注册到Selector并且在事件循环中对这些进行多路复用。

```java
    /**
     * The NIO {@link Selector}.
     */
    private Selector selector;
    private Selector unwrappedSelector;
    private SelectedSelectionKeySet selectedKeys;
```

EOF



