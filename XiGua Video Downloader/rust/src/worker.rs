use std::sync::Arc;

use bytes::Bytes;
use failure::{Error, err_msg};
use tokio::sync::{Mutex, mpsc::{ Sender}};

use crate::queue::Queue;
use crate::fetcher::Fetcher;

pub type MyMutex = Arc<Mutex<Queue<Job>>>;

#[derive(Debug)]
pub struct Job {
    pub(crate) id: usize,
    pub(crate) start: usize,
    pub(crate) end: usize,
    pub(crate) url: String,
}

pub struct JobResult {
    pub job: Job,
    pub bytes: Bytes,
}

pub struct Worker {
    name: String,
    mtx: MyMutex,
    sender: Sender<JobResult>,
    fetcher: Fetcher,
}

impl Worker {
    pub(crate) fn new(name: String, mtx: MyMutex, sender: Sender<JobResult>) -> Worker {
        let fetcher = Fetcher::new();
        Worker {
            name,
            mtx,
            sender,
            fetcher,
        }
    }
    async fn do_job(&self, job: Job) -> Result<(), Error> {
        let bytes = self.fetcher.range(&job.url, job.start, job.end).await?;
        if let Err(err) = self.sender.send(
            JobResult { job, bytes }).await {
            return Err(err_msg(err.to_string()));
        }
        Ok(())
    }

    pub async fn start(&self) {
        let mut job: Job;
        loop {
            {   //提前释放锁
                let jobs = &mut *self.mtx.lock().await;
                if !jobs.empty() {
                    job = jobs.pop();
                    println!("worker {} do job {}", self.name, job.id);
                } else {
                    break;
                }
            }
            let res = self.do_job(job).await;
            if let Err(err) = res {
                println!("{}_err:{}", "下载出错了。。。", err);
                break;
            }
        }
    }
}