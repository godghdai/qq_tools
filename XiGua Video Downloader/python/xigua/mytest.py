import aiohttp
import asyncio
import time
import math
import traceback
from aiohttp import ClientSession, TCPConnector, client_exceptions
from asyncio import Queue


def retry(fun):
    async def sss(*args, **kwargs):
        count = 3
        while count > 0:
            try:
                ret = await fun(*args, **kwargs)
                return ret
            except client_exceptions.InvalidURL as e:
                return None
            except client_exceptions.ServerTimeoutError as timeout_error:
                print("request timeout error: {}".format(timeout_error))
                print("try")
                count -= 1
            except Exception as e:
                print("try")
                count -= 1
        return None

    return sss


@retry
async def fetch55(session, semaphore):
    async with semaphore:
        print("--")
        await asyncio.sleep(2)
        # raise Exception("aab")
        return 3


@retry
async def fetch(session, i, semaphore):
    start_time = time.time()
    url = "http://localhost:8080/hello/{}".format(i)
    async with semaphore:
        async with session.get(url=url) as response:
            r = await response.read()
            end_time = time.time()
            cost = end_time - start_time
            msg = "花费时间: {}s, 返回信息: {}\n".format(cost, r)
            print("running %s" % msg)
            return r


headers = {
    'Referer': 'https://www.ixigua.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
}

url = "https://v3-tt.ixigua.com/4bca883b38dc00b023ae5fcadf01b6c9/5f0c2056/video/tos/cn/tos-cn-vd-0026/0b9fe8846e8042cfb71a509c5e734fc8/media-video-avc1/?a=1768&br=4377&bt=1459&cr=0&cs=0&dr=0&ds=3&er=0&l=202007131538270100150411552621354F&lr=default&mime_type=video_mp4&qs=0&rc=M2ZsajkzOjZ5cTMzOjczM0ApMzQ6NDlnN2Q0NzhnZWdmNmdnMnMzb3JuLmNfLS1gLS9zc2BeLTM0NTUxNDU1LzFgMTI6Yw%3D%3D&vl=&vr="


async def get_content_length(session):
    async with session.head(url, headers=headers) as response:
        return int(response.headers["Content-Length"])


total_size = 0
download_size = 0



async def get_by_range(session, fd, semaphore, start, end):
    global download_size
    range_headers=headers.copy()
    range_headers["Range"] = f"bytes={start}-{end}"
    async with semaphore:
        async with session.get(url, headers=range_headers) as response:
            chunk = await response.content.read()
            if chunk:
                fd.seek(start)
                fd.write(chunk)
                download_size += (end - start + 1)
                print(f"\r%0.2f %% %d-%d" % (download_size / total_size * 100, total_size, download_size), end=" ")

    return True


async def download(session):
    global total_size
    total_size = await get_content_length(session)
    print(total_size)
    fd = open("./yzd.mp4", "wb+")
    fd.truncate(total_size)
    chunk_size = 1024 * 1024
    chunk_count = math.ceil(total_size / chunk_size)
    print(chunk_count)
    tasks = []
    semaphore = asyncio.Semaphore(5)
    for index in range(chunk_count):
        start = index * chunk_size
        end = start + chunk_size - 1
        if index == chunk_count - 1:
            end = total_size - 1
        print(start,end)
        task = asyncio.ensure_future(get_by_range(session, fd, semaphore, start, end))
        tasks.append(task)
    responses = asyncio.gather(*tasks)
    print(await responses)
    fd.close()
    return True


async def run():
    tasks = []
    # total:全部请求最终完成时间
    # connect: aiohttp从本机连接池里取出一个将要进行的请求的时间
    # sock_connect：单个请求连接到服务器的时间
    # sock_read：单个请求从服务器返回的时间
    timeout = aiohttp.ClientTimeout(total=330, connect=2, sock_connect=15, sock_read=20)

    start_time = time.time()
    async with ClientSession(connector=TCPConnector(limit=300), timeout=timeout) as session:
        task = asyncio.ensure_future(download(session))
        responses = asyncio.gather(task)
        print(await responses)
        print(time.time() - start_time)


def main():
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(run())
    except Exception as e:
        print(e)

    loop.close()


main()
