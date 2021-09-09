use core::fmt;

pub struct Chunk {
    pub index: usize,
    pub start: usize,
    pub end: usize,
}

impl fmt::Display for Chunk {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}_[{}:{}]", self.index, self.start, self.end)
    }
}

pub struct FileSplitter {
    total: usize,
    blksize: usize,
    blocks: usize,
    index: usize,
}

impl FileSplitter {
    pub fn new(total: usize, blksize: usize) -> FileSplitter {
        let mut blocks = total / blksize;
        blocks = if total % blksize > 0 { blocks + 1 } else { blocks };
        FileSplitter { total, blksize, blocks, index: 0 }
    }
    pub fn len(&self)->usize{
        self.blocks
    }
}

impl Iterator for FileSplitter {
    type Item = Chunk;

    fn next(&mut self) -> Option<Self::Item> {
        if self.index > self.blocks - 1 {
            return None;
        }
        let Self { blksize, blocks, .. } = &self;
        let start = self.index * blksize;
        let end =
            if self.index == blocks - 1 {
                self.total - 1
            } else {
                self.index * blksize + blksize - 1
            };
        let res = Some(Chunk {
            index: self.index,
            start,
            end,
        });
        self.index += 1;
        res
    }
}

