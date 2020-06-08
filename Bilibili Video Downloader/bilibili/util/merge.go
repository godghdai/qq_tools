package util

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

func Merge(audioFilename string,videoFilename string,mp4Filename string)(err error) {

	args := []string{"-i", audioFilename, "-i", videoFilename, "-c:v", "copy",
		"-c:a", "copy", mp4Filename}

	cmd := exec.Command("ffmpeg", args...)

	var out bytes.Buffer
	cmd.Stdout = &out
	err = cmd.Run()
	if err != nil {
		fmt.Printf("%s\n", err)
		return err
	}
	//fmt.Printf("command output: %q", out.String())

	err = os.Remove(audioFilename)
	if err != nil {
		fmt.Printf("remove %s error %s\n", audioFilename, err)
		return err
	}
	err = os.Remove(videoFilename)
	if err != nil {
		fmt.Printf("remove %s error %s\n", videoFilename, err)
		return err
	}
	return nil
}