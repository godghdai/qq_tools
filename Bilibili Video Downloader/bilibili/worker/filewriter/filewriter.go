package filewriter

import (
	"os"
)

type Param struct {
	Name  string
	Bytes []byte
	Start int64
}

type Result struct {
	Name  string
	Start int64
	Err   error
}

func Create() (paramChan chan Param, resultChan chan Result) {
	paramChan = make(chan Param, 5)
	resultChan = make(chan Result, 5)
	go func() {
		var (
			err  error
			file *os.File
		)
		for {
			param := <-paramChan
			file, err = os.OpenFile(param.Name, os.O_RDWR|os.O_CREATE, os.ModePerm)
			if err != nil {
				goto writeErr
			}

			_, err = file.WriteAt(param.Bytes, param.Start)
			if err != nil {
				goto writeErr
			}

			err = file.Close()
			if err != nil {
				goto writeErr
			}

			resultChan <- Result{
				Name:  param.Name,
				Start: param.Start,
				Err:   nil,
			}
			continue

		writeErr:
			resultChan <- Result{
				Name:  param.Name,
				Start: param.Start,
				Err:   err,
			}
		}

	}()
	return paramChan, resultChan
}
