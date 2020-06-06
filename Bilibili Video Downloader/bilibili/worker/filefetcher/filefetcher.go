package filefetcher

import (
	"bilibili/api"
	"io/ioutil"
	"net/http"
)

type Param struct {
	Url   string
	Start int64
	End   int64
}

type Result struct {
	Url   string
	Start int64
	End   int64
	Bytes []byte
	Err   error
}

func Create(api *api.Api,paramChan chan Param, resultChan chan Result)  {
	go func() {
		var (
			err   error
			bytes []byte
			resp  *http.Response
		)
		for {
			param := <-paramChan
			resp, err = api.Range(param.Url, param.Start, param.End)
			if err != nil {
				goto writeErr
			}

			bytes, err = ioutil.ReadAll(resp.Body)
			if err != nil {
				goto writeErr
			}

			resultChan <- Result{
				Url:   param.Url,
				Start: param.Start,
				End:   param.End,
				Bytes: bytes,
				Err:   nil,
			}
			continue

		writeErr:
			resultChan <- Result{
				Url:   param.Url,
				Start: param.Start,
				End:   param.End,
				Err:   err,
			}
		}
	}()
}
