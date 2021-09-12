use futures::{self, executor, StreamExt};
use futures::stream::FuturesOrdered;
use std::mem;
use std::pin::Pin;
use std::fmt::Display;
use std::ops::Add;

async fn learn_song() {
    println!("Learn song!");
}

async fn sing_song() {
    println!("Sing song!");
}

async fn dance() {
    println!("Dance!");
}

async fn learn_and_sing_song() {
    learn_song().await;
    sing_song().await;
}

async fn async_main() {
    let f1 = learn_song();
    let f2 = dance();
    let aaa = futures::future::ready(555);
    let r = aaa.await;
    println!("{}", r);
    futures::join!(f1, f2);

    use futures::future::join_all;

    async fn foo(i: u32) -> u32 { i }

    let futures = vec![learn_song(), learn_song()];
    join_all(futures);
    //assert_eq!(join_all(futures).await, [1, 2, 3]);


    let mut str = "yzd".to_string();
    let mut str2 = "hello".to_string();
    let mut pinned_string = Pin::new(&mut str2);
    mem::swap(&mut str, &mut *pinned_string);
    println!("{}", pinned_string);
}



fn main() {
    use std::collections::HashMap;
    let mut map = HashMap::<String,Box::<Fn>>::new();
    // executor::block_on(async_main());
}
