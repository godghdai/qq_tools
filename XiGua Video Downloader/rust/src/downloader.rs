use std::sync::Arc;

use bytes::Bytes;
use futures::{join};
use failure::{Error};
use tokio::sync::{Mutex, mpsc::{self, Sender,Receiver}};
use tokio::fs::{OpenOptions, File};
use tokio::io::{AsyncSeekExt, AsyncWriteExt, SeekFrom,};
//use pbr::ProgressBar;

use crate::queue::Queue;
use crate::fetcher::Fetcher;
use crate::util::{FileSplitter};
use std::future::Future;


type MyMutex = Arc<Mutex<Queue<Job>>>;

#[derive(Debug)]
pub struct Job {
    id: usize,
    start: usize,
    end: usize,
    url: String,
}

impl Default for Job {
    fn default() -> Self {
        Job {
            id: 0,
            start: 0,
            end: 0,
            url: "".to_string(),
        }
    }
}

struct JobResult {
    pub job: Job,
    pub bytes: Bytes,
}

struct Worker {
    name: String,
    mtx: MyMutex,
    sender: Sender<JobResult>,
    fetcher: Fetcher,
}

impl Worker {
    fn new(name: String, mtx: MyMutex, sender: Sender<JobResult>) -> Worker {
        Worker {
            name,
            mtx,
            sender,
            fetcher: Fetcher::new(),
        }
    }
    #[allow(unused_assignments)]
    pub async fn start(&self) {
        let mut is_has;
        loop {
            let job;
            is_has = false;
            {   //提前释放锁
                let jobs = &mut *self.mtx.lock().await;
                if !jobs.empty() {
                    job = jobs.pop();
                    is_has = true;
                    println!("worker {} do job {}", self.name, job.id);
                } else {
                    break;
                }
            }
            if is_has && job.url != "" {
                let bytes = self.fetcher.range(&job.url, job.start, job.end).await.unwrap();
                //println!("{}", bytes.len());
                match self.sender.send(JobResult {
                    job: Job {
                        url: job.url.clone(),
                        ..job
                    },
                    bytes,
                }).await {
                    Ok(_) => {}
                    Err(_) => {}
                }
            }
        }
    }
}


pub async fn download(url: &String, filepath: &String) -> Result<(), Error> {
    let mut queue = Queue::<Job>::new();
    let fetcher = Fetcher::new();
    let total = fetcher.head(url.parse()?).await?;
    let splitter = FileSplitter::new(total, 1024 * 1024 * 4);

    for chunk in splitter {
        queue.push(Job {
            id: chunk.index,
            start: chunk.start,
            end: chunk.end,
            url: url.clone(),
        });
    }
    let (tx, mut rx) = mpsc::channel::<JobResult>(32);
    let mutex = Arc::new(Mutex::new(queue));
    let w = Worker::new("1".to_string(), mutex.clone(), tx.clone());
    let w2 = Worker::new("2".to_string(), mutex.clone(), tx.clone());
    let w3 = Worker::new("3".to_string(), mutex.clone(), tx.clone());

    let mut file = create_file(filepath, total as u64).await?;
    tokio::spawn(async move {
        if let Err(err) = write_to_file(&mut file, &mut rx).await {
            println!("{}", err);
        }
    });

    join!(w.start(),w2.start(),w3.start());
    Ok(())
}

async fn create_file(filepath: &String,total:u64) -> Result<File, Error> {
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(filepath).await?;

    file.set_len(total).await?;
    Ok(file)
}

async fn write_to_file(file: &mut File, rx: &mut Receiver<JobResult>) -> Result<(), Error> {
    while let Some(job_result) = rx.recv().await {
        let Job { start, end, .. } = job_result.job;
        //println!("download {:#?}", job_result.job);
        println!("download range [{},{}]", start, end);
        file.seek(SeekFrom::Start(start as u64)).await?;
        file.write_all(job_result.bytes.iter().as_ref()).await?;
    }
    Ok(())
}