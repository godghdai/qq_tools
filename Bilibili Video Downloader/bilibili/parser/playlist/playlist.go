package playlist

import "encoding/json"

type Dimension struct {
	Width int `json:"width"`
	Height int `json:"height"`
	Rotate int `json:"rotate"`
}

type Data struct {
	Cid  int  `json:"cid"`
	Page int  `json:"page"`
	From string  `json:"from"`
	Part string `json:"part"`
	Duration int  `json:"duration"`
	Vid string  `json:"vid"`
	Weblink string  `json:"weblink"`
	Dimension Dimension  `json:"dimension"`
}

type Message struct {
	Code   int `json:"code"`
	Message string `json:"message"`
	Ttl int `json:"ttl"`
	Data []Data `json:"data"`
}

func Parser(jsonData []byte) (msg Message,err error) {
	msg = Message{}
	err = json.Unmarshal([]byte(jsonData), &msg)
	return msg,err
}