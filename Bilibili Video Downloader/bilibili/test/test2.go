package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func test() {
	var (
		counter int64
		wg      sync.WaitGroup
	)
	wg.Add(2)
	go func() {
		//
		for i := 0; i < 200000; i++ {
			atomic.AddInt64(&counter, 1)
		}
		wg.Done()
	}()
	go func() {
		//atomic.AddInt64(&counter,-1)
		for i := 0; i < 200000; i++ {
			atomic.AddInt64(&counter, -1)
		}
		wg.Done()
	}()
	wg.Wait()
	fmt.Print(counter)
}