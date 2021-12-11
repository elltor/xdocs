---
prev: /README.md
next: ./java-2.md
---



# Java 第一章

### guava

```
<dependency>
   <groupId>com.google.guava</groupId>
   <artifactId>guava</artifactId>
   <version>23.5-jre</version>
</dependency>
```



### caffeine

```
<dependency>
   <groupId>com.github.ben-manes.caffeine</groupId>
   <artifactId>caffeine</artifactId>
</dependency>
```



https://www.cnblogs.com/stulzq/p/9291223.html

```
./configure \
--user=nginx \
--group=nginx \
--prefix=/data/nginx \
--with-http_ssl_module \
--with-http_stub_status_module \
--with-http_realip_module \
--with-threads
```



https://www.cnblogs.com/xingxia/p/php74_install.html

```
./configure \
--prefix=/data/php7 \
--with-config-file-path=/etc \
--with-fpm-user=php \
--with-fpm-group=php \
--with-curl \
--with-freetype-dir \
--enable-gd \
--with-gettext \
--with-iconv-dir \
--with-kerberos \
--with-libdir=lib64 \
--with-libxml-dir \
--with-mysqli \
--with-openssl \
--with-pcre-regex \
--with-pdo-mysql \
--with-pdo-sqlite \
--with-pear \
--with-png-dir \
--with-jpeg-dir \
--with-xmlrpc \
--with-xsl \
--with-zlib \
--with-bz2 \
--with-mhash \
--enable-fpm \
--enable-bcmath \
--enable-libxml \
--enable-inline-optimization \
--enable-mbregex \
--enable-mbstring \
--enable-opcache \
--enable-pcntl \
--enable-shmop \
--enable-soap \
--enable-sockets \
--enable-sysvsem \
--enable-sysvshm \
--enable-xml \
--with-zip \
--enable-fpm
```



```
FROM php:7.4-fpm
RUN apt-get update && apt-get install -y \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
    && docker-php-ext-configure --with-curl \
    --with-freetype-dir \
    --enable-gd \
    --with-gettext \
    --with-iconv-dir \
    --with-kerberos \
    --with-libdir=lib64 \
    --with-libxml-dir \
    --with-mysqli \
    --with-openssl \
    --with-pcre-regex \
    --with-pdo-mysql \
    --with-pdo-sqlite \
    --with-pear \
    --with-png-dir \
    --with-jpeg-dir \
    --with-xmlrpc \
    --with-xsl \
    --with-zlib \
    --with-bz2 \
    --with-mhash \
    --enable-fpm \
    --enable-bcmath \
    --enable-libxml \
    --enable-inline-optimization \
    --enable-mbregex \
    --enable-mbstring \
    --enable-opcache \
    --enable-pcntl \
    --enable-shmop \
    --enable-soap \
    --enable-sockets \
    --enable-sysvsem \
    --enable-sysvshm \
    --enable-xml \
    --with-zip \
    --enable-fpm \
    && docker-php-ext-install -j$(nproc) gd
```



```
yum install docker-ce-18.09.1 docker-ce-cli-18.09.1 containerd.io
```





```
docker run -d --name mysql57 -p 3306:3306 --restart=always -e MYSQL_ROOT_PASSWORD=123456 -v /data/mysql:/var/lib/mysql  mysql:5.7.36
```





```
    server {
        listen       8000;
        server_name  localhost;
        index        index.html index.php;
        root         /data/mediawiki-1.37.0;
        
        location / {
            if (!-e $request_filename) {
                rewrite ^/(.*) /index.php last;
            }
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
                    root   html;
        }
        location ~ .*\.(php|php5)$ {
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }
    }

```





```
docker run -d \
--name php74-fpm \
-p 9001:9000 \
-v /mediawiki-1.37.0:/var/www/html \
--privileged=true \
php:7.4.26-fpm
```





```
docker run -d --name php7-fpm -p 9001:9000 --restart=always -e MYSQL_ROOT_PASSWORD=123456 -v /data/mysql:/var/lib/mysql  mysql:5.7.36
```





https://www.cnblogs.com/yinguohai/p/11329273.html





http://team-liuqichun-01.dev.kwaidc.com