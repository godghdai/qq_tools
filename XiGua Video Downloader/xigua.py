import aiohttp
import asyncio
import json
import re
import os
from base64 import b64decode
from lxml import etree
import subprocess

headers = {
    'Referer': 'https://www.ixigua.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
}


def extract_urls(html):
    pattern = r'\<script.*?\>window\._SSR_HYDRATED_DATA=(.*?)\</script\>'
    result = re.findall(pattern, html)
    if len(result) < 1:
        print('not find video_list!!')
        return False, None, None

    result = result[0]
    data = json.loads(result)

    try:
        dynamic_video = data['anyVideo']['gidInformation']["packerData"]["video"]['videoResource']['dash'][
            'dynamic_video']
        return True, dynamic_video["dynamic_video_list"], dynamic_video["dynamic_audio_list"]
    except Exception as e:
        print('err：', e)
        return False, None, None


def extract_download_url(html):
    flag, video_list, audio_list = extract_urls(html)
    if not flag:
        return False, None, None

    video_list.sort(key=lambda video: int(video["definition"].replace("p", "")), reverse=False)
    audio_list.sort(key=lambda audio: audio["bitrate"], reverse=False)

    last_video = video_list.pop()
    last_audio = audio_list.pop()

    return True, b64decode(last_video['main_url']).decode('utf-8'), b64decode(last_audio['main_url']).decode(
        'utf-8')


async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()


async def head(url):
    async with aiohttp.ClientSession() as session:
        async with session.head(url, headers=headers) as response:
            return int(response.headers["Content-Length"])


async def download_by_range(url, start, end, save_path):
    # sem = asyncio.Semaphore(5)
    range_headers = headers.copy()
    range_headers["Range"] = f"bytes={start}-{end}"
    offset = start
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=range_headers) as response:
            with open(save_path, 'rb+') as fd:
                while True:
                    chunk = await response.content.read(1024)
                    if not chunk:
                        break
                    fd.seek(offset, 0)
                    fd.write(chunk)
                    fd.flush()
                    offset += len(chunk)


def callback(future):
    # asyncio.get_event_loop().stop()
    print('Callback: ', future.result())


async def download(url, save_path):
    total_size = await head(url)

    fo = open(save_path, "wb+")
    fo.truncate(total_size)
    fo.close()

    tasks = []
    chunk_count = 5
    index = 0
    chunk_size = total_size // chunk_count
    # print(chunk_size)
    while index < chunk_count:
        start = index * chunk_size
        end = start + chunk_size - 1
        if index == chunk_count - 1:
            end = total_size - 1
        index += 1
        tasks.append(download_by_range(url, start, end, save_path))
        print('Start:%s,end:%s' % (start, end))

    responses = asyncio.gather(*tasks)
    await responses


async def parse(html):
    doc = etree.HTML(html)
    title = ''.join(doc.xpath('//*[@class="hasSource"]/text()'))
    # username = ''.join(doc.xpath('//*[contains(@class ,"user__name")]/text()'))
    flag, video_url, audio_url = extract_download_url(html)
    if not flag:
        return

    print(title)
    '''
    task_audio = asyncio.ensure_future(download(audio_url))
    task_audio.add_done_callback(callback)
    responses = asyncio.gather(task_audio, task_video)
    await responses
    '''
    video_dirs = './video'

    video_file_path = f"{video_dirs}/{title}_video.mp4"
    audio_file_path = f"{video_dirs}/{title}_audio.mp4"

    await download(video_url, video_file_path)
    await download(audio_url, audio_file_path)

    ffmpeg_path = "D:/Users/yzd/PycharmProjects/my/ffmpeg/ffmpeg.exe"
    output_path = f"{video_dirs}/{title}.mp4"
    cmd = [ffmpeg_path, "-i", video_file_path, "-i", audio_file_path, "-c:v", "copy", "-c:a", "copy", output_path]
    subprocess.call(cmd, stdout=subprocess.PIPE)
    os.remove(video_file_path)
    os.remove(audio_file_path)


async def start():
    async with aiohttp.ClientSession(headers=headers) as session:
        url = 'https://www.ixigua.com/i6769877491411583500/?logTag=mxH7-ik0-ZmwyXO_Up470'
        html = await fetch(session, url)
        await parse(html)


def main():
    loop = asyncio.get_event_loop()
    # task = loop.create_task(start())
    # loop.run_until_complete(task)
    loop.run_until_complete(start())
    # loop.run_forever()

# https://www.jianshu.com/p/b5e347b3a17c


if __name__ == '__main__':
    main()
