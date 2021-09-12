use std::sync::Arc;

use futures::future::{join_all};
use failure::{Error};
use tokio::sync::{Mutex, mpsc::{self,  Receiver}};
use tokio::fs::{OpenOptions, File};
use tokio::io::{AsyncSeekExt, AsyncWriteExt, SeekFrom};

use crate::queue::Queue;
use crate::fetcher::Fetcher;
use crate::util::{FileSplitter};
use crate::worker::{Worker, Job, JobResult, MyMutex};


async fn init_jobs<'a>(url: &String, total: usize, mutex: MyMutex) {
    let queue = &mut *mutex.lock().await;
    let splitter = FileSplitter::new(total, 1024 * 1024 * 4);
    for chunk in splitter {
        queue.push(Job {
            id: chunk.index,
            start: chunk.start,
            end: chunk.end,
            url: url.clone(),
        });
    }
}

pub async fn download(url: &String, count: i32, filepath: &String) -> Result<(), Error> {
    let mutex = Arc::new(Mutex::new(Queue::<Job>::new()));
    let fetcher = Fetcher::new();
    let total = fetcher.head(url.parse()?).await?;
    init_jobs(url, total, mutex.clone()).await;
    let (tx, mut rx) = mpsc::channel::<JobResult>(32);
    let mut workers = vec![];

    for num in 1..=count {
        let worker = Worker::new(num.to_string(), mutex.clone(), tx.clone());
        workers.push(worker);
    }

    let mut file = create_file(filepath, total as u64).await?;
    let _handler = tokio::spawn(async move {
        if let Err(err) = write_to_file(&mut file, &mut rx).await {
            println!("{}", err);
        }
    });

    let mut workers_futures = vec![];
    for worker in &workers {
        workers_futures.push(worker.start());
    }
    join_all(workers_futures).await;
    Ok(())
}

async fn create_file(filepath: &String, total: u64) -> Result<File, Error> {
    let file = OpenOptions::new()
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