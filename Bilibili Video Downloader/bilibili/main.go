package main

import (
	"bilibili/api"
	"bilibili/mediainfo"
	"bilibili/parser/playlist"
	"fmt"
	"io"
	"os"
	"regexp"
	"strconv"
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
		strs = append(strs, fmt.Sprintf(`%d,"%s",%d`, data.Page, data.Part, data.Cid))
	}

	txtHead := []byte{
		0xEF, 0xBB, 0xBF,
	}
	_, err = file.Write(txtHead)
	if err != nil {
		fmt.Println("Write head faild", err)
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

var URL_REG = regexp.MustCompile(`https://www.bilibili.com/video/(.+)\?p=(\d+)`)

func main() {

	if len(os.Args) == 1 {
		fmt.Println("下载地址为空")
		return
	}

	var url = os.Args[1]
	if !URL_REG.MatchString(url) {
		fmt.Println("下载地址不合法！！")
		return
	}

	params := URL_REG.FindStringSubmatch(url)
	bvid := params[1]
	page, _ := strconv.Atoi(params[2])
	var API = api.GetInstance()
	var mediaInfo *mediainfo.MediaInfo
	var err error

	jsonData, err := API.GetPlayList(bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	//write(fmt.Sprintf("%s.txt",bvid), jsonData.Data)

	for _, d := range jsonData.Data {
		if d.Page!=page{
			continue
		}
		mediaInfo, err = mediainfo.GetMediaInfo(API, bvid, d.Part, d.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		mediaInfo.Download()
	}
}
