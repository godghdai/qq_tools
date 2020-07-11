import aiohttp
import asyncio
from .observer import Observer


class Downloader(Observer):
    def __init__(self, header, session: aiohttp.ClientSession, chunk_count=5):
        super(Downloader, self).__init__()
        self.header = header
        self.session = session
        self.chunk_count = chunk_count
        self.chunk_size = 0

        self.url = ""
        self.fd = None
        self.pre_download_size = 0
        self.download_size = 0
        self.total_size = 0

    async def get_content_length(self):
        async with self.session.head(self.url, headers=self.header) as response:
            return int(response.headers["Content-Length"])

    async def get_by_range(self, start, end):
        range_headers = self.header.copy()
        range_headers["Range"] = f"bytes={start}-{end}"
        async with self.session.get(self.url, headers=range_headers) as response:
            while True:
                chunk = await response.content.read(1024)
                if not chunk:
                    break
                self.fd.seek(start)
                self.fd.write(chunk)
                start += len(chunk)
                self.download_size += len(chunk)

                if self.pre_download_size != self.download_size:
                    self.emit("onProgress", self)
                    self.pre_download_size = self.download_size

    def get_task(self, index):
        start = index * self.chunk_size
        end = start + self.chunk_size - 1
        if index == self.chunk_count - 1:
            end = self.total_size - 1
        return self.get_by_range(start, end)

    async def download(self, url, save_path):
        self.url = url
        self.download_size = 0
        self.total_size = await self.get_content_length()
        self.chunk_size = self.total_size // self.chunk_count

        # set file size
        self.fd = open(save_path, "wb+")
        self.fd.truncate(self.total_size)

        tasks = [self.get_task(index) for index in range(self.chunk_count)]
        responses = asyncio.gather(*tasks)
        self.emit("onStart")
        await responses
        self.fd.close()
        self.emit("onFinished")
