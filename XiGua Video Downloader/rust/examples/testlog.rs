#[macro_use]
extern crate log;

use log::{LevelFilter, Record, Level, Metadata,};
struct MyLogger;

impl log::Log for MyLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        true
    }

    fn log(&self, record: &Record) {
        /// 输出到控制台，也可以到文件
        println!("{}:{} - {}", record.level(),record.target(),record.args());
    }
    fn flush(&self) {}
}
/*
Log是Rust的轻量级日志接口。它抽象了日志实现，很好的兼容不同日志库。有大量日志库基于它实现的，最常用env_looger，log4rs等。
虽然Log只是抽象接口，但它提供了5个宏控制输出，分别是： error! > warn! > info! > debug! > trace!。error!的优先级最高，trace!优先级最低。
*/
fn main() {
    log::set_boxed_logger(Box::new(MyLogger {})).unwrap();
   //log::set_logger(&MY_LOGGER).unwrap();
    log::set_max_level(LevelFilter::Trace);
    error!(target:"main", "this is a error");
    warn!(target:"main", "this is a warning");
    info!("this is a information");
    debug!("this is a debug");
    trace!("this is a trace");

}