# Java 基础知识

## 面向对象

面向对象的三大特征：封装、继承、多态

- 封装：对内部数据进行隐藏，对外暴露公共方法提供调用
- 继承：子类继承父类可以使用父类的方法，本质是代码复用技术
- 多态：相同的方法，参数的数量、顺序、类型能表现出不同的功能

工程实践，通常继承父类并不是为了使用父类中的方法而是覆盖重写，因为类中的方法不能满足需要而且其他方法需要保留。

### 继承的底层实现



### 多态的底层实现


### 重写与重载

**重写** 是子类对父类的行为，子类重写父类中的方法已满足需求。

**重载** 一般是在一个类中同名方法，使参数的个数、顺序、类型不同。

## 接口、抽象类



## 值传递、地址传递问题

Java中只有值传递。在C语言等语言中既有值传递又有地址传递，值传递不会改入参，地址传递会改变入参。

为什么说Java中只有值传递？
1. 基本数据类型都是值传递无疑
2. 对象在传递是传递的“句柄‘’，句柄是一个32bit或64bit的数据，并不是内存地址，因此不是地址传递

```
                     stack      heap
                   ┌────────┐  ┌────────────────────────┐
      int a = 1───►│   1    │  │                        │
                   ├────────┤  │                        │
     long b = 2L ─►│   2L   │  │                        │
                   ├────────┤  │   ┌─obj──┐             │
 Object obj = new─►│ 0x1000 ├──┼──►│{   } │             │
                   ├────────┤  │   └──────┘             │
                   │        │  │                        │
                   │        │  │                        │
                   │        │  │                        │
                   └────────┘  └────────────────────────┘
```

## 基本数据类型

Java有这些基本数据类型 byte、short、int、long、float、double、boolean、char，他们每个对应的还有包装数据类型 Byte、Short、Integer、Long、Float、Double、Boolean、Character。


### 基本数据类型的存储、传值

基本数据类型是存在在栈空间中；基本数据类型传值永远是值传递。

在内存模型中栈划分成一个接着一个的插槽（slot），每个插槽占32bit（4Byte），其中int类型占一个插槽，而Long类型占两个插槽。如下图示：



```
       ┌────────┐
       │ slot   │◄─── int
       ├────────┤
       │ slot   │◄──┐
       ├────────┤   ├─long
       │ slot   │◄──┘
       ├────────┤
       │  ...   │
       ├────────┤
       │  ...   │
       └────────┘
          stack
```

### 包装数据类型

包装数据类型都是不可变类型；包装类型具有拆箱、装箱行为；包装类型带有缓存。

拆箱装箱。拆箱和装箱都属于JVM编译期的行为，是语法糖🍬，装箱即 `Integer.valueOf()`，拆箱即 `IntegerObj.intValue()` 。何时进行？在把一个基本数据类型赋值给一个基本数据类型时会进行拆箱，反之把一个基本数据类型赋值给一个包装类型会进行装箱。


包装数据类型的缓存。在使用包装数据类型的 `valueOf` 方法时就使用了缓存，整型的缓存范围是[-128, 127]。需要注意，缓存是共享数据，请勿使用它做线程的锁对象。

Integer的缓存：
```java
    public static Integer valueOf(int i) {
        if (i >= IntegerCache.low && i <= IntegerCache.high)
            return IntegerCache.cache[i + (-IntegerCache.low)];
        return new Integer(i);
    }
```

Long的缓存：
```java
    public static Long valueOf(long l) {
        final int offset = 128;
        if (l >= -128 && l <= 127) { // will cache
            return LongCache.cache[(int)l + offset];
        }
        return new Long(l);
    }
```
### 浮点型

浮点型通常使用 [IEEE 754 标准](https://zh.wikipedia.org/wiki/IEEE_754)，绝大多数系统和编程语言都使用用这个标准，Java也是。

浮点型分为单精度4Byte和双精度8Byte，以单精度为例：

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Float_example.svg/590px-Float_example.svg.png" alt="Float example.svg" style="zoom:80%;" />

- 使用1bit表示正负
- 使用8bit表示指数，即偏移量
- 使用23bit表示有效值，实际当作24bit，红色区域最左边总是1



Java浮点型问题。单精度浮点型通常保证小数点后6位精度，第6位之后就是随机的值了，这个问题会在赋值的时候就发生。我们来模拟下这个问题。

```java
    float f = 0.12345600000f;
    System.out.printf("%.10f \n", f);
    // output
    float f2 = 0.123456789f;
    System.out.printf("%.15f \n", f2);
    // output
    // 0.1234560013
    // 0.123456791043282
```




## 字符串



### String 类

String类是字符串类，与其他类不同的是，这个类可以直接通过赋值文本的方式创建。

创建字符串又两种方式：

- 直接赋值 `String str = 'abc'`
- new创建 `String str = new String()`

通过字面量创建的，会先判断常量池中是否有，如果有直接将常量池的引用赋值给字符串变量，没有则先创建然后赋值；同过new创建字符串会创建一个字符串对象（此时字符串变量中保存的是一个新的引用），其中的内容可能在常量池。

声明三个字符串，他们的关系是这样的：

```java
String str1 = "abc";
String str2 = "abc";

String str3 = new String(str1);

str1 == str2 // true
str1 == str3 // false
```


```
                               heap
                  ┌────────┐  ┌─────────────────────┐
  String str1 ───►│0x1000  │  │                     │
                  ├────────┤  │   ┌────pool───────┐ │
  String str2 ───►│0x1000  │  │   │               │ │
                  ├────────┤  │   │ 0x1000 = "abc"│ │
  String str3 ───►│0x2000  │  │   │          ▲    │ │
                  ├────────┤  │   │          │    │ │
                  │        │  │   └──────────┼────┘ │
                  │        │  │              │      │
                  │        │  │    0x2000 = {value} │
                  │        │  │                     │
                  └────────┘  └─────────────────────┘
```


分析，字符串是不可变对象，在进行变更操作（e.g. substring、replace、concat）都会创建新字符串对象，因此JVM进行了优化，如果字符串常量池中国呢存在就返回不在创建，不存在创建在返回引用，如果是创建字符串对象，字符串对象变量必然是新的，其中的数据载体（byte[] value)可能是在常量池中。

----

参考：

[https://www.cnblogs.com/xiaoxi/p/6036701.html](https://www.cnblogs.com/xiaoxi/p/6036701.html)



