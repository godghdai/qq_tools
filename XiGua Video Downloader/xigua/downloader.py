import aiohttp
import asyncio
from common.config import load_config
from .extractor import extract_title, extract_download_url
from common.downloader import Downloader
from common.ffmpegs import FFmpeg
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


class XiGuaDownloader:

    def __init__(self, config_filepath="./config.ini"):
        self.headers = {
            'Referer': 'https://www.ixigua.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
        }
        if not os.path.exists(config_filepath):
            raise ConfigFileNotExistException("未找到config文件!!")

        self.session = aiohttp.ClientSession()
        self.downloader = Downloader(self.headers, self.session)
        self.loop = asyncio.get_event_loop()
        self.config = load_config(config_filepath)
        self.ffmpeg = FFmpeg(self.config["BASE"]["FFMPEG_PATH"])
        self.video_save_dir = self.config["BASE"]["VIDEO_SAVE_DIR"]

        if not os.path.exists(self.video_save_dir):
            os.makedirs(self.video_save_dir)

    async def parse(self, html):
        title = extract_title(html)
        if title == "":
            raise VideoTitleNotFindException("未提取到文件名!!")

        flag, video_url, audio_url = extract_download_url(html)
        if not flag:
            raise VideoUrlNotFindException("未提取到视频下载地址!!")

        video_file_path = f"{self.video_save_dir}/{title}_video.m4v"
        audio_file_path = f"{self.video_save_dir}/{title}_audio.m4v"
        output_path = f"{self.video_save_dir}/{title}.mp4"

        await self.downloader.download(video_url, f"{title}_video.m4v", video_file_path)
        await self.downloader.download(audio_url, f"{title}_audio.m4v", audio_file_path)

        self.ffmpeg.merge(video_file_path, audio_file_path, output_path)

    async def main(self, url):
        async with self.session.get(url, headers=self.headers) as response:
            html = await response.text()
            await self.parse(html)

    def download(self, url):
        self.loop.run_until_complete(self.main(url))

    def __del__(self):
        if hasattr(self, "loop"):
            self.loop.run_until_complete(self.session.close())
            self.loop.close()
