
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

### 源码分析

String类的成员变量，从中可以窥见一斑。

```java
    // 存储字符串容器
    private final byte[] value;
    // 编码。由于容器是字节数组，不确定编码无法解码显示字符串
    private final byte coder;
    // 是字符串的哈希码，而不是String对象的，用作字符串缓存
    private int hash; // Default to 0
    // 是否压缩字符串存储。如果禁用字符串压缩，则value中的字节始终以 UTF16 编码。 对于具有多种可能实现方式的方法，当禁用字符串压缩时，只会采用一种方式：UTF16
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

在JDK 8中字符串数据是存储在char数组中，而在JDK 11中变成byte数组，其中仍是char数据。因为存储不同字符串的长度获取方法也改变了。

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

获取不同编码方式指定字符位置使用不同的方式。

```java
    public char charAt(int index) {
        if (isLatin1()) {
            return StringLatin1.charAt(value, index);
        } else {
            return StringUTF16.charAt(value, index);
        }
    }
```




参考：

[https://www.cnblogs.com/xiaoxi/p/6036701.html](https://www.cnblogs.com/xiaoxi/p/6036701.html)
