package main

import (
	"bilibili/api"
	"bilibili/mediainfo"
	"bilibili/parser/playlist"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
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
var PAGE_REG=regexp.MustCompile(`\?p=(\d+)`)

func loadCookies() (sessdata string, err error) {
	dir, _ := os.Getwd()
	if contents, err := ioutil.ReadFile(filepath.Join(dir, "sessdata.txt")); err == nil {
		result := strings.Replace(string(contents), "\n", "", 1)
		return result, nil
	}
	return "", fmt.Errorf("sessdata.txt 不存在")
}

func main() {

	var mediaInfo *mediainfo.MediaInfo
	var err error
	var sessdata string
	sessdata, err = loadCookies()
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	fmt.Printf("sessdata:%s\n", sessdata)
	var header = map[string]string{
		"cookie":  sessdata,
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	var API = api.GetInstance(header)


	if len(os.Args) == 1 {
		fmt.Println("下载地址为空")
		return
	}

	var url = os.Args[1]

	if !PAGE_REG.MatchString(url){
		url=fmt.Sprintf(`%s?p=1`,url)
	}

	if !URL_REG.MatchString(url) {
		fmt.Println("下载地址不合法！！")
		return
	}

	params := URL_REG.FindStringSubmatch(url)
	bvid := params[1]
	bvid= strings.ReplaceAll(bvid,`/`,"")
	page, _ := strconv.Atoi(params[2])

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
		if d.Part==""{
			d.Part=fmt.Sprintf("%d",time.Now().UnixNano())
		}
		mediaInfo, err = mediainfo.GetMediaInfo(nil,API, bvid, d.Part, d.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		mediaInfo.Download()
	}
}
