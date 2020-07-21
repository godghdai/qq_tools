## 西瓜视频下载

#### win 64位 下载
https://share.weiyun.com/FTrK782F

#### 安装依赖
```sh
pip install -r requriements.txt
```

#### 打包成单个exe
```sh
pyinstaller gui.py -F -p D:\Users\yzd\PycharmProjects\my\venv\Lib\site-packages --noconsole

```

#### 修复打包后，无法运行的Bug
```
pyinstaller打包成功,gui.exe运行错误。no module named _adv、_xml、_html
```
```
1、在自己的项目里import wx._adv, wx._html
2、如果要一劳永逸的解决这个问题的话，到wx的包的目录中修改richtext.py文件，在该文件中
import _adv, _html
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
