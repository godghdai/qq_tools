package playurl

import "encoding/json"

type Video struct {
	Id int
	BaseUrl string
	Base_url string
	BackupUrl []string
	Backup_url[]string
	Bandwidth int
	MimeType string
	Mime_type string
	Codecs string
	Width int
	Height int
	Codecid int
}

type Audio struct {
	Id int
	BaseUrl string
	Base_url string
	BackupUrl []string
	Backup_url[]string
	Bandwidth int
	MimeType string
	Mime_type string
	Codecs string
}

type Dash struct {
	Duration int `json:"duration"`
	MinBufferTime float32 `json:"minBufferTime"`
	Min_buffer_time float32 `json:"min_buffer_time"`
	Video []Video `json:"video"`
	Audio []Audio `json:"audio"`
}

type Durl struct {
	Size int `json:"size"`
	Url string `json:"url"`
	Backup_url []string `json:"backup_url"`
}

type Data struct {
	From  string  `json:"from"`
	Result string  `json:"result"`
	Message string  `json:"message"`
	Quality int `json:"quality"`
	Format string  `json:"format"`
	Timelength int  `json:"timelength"`
	Accept_format string  `json:"accept_format"`
	Accept_description []string `json:"accept_description"`
	Accept_quality []int `json:"accept_quality"`
	Video_codecid int `json:"video_codecid"`
	Seek_param string `json:"seek_param"`
	Seek_type string `json:"seek_type"`
	Dash Dash `json:"dash"`
	Durl []Durl `json:"durl"`
}

type Message struct {
	Code   int `json:"code"`
	Message string `json:"message"`
	Ttl int `json:"ttl"`
	Data Data `json:"data"`
}


func Parser(jsonData []byte) (msg *Message,err error) {
	msg = &Message{}
	err = json.Unmarshal([]byte(jsonData), msg)
	return msg,err
}