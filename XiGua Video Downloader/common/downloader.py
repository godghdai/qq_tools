import aiohttp
import asyncio


class Downloader:
    def __init__(self, header, session: aiohttp.ClientSession, chunk_count=5):
        self.header = header
        self.session = session
        self.chunk_count = chunk_count
        self.chunk_size = 0

        self.url = ""
        self.save_path = ""
        self.filename = ""
        self.download_size = 0
        self.total_size = 0

    def update_progress(self, size):
        self.download_size += size
        print("\r[%s]下载进度:%d%%(%0.2fMB/%0.2fMB)" % (
            self.filename,
            float(self.download_size / self.total_size * 100), (self.download_size / 1024 / 1024),
            (self.total_size / 1024 / 1024)),
              end=" ")

    async def get_content_length(self):
        async with self.session.head(self.url, headers=self.header) as response:
            return int(response.headers["Content-Length"])

    async def get_by_range(self, start, end):
        range_headers = self.header.copy()
        range_headers["Range"] = f"bytes={start}-{end}"
        async with self.session.get(self.url, headers=range_headers) as response:
            with open(self.save_path, 'rb+') as fd:
                while True:
                    chunk = await response.content.read(1024)
                    if not chunk:
                        break
                    fd.seek(start)
                    fd.write(chunk)
                    start += len(chunk)
                    self.update_progress(len(chunk))

    def get_task(self, index):
        start = index * self.chunk_size
        end = start + self.chunk_size - 1
        if index == self.chunk_count - 1:
            end = self.total_size - 1
        return self.get_by_range(start, end)

    async def download(self, url, filename, save_path):
        self.url = url
        self.filename = filename
        self.save_path = save_path
        self.download_size = 0
        self.total_size = await self.get_content_length()
        self.chunk_size = self.total_size // self.chunk_count

        # set file size
        with open(save_path, "wb+") as fo:
            fo.truncate(self.total_size)

        tasks = [self.get_task(index) for index in range(self.chunk_count)]
        responses = asyncio.gather(*tasks)
        await responses
