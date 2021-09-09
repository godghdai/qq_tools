package loader

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

func LoadCookies() (cookies string, err error) {
	dir, _ := os.Getwd()
	if contents, err := ioutil.ReadFile(filepath.Join(dir, "sessdata.txt")); err == nil {
		result := strings.Replace(string(contents), "\n", "", 1)
		return result, nil
	}
	return "", nil
}