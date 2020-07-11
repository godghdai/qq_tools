import aiohttp
import asyncio
from .extractor import Extractor
from common.config import Config
from common.downloader import Downloader
from common.ffmpegs import FFmpeg
from common.observer import Observer
import os


class ConfigFileNotExistException(Exception):
    def __init__(self, *args):
        self.args = args


class VideoUrlNotFindException(Exception):
    def __init__(self, *args):
        self.args = args


class VideoTitleNotFindException(Exception):
    def __init__(self, *args):
        self.args = args


class XiGuaDownloader(Observer):

    def __init__(self, config_filepath: str = "./config.ini"):
        super(XiGuaDownloader, self).__init__()
        self.headers = {
            'Referer': 'https://www.ixigua.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
        }
        if not os.path.exists(config_filepath):
            raise ConfigFileNotExistException("未找到config文件!!")

        self.session = aiohttp.ClientSession()
        self.downloader = Downloader(self.headers, self.session)
        self.downloader.on("onProgress", self.on_progress)
        self.loop = asyncio.get_event_loop()

        self.filename = ""
        self.config = Config.load_config(config_filepath)
        self.ffmpeg = FFmpeg(self.config["BASE"]["FFMPEG_PATH"])
        self.save_dir = self.config["BASE"]["SAVE_DIR"]

        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

    def on_progress(self, downloader: Downloader):

        info2 = "\r[%s] 下载进度:%d%%(%0.2fMB/%0.2fMB)" % (
            self.filename,
            float(downloader.download_size / downloader.total_size * 100), (downloader.download_size / 1024 / 1024),
            (downloader.total_size / 1024 / 1024))

        self.emit("on_progress", float(downloader.download_size / downloader.total_size * 100))
        # print(info)

    async def parse(self, html: str):
        title = Extractor.title(html)
        if title == "":
            raise VideoTitleNotFindException("未提取到文件名!!")

        flag, video_url, audio_url = Extractor.download_url(html)
        if not flag:
            raise VideoUrlNotFindException("未提取到视频下载地址!!")

        video_path = f"{self.save_dir}/{title}_video.m4v"
        audio_path = f"{self.save_dir}/{title}_audio.m4v"
        output_path = f"{self.save_dir}/{title}.mp4"

        if os.path.exists(output_path):
            print("文件已存在！！")
            return

        self.filename = f"{title}_video.m4v"
        self.emit("on_info", self.filename+" 正在下载")
        await self.downloader.download(video_url, video_path)
        self.emit("on_info", self.filename+" 下载完成")

        self.filename = f"{title}_audio.m4v"
        self.emit("on_info", self.filename+" 正在下载")
        await self.downloader.download(audio_url, audio_path)
        self.emit("on_info", self.filename+" 下载完成")

        self.ffmpeg.merge(video_path, audio_path, output_path)
        self.emit("on_info", output_path+" 合并完成")

    async def main(self, url: str):
        async with self.session.get(url, headers=self.headers) as response:
            html = await response.text()
            await self.parse(html)

    def download(self, url: str):
        self.loop.run_until_complete(self.main(url))

    def __del__(self):
        if hasattr(self, "loop"):
            self.loop.run_until_complete(self.session.close())
            self.loop.close()
            self.downloader.remove_listener("onProgress", self.on_progress)
