package mediainfo

import (
	"bilibili/api"
	"bilibili/iterator"
	"bilibili/util"
	"fmt"
	"io"
	"os"
	"sync"
)

type VideoChunk struct {
	Index  int64
	Start  int64
	End    int64
	IsDown bool
}

type Video struct {
	Url            string
	Chunks         []VideoChunk
	ChunksLen      int64
	Length         int64
	DownloadLength int64
}

type MediaInfo struct {
	Name      string
	AudioName string
	VideoName string
	Cid       int
	Video     Video
	AudioUrl  string
	Mutex     *sync.RWMutex
	Wg        *sync.WaitGroup
	Errors    []error
	Api       *api.Api
}

func (mediaInfo *MediaInfo) writeError(err error) {
	mediaInfo.Mutex.Lock()
	mediaInfo.Errors = append(mediaInfo.Errors, err)
	mediaInfo.Mutex.Unlock()
}

func (mediaInfo *MediaInfo) writeVideoFile(file *os.File, bytes []byte, start int64) {
	mediaInfo.Mutex.Lock()
	_, err := file.WriteAt(bytes, start)
	if err != nil {
		mediaInfo.Errors = append(mediaInfo.Errors, err)
	}
	mediaInfo.Mutex.Unlock()
}

func (mediaInfo *MediaInfo) updateVideoProgress(readLen int64) {
	mediaInfo.Mutex.Lock()
	mediaInfo.Video.DownloadLength += readLen
	fmt.Printf("[%s] %.2f %% \n", mediaInfo.VideoName, float64(mediaInfo.Video.DownloadLength)/float64(mediaInfo.Video.Length)*100)
	mediaInfo.Mutex.Unlock()
}

func (mediaInfo *MediaInfo) appendByte(slice []byte, data []byte) []byte {
	m := len(slice)
	n := m + len(data)
	if n > cap(slice) { // if necessary, reallocate
		// allocate double what's needed, for future growth.
		newSlice := make([]byte, (n+1)*2)
		copy(newSlice, slice)
		slice = newSlice
	}
	slice = slice[0:n]
	copy(slice[m:n], data)
	return slice
}

func (mediaInfo *MediaInfo) downloadVideo() {
	var videoFile *os.File
	var err error
	videoFile, err = os.OpenFile(mediaInfo.VideoName, os.O_RDWR|os.O_CREATE, os.ModePerm)
	if err != nil {
		mediaInfo.writeError(err)
		return
	}
	mediaInfo.Wg.Add(len(mediaInfo.Video.Chunks))
	for _, videoChunk := range mediaInfo.Video.Chunks {

		go func(videoChunk VideoChunk) {
			var (
				err       error
				buf       = make([]byte, 1024*1024)
				dataBytes []byte
				readLen   int = 0
			)

			resp, err := mediaInfo.Api.Range(mediaInfo.Video.Url, videoChunk.Start, videoChunk.End)
			if err != nil {
				goto finish
			}

			for {
				readLen, err = resp.Body.Read(buf)
				if readLen < 0 {
					err = fmt.Errorf("%s", "bytes.Buffer: reader returned negative count from Read")
					goto finish
				}

				dataBytes = mediaInfo.appendByte(dataBytes, buf[:readLen])
				mediaInfo.updateVideoProgress(int64(readLen))
				if err == io.EOF {
					err = nil
					break
				}
				if err != nil {
					goto finish
				}
			}
			err = resp.Body.Close()
			if err == nil {
				mediaInfo.writeVideoFile(videoFile, dataBytes, videoChunk.Start)
			}

		finish:
			if err != nil {
				mediaInfo.writeError(err)
			}
			mediaInfo.Wg.Done()

		}(videoChunk)

	}
	mediaInfo.Wg.Wait()
	err = videoFile.Close()
	if err != nil {
		mediaInfo.writeError(err)
	}
}

func (mediaInfo *MediaInfo) downloadAudio() {
	mediaInfo.Wg.Add(1)
	go func() {
		err := mediaInfo.Api.Download(mediaInfo.AudioUrl, mediaInfo.AudioName)
		if err != nil {
			fmt.Printf("%s\n", err)
			mediaInfo.writeError(err)
		}
		mediaInfo.Wg.Done()
	}()
	mediaInfo.Wg.Wait()
}

func (mediaInfo *MediaInfo) Download() {

	fmt.Printf("%+v\n", mediaInfo)

	fmt.Printf("%s 正在下载视频\n", mediaInfo.VideoName)
	mediaInfo.downloadVideo()
	fmt.Printf("%s 视频下载完成\n", mediaInfo.VideoName)

	fmt.Printf("%s 正在下载音频\n", mediaInfo.AudioName)
	mediaInfo.downloadAudio()
	fmt.Printf("%s 音频下载完成\n", mediaInfo.AudioName)

	if len(mediaInfo.Errors) == 0 {
		name := fmt.Sprintf("%s.mp4", mediaInfo.Name)
		err := util.Merge(mediaInfo.AudioName, mediaInfo.VideoName, name)
		if err != nil {
			fmt.Printf("%s 合并失败\n", name)
			fmt.Printf("%s\n", err)
		} else {
			fmt.Printf("%s 合并完成\n", name)
		}
	} else {
		fmt.Printf("%s 下载失败\n", mediaInfo.Name)
		fmt.Printf("%+v\n", mediaInfo.Errors)
	}
}

func GetMediaInfo(api *api.Api, bvid string, name string, cid int) (mediaInfo *MediaInfo, err error) {
	mediaInfo = &MediaInfo{}
	mediaInfo.Mutex = new(sync.RWMutex)
	mediaInfo.Api = api
	mediaInfo.Wg = &sync.WaitGroup{}
	//mediaInfo.Errors = []error{}
	mediaInfo.Name = name
	mediaInfo.AudioName = fmt.Sprintf("%s_audio.m4s", name)
	mediaInfo.VideoName = fmt.Sprintf("%s_video.m4s", name)
	mediaInfo.Cid = cid

	jsonData, err := api.GetPlayUrl(cid, 64, bvid)
	if err != nil {
		return nil, err
	}
	dash := jsonData.Data.Dash

	video := mediaInfo.Video
	video.DownloadLength = 0
	video.Url = dash.Video[0].BaseUrl
	mediaInfo.AudioUrl = dash.Audio[0].BaseUrl

	contentLength, err := api.Head(video.Url)
	if err != nil {
		return nil, err
	}

	chunkIter := iterator.New(contentLength, 1024*1024*16)
	video.ChunksLen = chunkIter.ChunkCount
	video.Length = contentLength
	video.Chunks = make([]VideoChunk, chunkIter.ChunkCount)

	for ; chunkIter.HasNext(); {
		chunk := chunkIter.Next()
		video.Chunks[chunk.Index] = VideoChunk{
			Index:  chunk.Index,
			Start:  chunk.Start,
			End:    chunk.End,
			IsDown: false,
		}
	}
	mediaInfo.Video = video
	return mediaInfo, nil
}
