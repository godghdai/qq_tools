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

func (api Api) GetPlayUrl(cid int, qn int, bvid string) (msg playurl.ResMessage, err error) {
	url := fmt.Sprintf(ApiPlayUrlFormat, cid, qn, bvid)
	data, err := api.fetcher.Get(url)
	return playurl.Parser(data)
}

func (api Api) GetPlayList(bvid string) (msg playlist.ResMessage, err error) {
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

func (api Api) Range(url string, start int, end int) (resp *http.Response, err error) {
	return api.fetcher.Range(url, start,end)
}

var instance *Api

func GetInstance(heads map[string]string) *Api {
	if instance == nil {
		instance = &Api{}
		instance.fetcher.SetHeads(heads)
	}
	return instance
}
