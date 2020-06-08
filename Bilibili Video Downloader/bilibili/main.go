package main

import (
	"bilibili/api"
	"bilibili/mediainfo"
	"bilibili/parser/playlist"
	"fmt"
	"io"
	"os"
	"strings"
)



func write(name string, datas []playlist.Data) (err error) {
	file, err := os.OpenFile(name, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("Failed to open the file", err)
		return err
	}
	var data playlist.Data
	strs := []string{}
	for _, data = range datas {
		strs = append(strs, fmt.Sprintf(`"%s",%d,%d`, data.Part, data.Cid, data.Page))
	}

	if _, err := io.WriteString(file, strings.Join(strs, "\r\n")); err == nil {
		fmt.Println("Successful appending to the file")
	}
	if err != nil {
		fmt.Println("Failed to open the file", err)
		return err
	}
	return file.Close()
}

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

	//write("text.txt", jsonData.Data)

	var limit int = 1

	for index, d := range jsonData.Data {
		//fmt.Printf("%+v\n", d)
		//continue

		if index < 31{
			continue
		}
		if limit < 1 {
			break
		}
		limit--
		mediaInfo, err = mediainfo.GetMediaInfo(API, bvid, d.Part, d.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		mediaInfo.Download()

	}
}
