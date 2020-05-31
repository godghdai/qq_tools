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
pacman -S mingw-w64-i686-gcc 
pacman -S mingw-w64-x86_64-gcc 
```

- [ffmpeg](http://ffmpeg.org/download.html)
- [libmp3lame](https://github.com/gypified/libmp3lame)
- [SDL2](http://www.libsdl.org/download-2.0.php)
- [fdk-aac](http://www.linuxfromscratch.org/blfs/view/svn/multimedia/fdk-aac.html)
- [iconv](http://www.gnu.org/software/libiconv/)
- [zlib](https://github.com/madler/zlib)

用ffplay命令播放声音时发生这个错误:
SDL_OpenAudio (2 channels, 44100 Hz): WASAPI can't initialize audio client
只能播放视频图像而不能播放视频声音。

设置可用的音频输出驱动
win7环境下命令框输入
```
set SDL_AUDIODRIVER=directsound或
set SDL_AUDIODRIVER=winmm
```

```
./configure --prefix=/usr/local/ffmpeg --enable-shared --disable-static --enable-libfdk-aac --enable-libmp3lame
make -j 4
make install
```

### win7 64位版本下载
```
https://pan.baidu.com/s/1fAfzJSEpNgXddLdQOgKfyQ
dc8s
```
