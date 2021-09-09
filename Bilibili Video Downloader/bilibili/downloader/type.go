package downloader

import "net/http"

type Chunk struct {
	Index int64
	Start int64
	End   int64
}

type Param struct {
	Start   int64
	End     int64
	TryTime int
}

type Result struct {
	Param Param
	Bytes *[]byte
}

type ResultError struct {
	Param Param
	Err   error
}

type ProgressFunc func(completedSize int64,totalSize int64,downloader *Downloader)

type HeadRange interface {
	Head(url string) (length int64, err error)
	Range(url string, start int64, end int64) (resp *http.Response, err error)
}
