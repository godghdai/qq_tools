package main

import (
	"bilibili/api"
	"bilibili/downloader"
	"bilibili/mediainfo"
	"bilibili/util"
	"fmt"
	"runtime"
)


func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())
	var mediaInfo *mediainfo.MediaInfo

	var header = map[string]string{
		"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	var bvid = "BV1uW41167Ls"
	var API = api.GetInstance(header)
	jsonData, err := API.GetPlayList(bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	var d = jsonData.Data[3]
	mediaInfo, err = mediainfo.GetMediaInfo(nil, API, bvid, d.Part, d.Cid)
	if err != nil {
		fmt.Printf("%s\n", err)
	}
	fmt.Printf("%s--\n%d--\n", mediaInfo.Video.Url, mediaInfo.Video.Length)
	fmt.Printf("%+v\n", mediaInfo.Video.Chunks)

	downloader.New( mediaInfo.Video.Url,mediaInfo.VideoName,API, 1024 * 1024 * 2).Run()
	downloader.New( mediaInfo.AudioUrl,mediaInfo.AudioName,API, 1024 * 1024 * 2).Run()
	name := fmt.Sprintf("%s.mp4", mediaInfo.Name)
	util.Merge(mediaInfo.AudioName,mediaInfo.VideoName,name)
}
