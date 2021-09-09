package api

import (
	"bilibili/fetcher"
	"bilibili/parser/playlist"
	"bilibili/parser/playurl"
	"fmt"
	"regexp"
)

var TITLE_REG = regexp.MustCompile(`<h1 title="(.+)" class="video-title">`)

const ApiPlayUrlFormat = "https://api.bilibili.com/x/player/playurl?cid=%d&qn=%d&bvid=%s&type=&otype=json&fnval=16"

//https://api.bilibili.com/pgc/player/web/playurl?cid=197711172&qn=64&type=&otype=json&fourk=1&bvid=BV1iA411v7Wc&fnver=0&fnval=16
const ApiPlayListFormat = "https://api.bilibili.com/x/player/pagelist?bvid=%s&jsonp=jsonp"

type Api struct {
	fetcher.Fetcher
}

type MediaInfo struct {
	Name      string
	AudioName string
	VideoName string
	Cid       int
	AudioUrl  string
	VideoUrl  string
	IsFlv     bool
}

func (api Api) GetPlayUrl(cid int, qn int, bvid string) (msg *playurl.Message, err error) {
	url := fmt.Sprintf(ApiPlayUrlFormat, cid, qn, bvid)
	data, err := api.Get(url)
	if err != nil {
		return nil, err
	}
	return playurl.Parser(data)
}

func (api Api) GetPlayList(bvid string) (msg *playlist.Message, err error) {
	url := fmt.Sprintf(ApiPlayListFormat, bvid)
	data, err := api.Get(url)
	if err != nil {
		return nil, err
	}
	return playlist.Parser(data)
}

func (api Api) GetMediaTitle(url string) (title string, err error) {
	data, err := api.Get(url)
	if err != nil {
		return "", err
	}
	matchs := TITLE_REG.FindStringSubmatch(string(data))
	if len(matchs) < 2 {
		return "", fmt.Errorf("%s", "not find title")
	}
	return matchs[1], nil
}

func (api Api) GetMediaInfo(bvid string, name string, cid int) (mediaInfo *MediaInfo, err error) {
	mediaInfo = &MediaInfo{}
	mediaInfo.Name = name
	mediaInfo.Cid = cid

	jsonData, err := api.GetPlayUrl(cid, 64, bvid)
	if err != nil {
		return nil, err
	}
	dash := jsonData.Data.Dash

	if dash.Video != nil {
		mediaInfo.IsFlv = false
		mediaInfo.VideoUrl = dash.Video[0].BaseUrl
		mediaInfo.AudioUrl = dash.Audio[0].BaseUrl

		mediaInfo.AudioName = fmt.Sprintf("%s_audio.m4s", name)
		mediaInfo.VideoName = fmt.Sprintf("%s_video.m4s", name)

	} else {
		mediaInfo.IsFlv = true
		durl := jsonData.Data.Durl
		mediaInfo.VideoUrl = durl[0].Url
		mediaInfo.VideoName = fmt.Sprintf("%s.flv", name)
		//Backup_url
	}

	return mediaInfo, nil
}

var instance *Api

func New(header map[string]string) *Api {

	if instance == nil {
		instance = &Api{}
		instance.SetHeads(header)
	}
	return instance
}
