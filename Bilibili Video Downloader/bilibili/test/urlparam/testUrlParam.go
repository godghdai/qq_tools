package main

import (
	"bilibili/parser/urlparam"
	"fmt"
)

func main()  {

	var urls=[]string{
		"https://www.bilibili.com/bangumi/play/ep319062?theme=movie",
		"https://www.bilibili.com/video/BV1Ux411u797?spm_id_from=333.851.b_62696c695f7265706f72745f6d75736963.9",
		"https://www.bilibili.com/video/BV1aJ411372K?spm_id_from=333.851.b_62696c695f7265706f72745f64616e6365.6",
		"https://www.bilibili.com/video/BV1W4411Z7MD/?spm_id_from=333.788.videocard.1",
		"https://www.bilibili.com/video/BV1fx411N7bU?from=search&seid=6692209454791284611",
		"https://www.bilibili.com/video/BV1fx411N7bU?p=8",
		"https://www.bilibili.com/video/BV1c4411T7ug/p=237",
	}
	for _,url:=range urls  {
		parser, err := urlparam.Parser(url)
		if err!=nil{
			fmt.Print(url,err)
		}else{
			fmt.Print(url,"__",parser.Bvid,"__",parser.Page,"\n")
		}

	}


}