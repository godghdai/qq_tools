package api

import (
	"bilibili/fetcher"
	"bilibili/parser/playlist"
	"bilibili/parser/playurl"
	"fmt"
	"net/http"
)

const ApiPlayUrlFormat = "https://api.bilibili.com/x/player/playurl?cid=%d&qn=%d&bvid=%s&type=&otype=json&fnval=16"
const ApiPlayListFormat = "https://api.bilibili.com/x/player/pagelist?bvid=%s&jsonp=jsonp"

type Api struct {
	fetcher fetcher.Fetcher
}

func (api Api) GetPlayUrl(cid int, qn int, bvid string) (msg playurl.Message, err error) {
	url := fmt.Sprintf(ApiPlayUrlFormat, cid, qn, bvid)
	data, err := api.fetcher.Get(url)
	return playurl.Parser(data)
}

func (api Api) GetPlayList(bvid string) (msg playlist.Message, err error) {
	url := fmt.Sprintf(ApiPlayListFormat, bvid)
	data, err := api.fetcher.Get(url)
	return playlist.Parser(data)
}

func (api Api) Download(url string, path string) (err error) {
	return api.fetcher.Download(url, path)
}

func (api Api) Head(url string) (length int64, err error) {
	return api.fetcher.Head(url)
}

func (api Api) Range(url string, start int64, end int64) (resp *http.Response, err error) {
	return api.fetcher.Range(url, start,end)
}

var instance *Api

var DefaultHeaders = map[string]string{
	"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
	"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
}
func GetInstance() *Api {

	if instance == nil {
		instance = &Api{}
		instance.fetcher.SetHeads(DefaultHeaders)
	}
	return instance
}
