package downloader

import (
	"bilibili/fetcher"
	"bilibili/iterator"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

type Downloader struct {
	Url             string
	SavePath        string
	Fetcher         *fetcher.Fetcher
	FileSize        int64
	CompletedSize   int64
	ProgressFunc    ProgressFunc
	TryTime         int
	ChunkSize       int64
	Chunks          []Chunk
	paramChan       chan Param
	resultChan      chan Result
	resultErrorChan chan ResultError
}

type Option func(*Downloader)

func (downloader *Downloader) Consumer() {
	var (
		data []byte
		err  error
		resp *http.Response
	)

	for {
		param, ok := <-downloader.paramChan
		if !ok {
			break
		}
		resp, err = downloader.Fetcher.Range(downloader.Url, param.Start, param.End)
		if err != nil {
			goto sendErr
		}

		data, err = ioutil.ReadAll(resp.Body)
		if err != nil {
			goto sendErr
		}
		err = resp.Body.Close()
		if err != nil {
			goto sendErr
		}
		downloader.resultChan <- Result{
			Param: param,
			Bytes: &data,
		}
		continue

	sendErr:
		downloader.resultErrorChan <- ResultError{
			Param: param,
			Err:   err,
		}

	}

}

func (downloader *Downloader) RunConsumer(nums int) {
	for i := 0; i < nums; i++ {
		go downloader.Consumer()
	}
}

func (downloader *Downloader) RunProducer() {
	go func() {
		for i := 0; i < len(downloader.Chunks); i++ {
			chunk := downloader.Chunks[i]
			downloader.paramChan <- Param{
				Start:   chunk.Start,
				End:     chunk.End,
				TryTime: downloader.TryTime,
			}
		}
	}()
}

func (downloader *Downloader) Run() (err error) {
	var (
		file         *os.File
		successCount = 0
	)

	downloader.RunProducer()
	downloader.RunConsumer(5)

	var total = len(downloader.Chunks)

	file, err = os.OpenFile(downloader.SavePath, os.O_RDWR|os.O_CREATE, os.ModePerm)
	if err != nil {
		goto finished
	}

	for {
		select {
		case request := <-downloader.resultChan:
			_, err = file.WriteAt(*request.Bytes, request.Param.Start)
			if err != nil {
				goto finished
			}
			downloader.CompletedSize += request.Param.End - request.Param.Start + 1
			//fmt.Printf("%+v\n", request.Param)
			if downloader.ProgressFunc != nil {
				downloader.ProgressFunc(downloader.CompletedSize, downloader.FileSize, downloader)
			}
			successCount++
			if successCount == total {
				err = nil
				goto finished
			}
		case resErr := <-downloader.resultErrorChan:
			if resErr.Param.TryTime > 0 {

				downloader.paramChan <- Param{
					Start:   resErr.Param.Start,
					End:     resErr.Param.End,
					TryTime: resErr.Param.TryTime - 1,
				}

				continue
			}
			err = resErr.Err
			goto finished
		}
	}

finished:

	if file != nil {
		err = file.Close()
	}
	if err != nil {
		fmt.Printf("%s\n", err)
		return err
	}
	return nil
}

func WithChunkSize(chunkSize int64) Option {
	return func(d *Downloader) {
		d.ChunkSize = chunkSize
	}
}

func WithTryTime(tryTime int) Option {
	return func(d *Downloader) {
		d.TryTime = tryTime
	}
}

func WithHttpHeader(heads map[string]string) Option {
	return func(d *Downloader) {
		d.Fetcher.SetHeads(heads)
	}
}

func WithOnProgress(progressFunc ProgressFunc) Option {
	return func(d *Downloader) {
		d.ProgressFunc = progressFunc
	}
}

func New(url string, savePath string, options ...Option) (downloader *Downloader) {
	downloader = &Downloader{
		paramChan:       make(chan Param, 10),
		resultChan:      make(chan Result, 5),
		resultErrorChan: make(chan ResultError, 5),
	}
	downloader.Fetcher = &fetcher.Fetcher{}
	downloader.ChunkSize = 1024 * 1024 * 2
	downloader.TryTime = 3
	for _, o := range options {
		o(downloader)
	}
	downloader.Url = url
	downloader.SavePath = savePath
	contentLength, err := downloader.Fetcher.Head(url)
	if err != nil {
		return nil
	}
	downloader.FileSize = contentLength
	downloader.CompletedSize = 0
	chunkIter := iterator.New(contentLength, downloader.ChunkSize)
	var Chunks = make([]Chunk, chunkIter.ChunkCount)
	for ; chunkIter.HasNext(); {
		chunk := chunkIter.Next()
		Chunks[chunk.Index] = Chunk{
			Index: chunk.Index,
			Start: chunk.Start,
			End:   chunk.End,
		}
	}
	downloader.Chunks = Chunks

	return downloader
}
