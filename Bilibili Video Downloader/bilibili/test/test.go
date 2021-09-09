package main

import (
	"bilibili/api"
	"bilibili/downloader"
	"bilibili/util"
	"fmt"
)




func main() {

	var info *api.MediaInfo

	var header = map[string]string{
		"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	var bvid = "BV1uW41167Ls"
	var err error
	API := api.GetInstance(header)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	jsonData, err := API.GetPlayList(bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	var d = jsonData.Data[18]
	info, err = API.GetMediaInfo(bvid, d.Part, d.Cid)
	if err != nil {
		fmt.Printf("%s\n", err)
	}



	name := fmt.Sprintf("%s.mp4", info.Name)

	withHttpHeader := downloader.WithHttpHeader(header)
	withChunkSize := downloader.WithChunkSize(1024 * 1024 * 2)
	withOnProgress := downloader.WithOnProgress(func(completedSize int64, totalSize int64, downloader *downloader.Downloader) {
		fmt.Printf("[%s] %.2f %% %d/%d\r", downloader.SavePath, float64(completedSize)/float64(totalSize)*100, completedSize, totalSize)
	})

	if info.IsFlv {
		downloader.New(info.VideoUrl, info.VideoName, withHttpHeader, withChunkSize, withOnProgress).Run()

		err = util.ToMp4(info.VideoName, name)
		if err != nil {
			fmt.Printf("%s 转换失败\n", name)
			fmt.Printf("%s\n", err)
		} else {
			fmt.Printf("%s 转换完成\n", name)
		}

	} else {
		downloader.New(info.VideoUrl, info.VideoName, withHttpHeader, withChunkSize, withOnProgress).Run()
		downloader.New(info.AudioUrl, info.AudioName, withHttpHeader,withOnProgress).Run()

		err = util.Merge(info.AudioName, info.VideoName, name)
		if err != nil {
			fmt.Printf("%s 合并失败\n", name)
			fmt.Printf("%s\n", err)
		} else {
			fmt.Printf("%s 合并完成\n", name)
		}
	}

}
