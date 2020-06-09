package main

import (
	"bilibili/api"
	"bilibili/mediainfo"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

var URL_REG = regexp.MustCompile(`https://www.bilibili.com/video/(.+)\?p=(\d+)`)
var PAGE_REG = regexp.MustCompile(`\?p=(\d+)`)

func loadCookies() (sessdata string, err error) {
	dir, _ := os.Getwd()
	if contents, err := ioutil.ReadFile(filepath.Join(dir, "sessdata.txt")); err == nil {
		result := strings.Replace(string(contents), "\n", "", 1)
		return result, nil
	}
	return "", nil
}

func main() {

	var mediaInfo *mediainfo.MediaInfo
	var err error
	var sessdata string
	sessdata, err = loadCookies()
	if err != nil {
		fmt.Printf("%s\n", "sessdata.txt不存在")
		return
	}
	var header = map[string]string{
		"cookie":  sessdata,
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	var API = api.GetInstance(header)

	url := "https://www.bilibili.com/video/BV1sp4y1978x?p=49"

	if !PAGE_REG.MatchString(url) {
		url = fmt.Sprintf(`%s?p=1`, url)
	}

	params := URL_REG.FindStringSubmatch(url)
	bvid := params[1]
	page, _ := strconv.Atoi(params[2])

	jsonData, err := API.GetPlayList(bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	//write(fmt.Sprintf("%s.txt",bvid), jsonData.Data)

	for _, d := range jsonData.Data {
		if d.Page != page {
			continue
		}
		mediaInfo, err = mediainfo.GetMediaInfo(nil,API, bvid, d.Part, d.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		fmt.Printf("%+v\n", mediaInfo)
		mediaInfo.Download()
	}
}
