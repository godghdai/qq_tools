package iterator

type Chunk struct {
	Index     int64
	Start     int64
	End       int64
}

type ChunkIterator struct {
	Total      int64
	ChunkSize  int64
	ChunkCount int64
	Index      int64
}

func (iter *ChunkIterator) HasNext() bool {
	return iter.Index < iter.ChunkCount
}

func (iter *ChunkIterator) Get(index int64) (chunk Chunk) {
	start := index* iter.ChunkSize
	end := start + iter.ChunkSize - 1
	if end > iter.Total-1 {
		end = iter.Total - 1
	}
	chunk = Chunk{
		index,
		start,
		end,
	}
	return chunk
}

func (iter *ChunkIterator) Next() (chunk Chunk) {
	chunk = iter.Get(iter.Index)
	iter.Index++
	return chunk
}

func New(totalSize int64,chunkSize int64) *ChunkIterator {
	var  chunkCount int64
	chunkCount = totalSize / chunkSize
	if totalSize%chunkSize > 0 {
		chunkCount++
	}

	return &ChunkIterator{
		Total:      totalSize,
		ChunkSize:  chunkSize,
		ChunkCount: chunkCount,
		Index:      0,
	}
}
