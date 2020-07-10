import json
import re
from lxml import etree
from base64 import b64decode


def extract_title(html):
    doc = etree.HTML(html)
    title = ''.join(doc.xpath('//*[@class="hasSource"]/text()'))
    if title == "":
        title = ''.join(doc.xpath('//*[@class="videoTitle"]/h1/text()'))

    # username = ''.join(doc.xpath('//*[contains(@class ,"user__name")]/text()'))
    return title


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
