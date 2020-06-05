package playlist

import "encoding/json"

type Dimension struct {
	Width int `json:"width"`
	Height int `json:"height"`
	Rotate int `json:"rotate"`
}

type JsonData struct {
	Cid  int  `json:"cid"`
	Page int  `json:"page"`
	From string  `json:"from"`
	Part string `json:"part"`
	Duration int  `json:"duration"`
	Vid string  `json:"vid"`
	Weblink string  `json:"weblink"`
	Dimension Dimension  `json:"dimension"`
}

type ResMessage struct {
	Code   int `json:"code"`
	Message string `json:"message"`
	Ttl int `json:"ttl"`
	Data []JsonData `json:"data"`
}

func Parser(jsonData []byte) (msg ResMessage,err error) {
	msg = ResMessage{}
	err = json.Unmarshal([]byte(jsonData), &msg)
	return msg,err
}