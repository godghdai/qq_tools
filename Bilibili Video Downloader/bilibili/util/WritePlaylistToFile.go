package util

import (
	"bilibili/parser/playlist"
	"fmt"
	"io"
	"os"
	"strings"
)

func WritePlaylistToFile(name string, datas []playlist.Data) (err error) {
	file, err := os.OpenFile(name, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("Failed to open the file", err)
		return err
	}
	var data playlist.Data
	strs := []string{}
	for _, data = range datas {
		strs = append(strs, fmt.Sprintf(`%d,"%s",%d`, data.Page, data.Part, data.Cid))
	}

	txtHead := []byte{
		0xEF, 0xBB, 0xBF,
	}
	_, err = file.Write(txtHead)
	if err != nil {
		fmt.Println("Write head faild", err)
	}
	if _, err := io.WriteString(file, strings.Join(strs, "\r\n")); err == nil {
		fmt.Println("Successful appending to the file")
	}
	if err != nil {
		fmt.Println("Failed to open the file", err)
		return err
	}
	return file.Close()
}
