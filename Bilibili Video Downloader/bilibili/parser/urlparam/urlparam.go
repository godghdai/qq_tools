package urlparam

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

const BASE_URL = "https://www.bilibili.com/video/"

var URL_REG = regexp.MustCompile(`https://www.bilibili.com/video/(.+)`)
var PAGE_REG = regexp.MustCompile(`p=(\d+)`)
var URL_ERROR= fmt.Errorf("%s", "下载地址不合法")

type Param struct {
	Bvid string
	Page int
}

func Parser(url string) (param *Param, err error) {
	param = &Param{}

	if !PAGE_REG.MatchString(url) {
		param.Page = 1
	}else {
		submatch := PAGE_REG.FindStringSubmatch(url)
		if len(submatch)<2{
			return nil,URL_ERROR
		}
		atoi, _ := strconv.Atoi(submatch[1])
		param.Page = atoi
	}

	if !URL_REG.MatchString(url) {
		return nil, URL_ERROR
	}

	param.Bvid= strings.TrimPrefix(url,BASE_URL)[:12]
	return param, nil

}
