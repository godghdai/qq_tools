package mediainfo

import (
	"bilibili/api"
	"bilibili/iterator"
	"bilibili/util"
	"fmt"
	"github.com/gorilla/websocket"
	"io"
	"os"
	"sync"
)

type VideoChunk struct {
	Index          int64
	Start          int64
	End            int64
	Length         int64
	DownloadLength int64
	IsDown         bool
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
	IsFlv     bool
	Conn      *websocket.Conn
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

type WsChunk struct {
	I int64 `json:"i"`
	P string `json:"p"`
}

type WsChunks struct {
	Mtype string    `json:"mtype"`
	Cid   int       `json:"cid"`
	Value []WsChunk `json:"value"`
}

func (mediaInfo *MediaInfo) noticeClientUpdateProgress() {

	mediaInfo.Mutex.Lock()
	chunks := WsChunks{
		Mtype: "chunks",
		Cid:   0,
		Value: nil,
	}
	chunks.Value = make([]WsChunk, len(mediaInfo.Video.Chunks))
	chunks.Cid=mediaInfo.Cid
	for index, videoChunk := range mediaInfo.Video.Chunks {
		chunks.Value[index]= WsChunk{
			I: videoChunk.Index,
			P:fmt.Sprintf(" %.0f",  float64(videoChunk.DownloadLength)/float64(videoChunk.Length)*100),
		}
	}
	//fmt.Sprintf(`{ "mtype":"chunks","cid":%d,"value":[{"i":0,"p":%d},{"i":1,"p":%d},{"i":2,"p":%d}]}`, mediaInfo.Cid., num, num+25, num+35)
	err := mediaInfo.Conn.WriteJSON(chunks)
	if err != nil {
		fmt.Println("write:", err)
	}
	mediaInfo.Mutex.Unlock()
}

func (mediaInfo *MediaInfo) noticeClientDownloadFinished() {
	err := mediaInfo.Conn.WriteMessage(websocket.TextMessage,([]byte)(fmt.Sprintf(`{ "mtype":"downloadFinished","cid":%d}`, mediaInfo.Cid)))
	if err != nil {
		fmt.Println("write:", err)
	}
}

func (mediaInfo *MediaInfo) updateVideoProgress(readLen int64) {
	mediaInfo.Mutex.Lock()
	mediaInfo.Video.DownloadLength += readLen

	fmt.Printf("[%s] %.2f %% \r", mediaInfo.VideoName, float64(mediaInfo.Video.DownloadLength)/float64(mediaInfo.Video.Length)*100)
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
	for index, _ := range mediaInfo.Video.Chunks {

		go func(index int ) {

			var (
				err       error
				buf       = make([]byte, 1024*1024*5)
				dataBytes []byte
				readLen   = 0
			)
			videoChunk := mediaInfo.Video.Chunks[index]
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
				videoChunk.DownloadLength  +=int64(readLen)
				mediaInfo.Video.Chunks[index]=videoChunk
				mediaInfo.updateVideoProgress(int64(readLen))
				//通知 client 更新文件下载进度条
				if mediaInfo.Conn!=nil{
					mediaInfo.noticeClientUpdateProgress()
				}
				//fmt.Printf("%d----",videoChunk.DownloadLength)
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

		}(index)

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
	var err error

	//fmt.Printf("%+v\n", mediaInfo)

	fmt.Printf("%s 正在下载视频\n", mediaInfo.VideoName)
	mediaInfo.downloadVideo()
	fmt.Printf("%s 视频下载完成\n", mediaInfo.VideoName)

	if !mediaInfo.IsFlv {
		fmt.Printf("%s 正在下载音频\n", mediaInfo.AudioName)
		mediaInfo.downloadAudio()
		fmt.Printf("%s 音频下载完成\n", mediaInfo.AudioName)
	}

	if len(mediaInfo.Errors) == 0 {

		//通知 client 文件下载完成
		if mediaInfo.Conn!=nil{
			mediaInfo.noticeClientDownloadFinished()
		}

		name := fmt.Sprintf("%s.mp4", mediaInfo.Name)
		// flv or m4s
		if mediaInfo.IsFlv {
			err = util.ToMp4(mediaInfo.VideoName, name)
			if err != nil {
				fmt.Printf("%s 转换失败\n", name)
				fmt.Printf("%s\n", err)
			} else {
				fmt.Printf("%s 转换完成\n", name)
			}

		} else {
			err = util.Merge(mediaInfo.AudioName, mediaInfo.VideoName, name)
			if err != nil {
				fmt.Printf("%s 合并失败\n", name)
				fmt.Printf("%s\n", err)
			} else {
				fmt.Printf("%s 合并完成\n", name)
			}
		}

	} else {
		fmt.Printf("%s 下载失败\n", mediaInfo.Name)
		fmt.Printf("%+v\n", mediaInfo.Errors)
	}
}

func GetMediaInfo( conn *websocket.Conn,api *api.Api, bvid string, name string, cid int) (mediaInfo *MediaInfo, err error) {
	mediaInfo = &MediaInfo{}
	mediaInfo.Mutex = new(sync.RWMutex)
	mediaInfo.Api = api
	mediaInfo.Wg = &sync.WaitGroup{}
	//mediaInfo.Errors = []error{}
	mediaInfo.Name = name
	mediaInfo.Cid = cid
	mediaInfo.Conn=  conn

	jsonData, err := api.GetPlayUrl(cid, 64, bvid)
	if err != nil {
		return nil, err
	}
	dash := jsonData.Data.Dash

	video := mediaInfo.Video
	video.DownloadLength = 0

	if dash.Video != nil {
		mediaInfo.IsFlv = false
		video.Url = dash.Video[0].BaseUrl
		mediaInfo.AudioUrl = dash.Audio[0].BaseUrl

		mediaInfo.AudioName = fmt.Sprintf("%s_audio.m4s", name)
		mediaInfo.VideoName = fmt.Sprintf("%s_video.m4s", name)

	} else {
		mediaInfo.IsFlv = true
		durl := jsonData.Data.Durl
		video.Url = durl[0].Url
		mediaInfo.VideoName = fmt.Sprintf("%s.flv", name)
		//Backup_url
	}
	contentLength, err := api.Head(video.Url)
	if err != nil {
		return nil, err
	}
	chunkIter := iterator.New(contentLength, 1024*1024*5)
	video.ChunksLen = chunkIter.ChunkCount
	video.Length = contentLength
	video.Chunks = make([]VideoChunk, chunkIter.ChunkCount)

	for ; chunkIter.HasNext(); {
		chunk := chunkIter.Next()
		video.Chunks[chunk.Index] = VideoChunk{
			Index:          chunk.Index,
			Start:          chunk.Start,
			End:            chunk.End,
			Length:         chunk.End - chunk.Start + 1,
			DownloadLength: 0,
			IsDown:         false,
		}
	}
	mediaInfo.Video = video
	return mediaInfo, nil
}
