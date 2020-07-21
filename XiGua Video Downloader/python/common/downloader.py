import aiohttp
import asyncio
import math
from aiohttp import client_exceptions
from .observer import Observer


class Downloader(Observer):
    def __init__(self, header, session: aiohttp.ClientSession):
        super(Downloader, self).__init__()
        self.header = header
        self.session = session
        self.chunk_size = 1024 * 1024
        self.chunk_count = 0
        self.url = ""
        self.fd = None
        self.download_size = 0
        self.total_size = 0
        self.retry_time = 3
        self.semaphore = asyncio.Semaphore(5)

    async def get_content_length(self):
        count = self.retry_time
        error = None
        while count > 0:
            try:
                async with self.session.head(self.url, headers=self.header) as response:
                    return None, int(response.headers["Content-Length"])
            except client_exceptions.InvalidURL as e:
                return e, None
            except client_exceptions.ServerTimeoutError as timeout_error:
                print("try request timeout error: {}".format(timeout_error))
                count -= 1
                error = timeout_error
            except Exception as e:
                print("try error:{}".format(e))
                count -= 1
                error = e
        return error, None

    async def get_by_range(self, start, end):
        range_headers = self.header.copy()
        range_headers["Range"] = f"bytes={start}-{end}"
        async with self.semaphore:
            count = self.retry_time
            error = None
            while count > 0:
                try:
                    async with self.session.get(self.url, headers=range_headers) as response:
                        chunk = await response.content.read()
                        if chunk:
                            self.fd.seek(start)
                            self.fd.write(chunk)
                            self.download_size += (end - start + 1)
                            self.emit("onProgress", self)
                            return None
                except client_exceptions.InvalidURL as e:
                    return e
                except client_exceptions.ServerTimeoutError as timeout_error:
                    print("try request timeout error: {}".format(timeout_error))
                    count -= 1
                    error = timeout_error
                except Exception as e:
                    print("try error:{}".format(e))
                    count -= 1
                    error = e
            return error

    def get_task(self, index):
        start = index * self.chunk_size
        end = start + self.chunk_size - 1
        if index == self.chunk_count - 1:
            end = self.total_size - 1
        return self.get_by_range(start, end)

    async def download(self, url, save_path):
        self.url = url
        self.download_size = 0
        err = None
        err, self.total_size = await self.get_content_length()
        if err:
            return err

        self.chunk_count = math.ceil(self.total_size / self.chunk_size)
        print(self.chunk_count)

        # set file size
        self.fd = open(save_path, "wb+")
        self.fd.truncate(self.total_size)

        tasks = [self.get_task(index) for index in range(self.chunk_count)]
        results = await asyncio.gather(*tasks)
        for res in results:
            if res:
                err = res
                break

        self.fd.close()
        return err
