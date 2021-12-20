# Java 集合

Java集合是Java的数据容器，可以分为两大家族，List 和 Map，其中 List 表示有序的元素列表，Map 表示 K-V 映射关系。由这两大族衍生出Set、Queue、Stack类型。

Java集合工具类具有很多特点，比如：通用的API、自动扩所容、支持排序、通用存储（泛型）等，这些特性促使了Java的流行，使得业务开发得以简化。

## 常用实现类介绍

![Java集合Collection](https://oss.elltor.com/uploads/2021/Java%E9%9B%86%E5%90%88Collection_1620744738247.png)

- ArrayList 一种可以动态增长或缩减的索引集合，底层通过`Ojbect[]`数组存储元素
- LinkedList 高效插入删除的有序List，双向链表，使用node节点存储数据，同时它又是个复合数据结构，具有Queue的特性
- ArrayDeque 用循环数组实现的双端队列
- HashSet 一种没有元素的无序集合
- TreeSet 有序的集合
- LinkedHashSet 能记录插入顺序的集合
- PriorityQueue 优先队级列
- HashMap 存储键-值关系数据，与此类似的还有遗留的类 HashTable
- TreeMap 能根据键的值排序的键/值关系数据数据
- LinkedHashMap 可以键/值记录添加顺序

### 如何选用这些数据结构

通常选用基于我们需要处理的数据的特点来确定的。如果只是简单存储一组数据，如几个用户的信息，这时选用ArrayList是比较合适的，如果数据频繁添加、删除那选用LinkedList是比较合适的；如果想存储一组数据且不希望重复，那选用Set集合合适的；如果希望添加插入的数据能够有顺序，那选择TreeSet是比较合适的，当然TreeMap也可以。

## 源码分析

### Collection接口

Collection 集合层次结构中的根接口，一个集合代表一组对象，称为它的元素，一些集合允许重复元素，而另一些则不允许，抑或有些是有序的，有些是无序的。接下来我们来看一下它的接口方法定义。

```java
public interface Collection<E> extends Iterable<E> {
    /**
     * 用于获取集合的数量
     */
    int size();

    /**
     * 用于集合是否为空集合
     */
    boolean isEmpty();

    /**
     * 是否包含元素
     */
    boolean contains(Object o);

    /**
     * 返回这个集合的迭代器（遍历器）
     */
    Iterator<E> iterator();

    /**
     * 以数组形式返回集合中的元素
     */
    Object[] toArray();

    /**
     * 返回一个包含此集合中所有元素的数组，返回数组的类型是指定数组的类型。 
     */
    <T> T[] toArray(T[] a);

    // Modification Operations

    /**
     * 添加元素
     */
    boolean add(E e);

    /**
     * 移出元素，移出成功返回 true
     */
    boolean remove(Object o);

    // Bulk Operations

    /**
     * 包含所有c中的元素返回 true
     */
    boolean containsAll(Collection<?> c);

    /**
     * 集合并运算，并后的集合是否重复与具体实现类决定
     */
    boolean addAll(Collection<? extends E> c);

    /**
     * 实现集合到差运算
     */
    boolean removeAll(Collection<?> c);

    /**
     * 根据filter lambda决定是否删除
     * @since 1.8
     */
    default boolean removeIf(Predicate<? super E> filter) {
        Objects.requireNonNull(filter);
        boolean removed = false;
        final Iterator<E> each = iterator();
        while (each.hasNext()) {
            if (filter.test(each.next())) {
                each.remove();
                removed = true;
            }
        }
        return removed;
    }

    /**
     * 从该集合中删除所有未包含在指定集合c中的元素
     */
    boolean retainAll(Collection<?> c);

    /**
     * 清除元素
     */
    void clear();


    // Comparison and hashing

    /**
     * 比较元素
     */
    boolean equals(Object o);

    /**
     * 返回集合的哈希码
     */
    int hashCode();

    /**
     * 流
     * @since 1.8
     */
    default Stream<E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }

    /**
     * 并行流，线程数由server的核心数决定
     * @since 1.8
     */
    default Stream<E> parallelStream() {
        return StreamSupport.stream(spliterator(), true);
    }
}
```

### ArrayList 源码分析

ArrayList 是可调整大小的List实现，基于数组，允许所有元素，包括null。ArrayList与Vector的区别是它是非同步的，多线程下不安全。通常使用ArrayList最好指定 `capacity` 以避免数据扩容后拷贝开销。

ArrayList 成员变量。

```java

    /**
     * 默认初始化容量，capacity扩容每次增加之前容量的一半
     */
    private static final int DEFAULT_CAPACITY = 10;

    /**
     * 用于空实例的共享空数组实例。
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    /**
     * 默认共享的空数组标识，与上边的区别是首次
     */
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     * 实际上存储数据数组，初始时 == DEFAULTCAPACITY_EMPTY_ELEMENTDATA，
     * 在第一次被调用时数组容量是 DEFAULT_CAPACITY。
     * 
     */
    transient Object[] elementData; 

    /**
     * 当前存储大小，size <= capacity
     */
    private int size;
```






![ArrayList#add](https://oss.elltor.com/uploads/xdocs/2021/ArrayList_add_simple.png)




#### HashMap

底层数据结构：数组链表+红黑树

默认的容量为：16（1<<4）

扩容的条件：size>=容量*加载因子

扩容大小：旧容量2倍（newCap = oldCap << 1）

树化（terrify）的条件

1. 容量长度大于等于64
2. 链表成都大于8

树化的过程

1. 把普通节点转换为TreeNode
2. 调用treeify进行树化
3. 调整节点
4. 左旋右旋

put导致死循环的原因。在JDK1.7中插入元素使用头插法，插入的时候不需要遍历哈希桶，在多线程下这样可能形成循环链表。JDK8采用尾插法，循环找到最后一个节点，然后在最后一个节点插入元素。

存储结构

![image.png](https://oss.elltor.com/uploads/2021/image_1621950495117.png)

```java
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable {

    /**
     * 默认容量16
     */
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

    /**
     * 最大容量，1 << 30 = 1073741824
     */
    static final int MAXIMUM_CAPACITY = 1 << 30;

    /**
     * 默认加载因子，是决定存储容量扩容的关键指标，计算公式： size/总容量
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * 小于这个值无法使用红黑树，HashMap容量不推荐为奇数，比这个数小后树退化为数组
     * 红黑树扩展时也参考这个属性
     */
    static final int TREEIFY_THRESHOLD = 8;

    /**
     * 容量小于这个值红黑树将退化为数组存储
     */
    static final int UNTREEIFY_THRESHOLD = 6;

    /**
     * 将数组转化为红黑树推荐的容量
     */
    static final int MIN_TREEIFY_CAPACITY = 64;

    /**
     *　使用数组存储的数据结构，node节点
     */
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;

        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    /**
     * 计算对象的hash值，是hash code分配更均匀，减少冲突几率
     */
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

    /**
     * 计算2的幂次方表容量
     * 也就是说表容量只能为： ... 4  8  16  32  64  128  256 ... 1024 ... 1073741824
     */
    static final int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }

    /* ---------------- Fields -------------- */

    /**
     * 数组存储结构，默认第一次使用时会分配空间
     */
    transient Node<K,V>[] table;

    /**
     * 键值对数量
     */
    transient int size;

    /**
     * 对table修改的次数，调整table时改变 —— rehash、remove、add等操作
     * 用来判断在读取操作过程中是否出现table修改
     */
    transient int modCount;

    /**
     * 扩容时的临界值，计算为 capacity*loadFactor
     */
    int threshold;

    /**
     * 加载因子, 默认0.75
     */
    final float loadFactor;

    /* ---------------- Public operations -------------- */
    
    /**
     * 默认构造函数，table容量为16
     */
    public HashMap() {
        this.loadFactor = DEFAULT_LOAD_FACTOR; // 0.75
    }

    /**
     * 获取存储键值对数量
     */
    public int size() {
        return size;
    }

    /**
     * 判空
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 通过key获取value
     * 下面的getNode是核心方法。
     */
    public V get(Object key) {
        Node<K,V> e;
        return (e = getNode(hash(key), key)) == null ? null : e.value;
    }

    /**
     * 获取操作
     */
    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab;   
        Node<K,V> first, e; 
        int n; // n table长度
        K k;
        
        if ((tab = table) != null && (n = tab.length) > 0 && (first = tab[(n - 1) & hash]) != null) {
            if (first.hash == hash && ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            if ((e = first.next) != null) {
                // 根据存储结构来获取数据
                
                // 红黑树，调用getTreeNode
                if (first instanceof TreeNode)
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                
                // 遍历链表
                do {
                    //较key查询value
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }

    /**
     * 添加数据
     */
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

    /**
     * Implements Map.put and related methods.
     *
     * @param hash hash for key
     * @param key the key
     * @param value the value to put
     * @param onlyIfAbsent if true, don't change existing value
     * @param evict if false, the table is in creation mode.
     */
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        
        // table未初始化会执行
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
            
        // 存放值
        if ((p = tab[i = (n - 1) & hash]) == null)// 判断通过hash计算出的位置是否有值
            // 没有就在该位置（i）创建一个node并赋值
            tab[i] = newNode(hash, key, value, null);
        else {// 这里时计算出的位置有值存在
            Node<K,V> e; K k;
             
            if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
                // 判断hash值、key相同，认为
                e = p;
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                // 遍历哈希桶
                for (int binCount = 0; ; ++binCount) {
                    // 遍历到桶最后一个元素(链表最后一个元素)
                    if ((e = p.next) == null) {
                        // 添加元素
                        p.next = newNode(hash, key, value, null);
                        // 判断，只有哈希桶至少为8个的时候才进行树化，TREEIFY_THRESHOLD默认为8
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    // 判断键值是否相同
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    // 下一个元素    
                    p = e;
                }
            }
            
            // 更新值
            if (e != null) { // existing mapping for key —— 存在键的映射
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        // 超出HashMap存放元素的阈值threshold = capacity * loadFactor（0.75）
        if (++size > threshold)
            // 调整Hash存在空间大小
            resize();
        afterNodeInsertion(evict);
        return null;
    }

    /**
     * Initializes or doubles table size.  If null, allocates in
     * accord with initial capacity target held in field threshold.
     * Otherwise, because we are using power-of-two expansion, the
     * elements from each bin must either stay at same index, or move
     * with a power of two offset in the new table.
     *
     * @return the table
     */
    final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        // 旧容量，为哈希桶长度
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;
        // 这个if用来保证HashMap阈值threshold不超限
        if (oldCap > 0) {
            // 判断是否超出最大容量，到最大容量不再扩容
            if (oldCap >= MAXIMUM_CAPACITY) {
                // 阈值设置整型最大值
                threshold = Integer.MAX_VALUE;
                // 返回并不再调整大小
                return oldTab;
            }
            // 在容量范围内
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold 为原先的两倍
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
        else {               // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        
        // 计算加载因子，设置新的阈值   阈值=新容量*加载因子
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        // 新的哈希桶
        @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        // 将旧桶的元素更新到新桶
        if (oldTab != null) {
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        // 旧桶中的值移动到新桶
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        // 执行红黑树操作
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order - 翻转顺序
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }

    /**
     * 树化方法
     * Replaces all linked nodes in bin at index for given hash unless
     * table is too small, in which case resizes instead.
     */
    final void treeifyBin(Node<K,V>[] tab, int hash) {
        int n, index; Node<K,V> e;
        if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
            resize();
        else if ((e = tab[index = (n - 1) & hash]) != null) {
            TreeNode<K,V> hd = null, tl = null;
            do {
                TreeNode<K,V> p = replacementTreeNode(e, null);
                if (tl == null)
                    hd = p;
                else {
                    p.prev = tl;
                    tl.next = p;
                }
                tl = p;
            } while ((e = e.next) != null);
            if ((tab[index] = hd) != null)
                hd.treeify(tab);
        }
    }

    /* ------------------------------------------------------------ */
    // Tree bins

    /**
     * 红黑树
     * 
     * Entry for Tree bins. Extends LinkedHashMap.Entry (which in turn
     * extends Node) so can be used as extension of either regular or
     * linked node.
     */
    static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
        TreeNode<K,V> parent;  // red-black tree links
        TreeNode<K,V> left;
        TreeNode<K,V> right;
        TreeNode<K,V> prev;    // needed to unlink next upon deletion
        boolean red;
        TreeNode(int hash, K key, V val, Node<K,V> next) {
            super(hash, key, val, next);
        }
    }
}
```

(完)
