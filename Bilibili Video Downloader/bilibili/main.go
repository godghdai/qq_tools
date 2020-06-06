package main

import (
	"bilibili/api"
	"bilibili/iterator"
	"bilibili/util"
	"bilibili/worker/filefetcher"
	"bilibili/worker/filewriter"
	"fmt"
)

func main() {
	heads := map[string]string{
		"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	api := api.GetInstance(heads)

	bvid := "BV1sp4y1978x"

	jsonData1, _ := api.GetPlayList(bvid)
	for _, d := range jsonData1.Data {
		fmt.Printf("%+v,%d \n", d.Part, d.Cid)
	}

	fmt.Printf("%s\n", jsonData1)

	jsonData2, _ := api.GetPlayUrl(185988298, 64, bvid)
	var dash = jsonData2.Data.Dash

	name:="陈小春-没那种命"
	audioFilename := fmt.Sprintf("%s_audio.m4s", name)
	videoFilename := fmt.Sprintf("%s_video.m4s", name)

	//api.Download(dash.Audio[0].BaseUrl, "./谢雨欣 - 步步高_audio.m4s")

	fmt.Printf("%+v\n", dash.Audio[0].BaseUrl)
	download(api, dash.Audio[0].BaseUrl, audioFilename)
	content_length, err := api.Head(dash.Video[0].BaseUrl)
	if err != nil {

	}
	fmt.Printf("%d\n", content_length)
	fmt.Printf("%+v\n", dash.Video[0].BaseUrl)
	download(api, dash.Video[0].BaseUrl, videoFilename)


	mp4Filename := fmt.Sprintf("%s.mp4", name)
	util.Merge(audioFilename,videoFilename,mp4Filename)

	//api.Download(dash.Video[0].BaseUrl, "./谢雨欣 - 步步高_video.m4s")
}
func download(api *api.Api, url string, filename string) {

	contentLength, err := api.Head(url)
	if err != nil {
		fmt.Printf("%s \n", err)
		return
	}
	chunkIter := iterator.GetChunkIterator(contentLength, 1024*1024*16)
	fetcherParamChan := make(chan filefetcher.Param, 5)
	fetcherResultChan := make(chan filefetcher.Result, 5)
	for i := int64(0); i < chunkIter.ChunkCount; i++ {
		filefetcher.Create(api, fetcherParamChan, fetcherResultChan)
	}

	go func() {
		for ; chunkIter.HasNext(); {
			chunk := chunkIter.Next()
			fetcherParamChan <- filefetcher.Param{
				Url:   url,
				Start: chunk.Start,
				End:   chunk.End,
			}
		}
	}()

	paramChan, resultChan := filewriter.Create()
	var count int64 = 0
	for {
		select {
		case fetcherResult := <-fetcherResultChan:
			if fetcherResult.Err == nil {
				go func() {
					paramChan <- filewriter.Param{
						Name:  filename,
						Bytes: fetcherResult.Bytes,
						Start: fetcherResult.Start,
					}
				}()
			}
			break

		case result := <-resultChan:
			count++
			fmt.Printf("%+v\n", result)
			break
		default:
			fmt.Printf("%d_%d\n", count, chunkIter.ChunkCount)
			if count == chunkIter.ChunkCount {
				return
			}
		}
	}

}
