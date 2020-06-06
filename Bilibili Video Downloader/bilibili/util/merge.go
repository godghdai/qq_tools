package util

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

func Merge(audioFilename string,videoFilename string,mp4Filename string)(success bool ,err error) {

	args := []string{"-i", audioFilename, "-i", videoFilename, "-c:v", "copy",
		"-c:a", "copy", mp4Filename}

	cmd := exec.Command("ffmpeg", args...)

	var out bytes.Buffer
	cmd.Stdout = &out
	err = cmd.Run()
	if err != nil {
		fmt.Printf("%s\n", err)
		return false,err
	}
	fmt.Printf("command output: %q", out.String())

	err = os.Remove(audioFilename)
	if err != nil {
		fmt.Printf("remove %s error %s\n", audioFilename, err)
		return false,err
	}
	err = os.Remove(videoFilename)
	if err != nil {
		fmt.Printf("remove %s error %s\n", videoFilename, err)
		return false,err
	}
	return true,nil
}