package main

import (
	"bilibili/api"
	"bilibili/mediainfo"
	"bilibili/parser/playlist"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var addr = flag.String("addr", "localhost:8080", "http service address")

var upgrader = websocket.Upgrader{} // use default options

type DownloadParms struct {
	Mtype string `json:"mtype"`
	Url   string `json:"url"`
	Cids  []int  `json:"cids"`
}

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	go func() {
		for {
			mt, message, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				break
			}

			var data map[string]interface{}
			err = json.Unmarshal(message, &data)
			if err != nil {
				log.Println("json unmarshal:", err)
				break
			}

			dt := data["mtype"].(string)
			switch dt {
			case "taskList":
				downloadUrl := data["url"].(string)
				result, err := ss(downloadUrl)
				if err != nil {
					log.Println("json unmarshal:", err)
					return
				}
				s := struct {
					Mtype string            `json:"mtype"`
					Data  *playlist.Message `json:"data"`
				}{
					"taskList",
					result,
				}
				err = c.WriteJSON(s)
				fmt.Print(downloadUrl)
				break

			case "startDownload":
				dd := DownloadParms{}
				err = json.Unmarshal(message, &dd)
				if err != nil {
					log.Println("json unmarshal:", err)
					return
				}
				s := struct {
					Mtype  string `json:"mtype"`
					Status bool   `json:"status"`
				}{
					"startDownloadRes",
					true,
				}
				err = c.WriteJSON(s)
				fmt.Print(dd)
				go startDownload(c, dd)
				break
			}

			log.Printf("%d,recv: %s,%s", mt, message, dt)
		}
		c.Close()
	}()

	/*
	go func() {
		var num int = 0
		for {
			err = c.WriteMessage(websocket.TextMessage, []byte(
				fmt.Sprintf(`{ "type":"tick","value":"%d"}`, num),
			),
			)
			if err != nil {
				log.Println("write:", err)
				break
			}
			num++
			time.Sleep(time.Duration(6) * time.Second)

		}
		c.Close()
	}()*/

}

func loadCookies() (sessdata string, err error) {
	dir, _ := os.Getwd()
	if contents, err := ioutil.ReadFile(filepath.Join(dir, "sessdata.txt")); err == nil {
		result := strings.Replace(string(contents), "\n", "", 1)
		return result, nil
	}
	return "", nil
}

var URL_REG = regexp.MustCompile(`https://www.bilibili.com/video/(.+)\?p=(\d+)`)
var PAGE_REG = regexp.MustCompile(`\?p=(\d+)`)
func ss(url string) (result *playlist.Message, err error) {
	var sessdata string
	sessdata, err = loadCookies()
	if err != nil {
		fmt.Printf("%s\n", "sessdata.txt不存在")
		return
	}
	var header = map[string]string{
		"cookie":  sessdata,
		"Referer": url,
	}
	var API = api.GetInstance(header)

	if !PAGE_REG.MatchString(url) {
		url = fmt.Sprintf(`%s?p=1`, url)
	}
	if !URL_REG.MatchString(url) {
		fmt.Println("下载地址不合法！！")
		return
	}

	params := URL_REG.FindStringSubmatch(url)
	bvid := params[1]
	bvid = strings.ReplaceAll(bvid, `/`, "")
	//page, _ := strconv.Atoi(params[2])
	list, err := API.GetPlayList(bvid)

	if err != nil {
		return nil, err
	}
	return &list, nil
}

func startDownload(socket *websocket.Conn, downloadParms DownloadParms) {

	var sessdata string
	var mediaInfo *mediainfo.MediaInfo
	var err error
	sessdata, err = loadCookies()
	if err != nil {
		fmt.Printf("%s\n", "sessdata.txt不存在")
		return
	}
	var header = map[string]string{
		"cookie":  sessdata,
		"Referer": downloadParms.Url,
	}
	var API = api.GetInstance(header)

	if !PAGE_REG.MatchString(downloadParms.Url) {
		downloadParms.Url = fmt.Sprintf(`%s?p=1`, downloadParms.Url)
	}

	if !URL_REG.MatchString(downloadParms.Url) {
		fmt.Println("下载地址不合法！！")
		return
	}
	params := URL_REG.FindStringSubmatch(downloadParms.Url)
	bvid := params[1]
	bvid = strings.ReplaceAll(bvid, `/`, "")
	//page, _ := strconv.Atoi(params[2])

	var cidsDic = map[int]bool{}
	for _, cid := range downloadParms.Cids {
		cidsDic[cid] = true
	}

	jsonData, err := API.GetPlayList(bvid)

	for _, d := range jsonData.Data {
		_, ok := cidsDic[d.Cid]
		if !ok {
			continue
		}
		mediaInfo, err = mediainfo.GetMediaInfo(socket, API, bvid, d.Part, d.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		fmt.Printf("%+v\n", mediaInfo)
		mediaInfo.Download()
	}
}

func PathExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

func main() {

	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err!=nil{
		fmt.Printf("%s\n", err)
		return
	}
	webdir := filepath.Join(dir, "static")
	exist, _ := PathExists(webdir)
	if !exist{
		fmt.Printf("%s\n", "webdir not exist")
		return
	}
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/echo", echo)
	http.Handle("/", http.FileServer(http.Dir(webdir)))
	fmt.Printf("Listen:%s\n", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))

}
