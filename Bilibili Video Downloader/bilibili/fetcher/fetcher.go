package fetcher

import (
	"io"
	"io/ioutil"
	"net/http"
	"os"
)

type Fetcher struct {
	heads map[string]string
}

func (fetcher *Fetcher) req(url string) (resp *http.Response, err error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	if fetcher.heads != nil {
		for key, val := range fetcher.heads {
			req.Header.Add(key, val)
		}
	}
	return client.Do(req)
}

func (fetcher *Fetcher) Get(url string) (data []byte, err error) {
	resp, err := fetcher.req(url)
	if err != nil {
		return nil,err
	}
	defer resp.Body.Close()
	return ioutil.ReadAll(resp.Body)
}

func (fetcher *Fetcher) Download(url string, path string) (err error) {
	var (
		response *http.Response
		file     *os.File
	)
	response, err =  fetcher.req(url)
	defer response.Body.Close()
	file, err = os.Create(path)
	defer file.Close()
	if err != nil {
		return err
	}
	_, err = io.Copy(file, response.Body)
	if err != nil {
		return err
	}
	return nil
}

func (fetcher *Fetcher) SetHeads(heads map[string]string) () {
	fetcher.heads=heads
}