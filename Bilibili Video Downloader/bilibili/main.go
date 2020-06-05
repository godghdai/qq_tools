package main

import (
	"bilibili/api"
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
)

func merge(name string) {

	audioFilename := fmt.Sprintf("%s_audio.m4s", name)
	videoFilename := fmt.Sprintf("%s_video.m4s", name)
	args := []string{"-i", audioFilename, "-i", videoFilename, "-c:v", "copy",
		"-c:a", "copy", fmt.Sprintf("%s.mp4", name)}

	cmd := exec.Command("ffmpeg", args...)

	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("command output: %q", out.String())

	os.Remove(audioFilename)
	os.Remove(videoFilename)
}

func main() {
	dsfd()
	//merge("谢雨欣 - 步步高")
}
func dsfd() {
	heads := map[string]string{
		"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
		"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
	}
	api := api.GetInstance(heads)

	bvid := "BV1N7411f7Mo"

	jsonData1, _ := api.GetPlayList(bvid)
	for _, d := range jsonData1.Data {
		fmt.Printf("%+v,%d \n", d.Part, d.Cid)
	}

	fmt.Printf("%s\n", jsonData1)

	jsonData2, _ := api.GetPlayUrl(167089893, 64, bvid)
	var dash = jsonData2.Data.Dash

	//api.Download(dash.Audio[0].BaseUrl, "./谢雨欣 - 步步高_audio.m4s")
	fmt.Printf("%+v\n", dash.Audio[0].BaseUrl)
	content_length,err := api.Head(dash.Video[0].BaseUrl)
	if err!=nil{

	}
	fmt.Printf("%d\n", content_length)
	fmt.Printf("%+v\n", dash.Video[0].BaseUrl)
	//api.Download(dash.Video[0].BaseUrl, "./谢雨欣 - 步步高_video.m4s")
}
