package main

import (
	"bilibili/api"
	"bilibili/downloader"
	"bilibili/parser/playlist"
	"bilibili/parser/urlparam"
	"bilibili/util"
	"fmt"
	"os"
)

var API *api.Api

func main() {

	var info *api.MediaInfo
	var err error
	header, err := util.GetHeader()
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	API= api.New(header)

	if len(os.Args) == 1 {
		fmt.Println("下载地址为空")
		return
	}

	var url = os.Args[1]

	param, err := urlparam.Parser(url)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	jsonData, err := API.GetPlayList(param.Bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	var data playlist.Data
	for _, data = range jsonData.Data {
		if data.Page == param.Page {
			break
		}
	}

	if data.Part == "" {
		title, err := API.GetMediaTitle(url)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		data.Part = title
	}

	info, err = API.GetMediaInfo(param.Bvid, data.Part, data.Cid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	name := fmt.Sprintf("%s.mp4", info.Name)

	withHttpHeader := downloader.WithHttpHeader(header)
	withChunkSize := downloader.WithChunkSize(1024 * 1024 * 2)
	withOnProgress := downloader.WithOnProgress(func(completedSize int64, totalSize int64, downloader *downloader.Downloader) {
		fmt.Printf("[%s] %.2f %% %d/%d\r", downloader.SavePath, float64(completedSize)/float64(totalSize)*100, totalSize, completedSize)
	})

	videoOpiton := []downloader.Option{
		withHttpHeader, withChunkSize, withOnProgress,
	}
	audioOpiton := []downloader.Option{
		withHttpHeader, withOnProgress,
	}
	if info.IsFlv {
		downloader.New(info.VideoUrl, info.VideoName, videoOpiton...).Run()
		fmt.Print("\n")
		err = util.ToMp4(info.VideoName, name)
		if err != nil {
			fmt.Printf("%s 转换失败\n", name)
			fmt.Printf("%s\n", err)
		} else {
			fmt.Printf("%s 转换完成\n", name)
		}

	} else {
		downloader.New(info.VideoUrl, info.VideoName, videoOpiton...).Run()
		fmt.Print("\n")
		downloader.New(info.AudioUrl, info.AudioName, audioOpiton...).Run()
		fmt.Print("\n")
		err = util.Merge(info.AudioName, info.VideoName, name)
		if err != nil {
			fmt.Printf("%s 合并失败\n", name)
			fmt.Printf("%s\n", err)
		} else {
			fmt.Printf("%s 合并完成\n", name)
		}
	}

}
