package downloader

import (
	"bilibili/iterator"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

type Downloader struct {
	Url             string
	SavePath        string
	Api             HeadRange
	ChunkSize       int64
	Chunks          []Chunk
	paramChan       chan Param
	resultChan      chan Result
	resultErrorChan chan ResultError
}

func (downloader *Downloader) RunConsumer(nums int) {
	for i := 0; i < nums; i++ {
		go func() {
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
				resp, err = downloader.Api.Range(downloader.Url, param.Start, param.End)
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
		}()
	}
}

func (downloader *Downloader) RunProducer() {
	go func() {
		for i := 0; i < len(downloader.Chunks); i++ {
			chunk := downloader.Chunks[i]
			downloader.paramChan <- Param{
				Start:   chunk.Start,
				End:     chunk.End,
				TryTime: 3,
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
			fmt.Printf("%+v\n", request.Param)
			successCount++
			if successCount == total {
				err = nil
				goto finished
			}
		case resultError := <-downloader.resultErrorChan:
			if resultError.Param.TryTime > 0 {
				go func() {
					downloader.paramChan <- Param{
						Start:   resultError.Param.Start,
						End:     resultError.Param.End,
						TryTime: resultError.Param.TryTime - 1,
					}
				}()
				continue
			}
			err = resultError.Err
			goto finished
		}
	}

finished:

	if file != nil {
		file.Close()
	}
	if err != nil {
		fmt.Printf("%s\n", err)
		return err
	}
	return nil
}

func New(url string, savePath string, headRange HeadRange, chunkSize int64) (downloader *Downloader) {
	downloader = &Downloader{
		paramChan:       make(chan Param, 10),
		resultChan:      make(chan Result, 5),
		resultErrorChan: make(chan ResultError, 5),
	}

	downloader.Url = url
	downloader.SavePath = savePath
	downloader.Api = headRange
	downloader.ChunkSize = chunkSize

	contentLength, err := headRange.Head(url)
	if err != nil {
		fmt.Println("%s", err)
		return nil
	}
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
