## 西瓜视频下载

#### 安装依赖
```sh
pip install -r requriements.txt
```

#### 打包成单个exe
```sh
pyinstaller gui.py -F -p D:\Users\yzd\PycharmProjects\my\venv\Lib\site-packages
```

### pipreqs工具
```sh
这个工具的好处是可以通过对项目目录的扫描，自动发现使用了那些类库，自动生成依赖清单。
缺点是可能会有些偏差，需要检查并自己调整下.
```

#### 安装
```sh
pip install pipreqs
```

#### 使用

切换到项目根目录下使用命令: 
```sh
pipreqs ./
```
```sh
windows系统, 会报错: UnicodeDecodeError: 'gbk' codec can't decode byte 0xa8 in position 2347: illegal multibyte sequence
```
指定编码格式即可: 
```sh
pipreqs ./ --encoding=utf8
```
该工具会在项目根目录下生成个requriements.txt文件, 该文件就包含了项目中的依赖
```
