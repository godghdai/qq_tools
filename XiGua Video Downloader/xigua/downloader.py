import aiohttp
import asyncio
from .extractor import Extractor
from common.config import Config
from common.downloader import Downloader
from common.ffmpegs import FFmpeg
from common.observer import Observer
import os


class XiGuaDownloader(Observer):

    def __init__(self, config_filepath: str = "./config.ini"):
        super(XiGuaDownloader, self).__init__()
        self.headers = {
            'Referer': 'https://www.ixigua.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
        }
        if not os.path.exists(config_filepath):
            self.emit("on_error", "未找到config文件!!")
            return

        self.session = aiohttp.ClientSession()
        self.downloader = Downloader(self.headers, self.session)
        self.loop = asyncio.get_event_loop()

        self.filename = ""
        self.config = Config.load_config(config_filepath)
        self.ffmpeg = FFmpeg(self.config["BASE"]["FFMPEG_PATH"])
        self.save_dir = self.config["BASE"]["SAVE_DIR"]

        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

    async def parse(self, html: str):
        title = Extractor.title(html)
        if title == "":
            self.emit("on_error", "未提取到title!!")
            return

        flag, video_url, audio_url = Extractor.download_url(html)
        if not flag:
            self.emit("on_error", "未提取到视频下载地址!!")
            return

        video_path = f"{self.save_dir}/{title}_video.m4v"
        audio_path = f"{self.save_dir}/{title}_audio.m4v"
        output_path = f"{self.save_dir}/{title}.mp4"

        if os.path.exists(output_path):
            self.emit("on_error", output_path + " 文件已存在！！")
            return

        self.filename = f"{title}_video.m4v"
        self.emit("on_download_start", self.filename)
        await self.downloader.download(video_url, video_path)
        self.emit("on_download_finished", self.filename)

        self.filename = f"{title}_audio.m4v"
        self.emit("on_download_start", self.filename)
        await self.downloader.download(audio_url, audio_path)
        self.emit("on_download_finished", self.filename)

        self.ffmpeg.merge(video_path, audio_path, output_path)
        self.emit("on_download_completed", output_path)

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
