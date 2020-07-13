import aiohttp
import asyncio
from aiohttp import ClientSession, TCPConnector
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

        # total:全部请求最终完成时间
        # connect: aiohttp从本机连接池里取出一个将要进行的请求的时间
        # sock_connect：单个请求连接到服务器的时间
        # sock_read：单个请求从服务器返回的时间
        timeout = aiohttp.ClientTimeout(total=330, connect=15, sock_connect=15, sock_read=20)
        self.session = aiohttp.ClientSession(connector=TCPConnector(limit=300), timeout=timeout)
        self.downloader = Downloader(self.headers, self.session)
        self.loop = asyncio.get_event_loop()

        self.filename = ""
        self.config = Config.load_config(config_filepath)
        self.ffmpeg = FFmpeg(self.config["BASE"]["FFMPEG_PATH"])
        self.save_dir = self.config["BASE"]["SAVE_DIR"]

        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

    async def download_one(self, url, save_path, info):
        self.emit("on_download_start", info)
        err = await self.downloader.download(url, save_path)
        if err:
            self.emit("on_download_error", info)
            return
        self.emit("on_download_finished", info)

    async def parse(self, html: str, is_only_audio: bool):
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
        output_path = f"{self.save_dir}/{title}.mp3" if is_only_audio else f"{self.save_dir}/{title}.mp4"

        if os.path.exists(output_path):
            self.emit("on_error", output_path + " 文件已存在！！")
            return

        if not is_only_audio:
            self.filename = f"{title}_video.m4v"
            await self.download_one(video_url, video_path, self.filename)

        self.filename = f"{title}_audio.m4v"
        await self.download_one(audio_url, audio_path, self.filename)

        if not is_only_audio:
            self.ffmpeg.merge(video_path, audio_path, output_path)
        else:
            self.ffmpeg.to_mp3(audio_path, output_path)

        self.emit("on_download_completed", output_path)

    async def main(self, url: str, is_only_audio: bool):
        response = await self.session.get(url, headers=self.headers)
        html = await response.text()
        await self.parse(html, is_only_audio)
        await self.session.close()

    def download(self, url: str, is_only_audio: bool):
        self.loop.run_until_complete(self.main(url, is_only_audio))


def __del__(self):
    if hasattr(self, "loop"):
        self.loop.close()
