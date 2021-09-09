from xigua.downloader import XiGuaDownloader
import requests


def main():
    # downloader = XiGuaDownloader()
    # downloader.download('https://www.ixigua.com/i6823634214278136323/?logTag=5sKZyyikR91K89DyLfora')
    # downloader.download('https://www.ixigua.com/i6816995251786351108/?logTag=1XIZ5_u52YvSeUnpCM0F0')


    '''

    seriesId="6750173871166456324"
    url = "https://www.ixigua.com/api/videov2/pseries_more_v2?_signature=LagzvAAgEA-JeyLtjQbN8i2oM6AAHKo&pSeriesId="+seriesId+"&rank=0&tailCount=1000&newVersion=1"
    r = requests.get(url, headers={
        "referer": "https://www.ixigua.com"
    })
    data = r.json()
    lss=len(data["data"])
    print(lss)
    print(data["data"].pop())

    datalist=data["data"]
    datalist.sort(key=lambda video: video["video_detail_info"]["video_watch_count"], reverse=True)
    firstdata=datalist[0]

    print(firstdata["title"],"https://www.ixigua.com/pseries/{}_{}/".format(seriesId,firstdata["item_id"]))
    '''


if __name__ == '__main__':
    main()
