# Java 核心基础

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

```text
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

```text
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

![单精度图示](https://oss.elltor.com/uploads/xdocs/2021/590px-Float_example.svg.png)

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

### String源码分析

String类的成员变量，从中可以窥见一斑。

```java
    // 存储字符串容器
    private final byte[] value;
    // 编码。由于容器是字节数组，不确定编码无法解码显示字符串
    private final byte coder;
    // 是字符串的哈希码，而不是String对象的，用作字符串缓存
    private int hash; 
    // 是否压缩字符串存储。如果禁用字符串压缩，则value中的字节始终以 UTF16 编码。 
    // 对于具有多种可能实现方式的方法，当禁用字符串压缩时，只会采用一种方式：UTF16
    static final boolean COMPACT_STRINGS;
```

String类的核心构造器。

```java
    // 通过已有的字符串构造的是共享内容的字符串对象，但它是安全的，因为String是不可变类，
    // 改变字符串意味着就成了另个对象。
    public String(String original) {
        this.value = original.value;
        this.coder = original.coder;
        this.hash = original.hash;
    }

    public String(int[] codePoints, int offset, int count) {
        checkBoundsOffCount(offset, count, codePoints.length);
        if (count == 0) {
            this.value = "".value;
            this.coder = "".coder;
            return;
        }
        // 压缩处理
        if (COMPACT_STRINGS) {
            byte[] val = StringLatin1.toBytes(codePoints, offset, count);
            if (val != null) {
                this.coder = LATIN1;
                this.value = val;
                return;
            }
        }
        this.coder = UTF16;
        this.value = StringUTF16.toBytes(codePoints, offset, count);
    }

    public String(byte bytes[], int offset, int length, Charset charset) {
        if (charset == null)
            throw new NullPointerException("charset");
        checkBoundsOffCount(offset, length, bytes.length);
        // 字节数组数据必须解码才能识别。
        StringCoding.Result ret =
            StringCoding.decode(charset, bytes, offset, length);
        this.value = ret.value;
        this.coder = ret.coder;
    }
```

在JDK 8中字符串数据是存储在char数组中，而在JDK 11中变成byte数组，但其中仍是字符的数据。因为存储不同字符串的长度获取方法也改变了。

```java
    // JDK 8
    // The value is used for character storage.c
    private final char value[];

    // JDK 11
    // The value is used for character storage.
    private final byte[] value;

    // JDK 8
    public int length() {
        return value.length;
    }

    // JDK 11
    public int length() {
        // >> 除运算
        return value.length >> coder();
    }
```

获取不同编码方式指定字符位置也使用不同的方式。

```java
    public char charAt(int index) {
        if (isLatin1()) {
            return StringLatin1.charAt(value, index);
        } else {
            return StringUTF16.charAt(value, index);
        }
    }
```

常用的 `replace`、`substring` 方法都生成新的字符串，而不是在原 String 对象中操作。

```java
    public String substring(int start, int end) {
        checkRangeSIOOBE(start, end, count);
        if (isLatin1()) {
            // 生成新串
            return StringLatin1.newString(value, start, end - start);
        }
        // 生成新串
        return StringUTF16.newString(value, start, end - start);
    }

    public String replace(char oldChar, char newChar) {
        if (oldChar != newChar) {
            // StringLatin1.replace 替换后生成的新字符串
            String ret = isLatin1() ? StringLatin1.replace(value, oldChar, newChar)
                                    : StringUTF16.replace(value, oldChar, newChar);
            if (ret != null) {
                return ret;
            }
        }
        return this;
    }
```

## StringBuilder、SringBuffer分析

### 类结构

![StringBuilder](https://oss.elltor.com/uploads/xdocs/2021/StringBuilder.png)

![StringBuffer](https://oss.elltor.com/uploads/xdocs/2021/StringBuffer.png)

从类结构看二者继承实现结构相同，其中真正完成追加（append）操作的是 `AbstractStringBuilder` 类。

### StringBuilder、StringBuffer源码分析

先看StringBuilder常用的方法。

```java
    @Override
    public StringBuilder append(Object obj) {
        return append(String.valueOf(obj));
    }

    @Override
    @HotSpotIntrinsicCandidate
    public StringBuilder append(String str) {
        super.append(str);
        return this;
    }

    public StringBuilder append(StringBuffer sb) {
        super.append(sb);
        return this;
    }
```

在看 StringBuffer 的方法，对比可以看到 StirngBuffer 方法都加了 `synchronized` 进行同步控制，因此 StringBuffer 是线程安全的字符串构建器，但由于同步具有额外开销性能则不如 StringBuilder。

```java
    @Override
    public synchronized StringBuffer append(Object obj) {
        toStringCache = null;
        super.append(String.valueOf(obj));
        return this;
    }

    @Override
    @HotSpotIntrinsicCandidate
    public synchronized StringBuffer append(String str) {
        toStringCache = null;
        super.append(str);
        return this;
    }

    public synchronized StringBuffer append(StringBuffer sb) {
        toStringCache = null;
        super.append(sb);
        return this;
    }
```

## StringJoiner

StringJoiner是字符串连接器，可以生成指定前缀、后缀、元素分隔符的字符串。示例：

```java
    StringJoiner sj = new StringJoiner(":", "[", "]");
    sj.add("George").add("Sally").add("Fred");

    // desiredString = "[George:Sally:Fred]"
    String desiredString = sj.toString();
```

StringJoiner的核心方法, 这个方法并为使用同步措施不能在多线程的环境下使用。

```java
    public StringJoiner add(CharSequence newElement) {
        final String elt = String.valueOf(newElement);
        
        if (elts == null) {// 为null初始化
            elts = new String[8];
        } else {// 检查容量，容量满进行扩容
            if (size == elts.length)
                elts = Arrays.copyOf(elts, 2 * size);
            len += delimiter.length();
        }
        // 重新计算长度
        len += elt.length();
        // 存放
        elts[size++] = elt;
        return this;
    }
```

参考：

[https://www.cnblogs.com/xiaoxi/p/6036701.html](https://www.cnblogs.com/xiaoxi/p/6036701.html)
