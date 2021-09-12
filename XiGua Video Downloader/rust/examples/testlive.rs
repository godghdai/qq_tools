use std::thread;
use std::time::Duration;
use xigua::util::FileSplitter;
use std::sync::{Arc, Mutex};
use xigua::queue::Queue;
use lazy_static::lazy_static;
use std::cell::RefCell;
use std::borrow::BorrowMut;

lazy_static! {
    static ref URL:String =String::from("http://www.baidu.com");
    static ref LIST:Mutex<Vec<String>>=Mutex::new(Vec::new());
}


#[derive(Debug)]
struct Job<'a> {
    url: &'a str,
    start: usize,
    end: usize,
}


#[derive(Debug)]
struct JobResult<'a> {
    job: &'a Job<'a>,
    bytes: usize,
}

fn get_result<'a>(job: &'a Job) -> JobResult<'a> {
    JobResult {
        job,
        bytes: job.start + job.end,
    }
}


fn main() {
    let splitter = FileSplitter::new(1024 * 1024 * 4 * 5, 1024 * 1024 * 4);
    let mut jobs = Vec::<Job>::new();
    let url = "http://www.baidu.com";
    for chunk in splitter {
        jobs.push(Job {
            url,
            start: chunk.start,
            end: chunk.end,
        });
    }
    let mutex = Arc::new(Mutex::new(Queue::<&Job>::new()));
    {
        let mut queue = &mut *mutex.lock().unwrap();
        for job in jobs.iter() {
            queue.push(job);
        }
    }
    let mtx2 = mutex.clone();
    {
        let mut queue = &mut *mtx2.lock().unwrap();
        for job in queue.iter() {
            println!("{:?}", job);
        }
    }
    //*URL = String::from("yzd");
    let mtx = mutex.clone();
    let sab = String::from("dsfdsfd");
    let ss = &sab;
    let mut aaaaaa = &(*LIST);
    {
        let li = &mut *aaaaaa.lock().unwrap();
        li.push("adfdff".to_string());
        li.push("adfdff2".to_string());
        li.push("adfdff3".to_string());
        li.push("adfdff4".to_string());
    }


    //URL=String::from("dfdfd");
    let handle = thread::spawn(move || {
        //  loop {
        //let jobs = &mut *mtx.lock().unwrap();
        //let job = jobs.pop();
        // println!("{:?}", job);
        //println!("{}", *URL);

        let mut aaaaaa = &(*LIST);

        let li = &*aaaaaa.lock().unwrap();
        for i in li{
            println!("{}",i);
        }

        //thread::sleep(Duration::from_secs(5));
    });

    //println!("Here's a vector: {:?}", &v);
    handle.join().unwrap();
}