
# Java 字符串源码分析

## String 分析

### 字符串的创建

String类是字符串类，与其他类不同的是，这个类可以直接通过赋值文本的方式创建。

创建字符串又两种方式：

- 直接赋值 `String str = "abc"`
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

```text
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

### 字符串的存储

在JDK 8中字符串数据是存储在char数组中。

```java
    // The value is used for character storage.c
    private final char value[];
```

而在JDK 11中变成byte数组，其中仍是char数据。

```java
    // The value is used for character storage.
    private final byte[] value;
```

因为存储不同字符串的长度获取方法也改变了。

```java
    // JDK 8
    public int length() {
        return value.length;
    }

    // JDK 11
    public int length() {
        // >> 相当于除运算
        return value.length >> coder();
    }
```

### 常用方法源码分析





参考：

[https://www.cnblogs.com/xiaoxi/p/6036701.html](https://www.cnblogs.com/xiaoxi/p/6036701.html)
