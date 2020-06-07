package main

import (
	"bilibili/api"
	"bilibili/mediainfo"
	"fmt"
)

func main() {
	var API = api.GetInstance()
	var mediaInfo *mediainfo.MediaInfo
	var err error
	bvid := "BV1sp4y1978x"

	jsonData, err := API.GetPlayList(bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	for _, data := range jsonData.Data {

		mediaInfo, err = mediainfo.GetMediaInfo(API, bvid, data.Part, data.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		mediaInfo.Download()

	}
}
