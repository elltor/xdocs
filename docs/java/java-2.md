
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
