#[derive(Debug)]
pub struct Queue<T> {
    pub data: Vec<T>,
}

impl<T> Queue<T> {
    pub fn new() -> Self {
        Queue {
            data: Vec::new(),
        }
    }
    pub fn push(&mut self, item: T) {
        self.data.push(item);
    }
    pub fn pop(&mut self) -> T {
        self.data.remove(0)
    }
    pub fn empty(&self) -> bool {
        self.data.len() == 0
    }

}
