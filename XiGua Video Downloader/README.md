## 西瓜视频下载
#### 
```sh
pip install mitmproxy==4.0.4
pip freeze > requirements.txt
mitmdump -q -s HTTProxy.py -p 9000
pyinstaller main.py -F -p D:\Users\yzd\PycharmProjects\my\venv\Lib\site-packages
```
