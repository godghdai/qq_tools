package main

import (
	"bilibili/api"
	"bilibili/iterator"
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

	url := "http://upos-sz-mirrorcos.bilivideo.com/upgcxcode/93/98/167089893/167089893-1-30064.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1591444429&gen=playurl&os=cosbv&oi=662720729&trid=a2a25cd811ac418bbbcb47f98b4c69a2u&platform=pc&upsig=5ce8611dda631b7ea499d78b1c719903&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=65209193&orderid=0,2&logo=80000000"
	contentLength, err := api.Head(url)
	if err != nil {
		fmt.Printf("%s \n", err)
		return
	}
	chunkIter := iterator.GetChunkIterator(contentLength, 1024*1024*16)

	paramChan2, resultChan2 := filefetcher.Create(api)
	go func() {
		for ; chunkIter.HasNext(); {
			chunk := chunkIter.Next()
			paramChan2 <- filefetcher.Param{
				Url:   url,
				Start: chunk.Start,
				End:   chunk.End,
			}
		}
	}()

	paramChan, resultChan := filewriter.Create()
	var count int64=0
	for {
		select {
			case result2 := <-resultChan2:
				if result2.Err==nil{
					go func() {
						paramChan<-filewriter.Param{
							Name:  "yzd5.m4s",
							Bytes: result2.Bytes,
							Start: result2.Start,
						}
					}()
				}
				break

			case result := <-resultChan:
				count++

				fmt.Printf("%+v\n", result)
				break
		default:
			fmt.Printf("%d_%d\n", count,chunkIter.ChunkCount)
			if count==chunkIter.ChunkCount {

				return
			}
		}

	}





}

func dsfd() {
	heads := map[string]string{
		"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	api := api.GetInstance(heads)

	bvid := "BV1N7411f7Mo"

	jsonData1, _ := api.GetPlayList(bvid)
	for _, d := range jsonData1.Data {
		fmt.Printf("%+v,%d \n", d.Part, d.Cid)
	}

	fmt.Printf("%s\n", jsonData1)

	jsonData2, _ := api.GetPlayUrl(167089893, 64, bvid)
	var dash = jsonData2.Data.Dash

	//api.Download(dash.Audio[0].BaseUrl, "./谢雨欣 - 步步高_audio.m4s")
	fmt.Printf("%+v\n", dash.Audio[0].BaseUrl)
	content_length, err := api.Head(dash.Video[0].BaseUrl)
	if err != nil {

	}
	fmt.Printf("%d\n", content_length)
	fmt.Printf("%+v\n", dash.Video[0].BaseUrl)
	//api.Download(dash.Video[0].BaseUrl, "./谢雨欣 - 步步高_video.m4s")
}
