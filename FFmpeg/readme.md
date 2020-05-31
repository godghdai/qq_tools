## FFmpeg编译
### 1. msys2下载
[https://mirrors.tuna.tsinghua.edu.cn/msys2](https://mirrors.tuna.tsinghua.edu.cn/msys2/distrib/x86_64/)

### 2. pacman 的配置
```
编辑 /etc/pacman.d/mirrorlist.mingw32 ，在文件开头添加：
Server = http://mirrors.ustc.edu.cn/msys2/mingw/i686

编辑 /etc/pacman.d/mirrorlist.mingw64 ，在文件开头添加：
Server = http://mirrors.ustc.edu.cn/msys2/mingw/x86_64

编辑 /etc/pacman.d/mirrorlist.msys ，在文件开头添加：
Server = http://mirrors.ustc.edu.cn/msys2/msys/$arch

然后执行 pacman -Sy 刷新软件包数据即可。
```

### 3. 安装依赖
```
pacman -S make gcc diffutils pkg-config nasm
```
[libmp3lame](https://github.com/gypified/libmp3lame)
