package util

import (
	"bilibili/loader"
	"os"
)

func GetHeader() (header map[string]string, err error) {
	var sessdata string
	sessdata, err = loader.LoadCookies()
	if err != nil {
		return nil, err
	}
	return map[string]string{
		"cookie":  sessdata,
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	},nil
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
