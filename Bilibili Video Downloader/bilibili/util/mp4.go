package util

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

func ToMp4(videoFilename string,mp4Filename string)(err error) {

	args := []string{"-i", videoFilename, "-c:v", "copy",
		"-c:a", "copy", mp4Filename}

	cmd := exec.Command("ffmpeg", args...)

	var out bytes.Buffer
	cmd.Stdout = &out
	err = cmd.Run()
	if err != nil {
		fmt.Printf("%s\n", err)
		return err
	}

	err = os.Remove(videoFilename)
	if err != nil {
		fmt.Printf("remove %s error %s\n", videoFilename, err)
		return err
	}
	return nil
}