package main

import (
	"bilibili/api"
	"bilibili/downloader"
	"bilibili/parser/playlist"
	"bilibili/parser/urlparam"
	"bilibili/util"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

var addr = flag.String("addr", "localhost:8080", "http service address")
var API *api.Api
var header map[string]string
var upgrader = websocket.Upgrader{} // use default options

type DownloadParms struct {
	Mtype string `json:"mtype"`
	Url   string `json:"url"`
	Cids  []int  `json:"cids"`
}

func echo(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	go func() {
		for {
			mt, message, err := conn.ReadMessage()
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
				result, err := getTaskList(downloadUrl)
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
				err = conn.WriteJSON(s)
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
				err = conn.WriteJSON(s)
				fmt.Print(dd)
				go startDownload(conn, dd)
				break
			}

			log.Printf("%d,recv: %s,%s", mt, message, dt)
		}

		err = conn.Close()
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}

	}()

}

func getTaskList(url string) (result *playlist.Message, err error) {
	param, err := urlparam.Parser(url)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	list, err := API.GetPlayList(param.Bvid)

	if err != nil {
		return nil, err
	}
	return list, nil
}

func noticeClientUpdateProgress(socket *websocket.Conn, cid int, isVideo bool, p string) {
	var str = ""
	if isVideo {
		str = fmt.Sprintf(`{ "mtype":"chunks","cid":%d,"video":%s}`, cid, p)
	} else {
		str = fmt.Sprintf(`{ "mtype":"chunks","cid":%d,"audio":%s}`, cid, p)
	}

	err := socket.WriteMessage(websocket.TextMessage, ([]byte)(str))
	if err != nil {
		fmt.Println("write:", err)
	}
}

func noticeClientDownloadFinished(socket *websocket.Conn, cid int) {
	err := socket.WriteMessage(websocket.TextMessage, ([]byte)(fmt.Sprintf(`{ "mtype":"downloadFinished","cid":%d}`, cid)))
	if err != nil {
		fmt.Println("write:", err)
	}
}

func startDownload(socket *websocket.Conn, downloadParms DownloadParms) {
	var info *api.MediaInfo
	param, err := urlparam.Parser(downloadParms.Url)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}

	var cidsDic = map[int]bool{}
	for _, cid := range downloadParms.Cids {
		cidsDic[cid] = true
	}

	jsonData, err := API.GetPlayList(param.Bvid)
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	for _, d := range jsonData.Data {
		_, ok := cidsDic[d.Cid]
		if !ok {
			continue
		}
		info, err = API.GetMediaInfo(param.Bvid, d.Part, d.Cid)
		if err != nil {
			fmt.Printf("%s\n", err)
			return
		}
		fmt.Printf("%+v\n", info)

		name := fmt.Sprintf("%s.mp4", info.Name)

		var isVideo bool
		withHttpHeader := downloader.WithHttpHeader(header)
		withChunkSize := downloader.WithChunkSize(1024 * 1024 * 2)
		withOnProgress := downloader.WithOnProgress(func(completedSize int64, totalSize int64, downloader *downloader.Downloader) {
			fmt.Printf("[%s] %.2f %% %d/%d\r", downloader.SavePath, float64(completedSize)/float64(totalSize)*100, totalSize, completedSize)
			noticeClientUpdateProgress(socket, d.Cid, isVideo, fmt.Sprintf(" %.0f", float64(completedSize)/float64(totalSize)*100))
		})

		if info.IsFlv {
			isVideo = true
			downloader.New(info.VideoUrl, info.VideoName, withHttpHeader, withChunkSize, withOnProgress).Run()
			fmt.Print("\n")
			err = util.ToMp4(info.VideoName, name)
			if err != nil {
				fmt.Printf("%s 转换失败\n", name)
				fmt.Printf("%s\n", err)
			} else {
				fmt.Printf("%s 转换完成\n", name)
				noticeClientDownloadFinished(socket, d.Cid)
			}

		} else {
			isVideo = true
			downloader.New(info.VideoUrl, info.VideoName, withHttpHeader, withChunkSize, withOnProgress).Run()
			fmt.Print("\n")
			isVideo = false
			downloader.New(info.AudioUrl, info.AudioName, withHttpHeader, withOnProgress).Run()
			fmt.Print("\n")
			err = util.Merge(info.AudioName, info.VideoName, name)
			if err != nil {
				fmt.Printf("%s 合并失败\n", name)
				fmt.Printf("%s\n", err)
			} else {
				fmt.Printf("%s 合并完成\n", name)
				noticeClientDownloadFinished(socket, d.Cid)
			}
		}

	}
}


func main() {
	var err error

	header, err = util.GetHeader()
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	API=api.New(header)

	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		fmt.Printf("%s\n", err)
		return
	}
	webdir := filepath.Join(dir, "static")
	exist, _ := util.PathExists(webdir)
	if !exist {
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


