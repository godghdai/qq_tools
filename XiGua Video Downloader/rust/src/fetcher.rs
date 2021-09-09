use hyper::{Client, Request, Body,Method};
use hyper_tls::HttpsConnector;
use hyper::client::HttpConnector;
use failure::{Error, err_msg};
use bytes::Bytes;

pub struct Fetcher {
    client: Client<HttpsConnector<HttpConnector>>,
}

impl Fetcher {
    pub fn new() -> Fetcher {
        let client =
            Client::builder().build::<_, hyper::Body>(HttpsConnector::new());
        Fetcher {
            client,
        }
    }
    fn create_request(method: Method,url:String) -> Request<Body> {
        return Request::builder()
            .method(method)
            .uri(url)
            .header("user-agent", " Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36")
            .body(Body::empty()).unwrap();
    }
}

impl Fetcher {
    pub async fn head(&self, url: String) -> Result<usize, Error> {
        let req = Self::create_request(Method::HEAD,url);
        let response = (&self.client).request(req).await?;
        let headers = response.headers();
        /* for (key, value) in headers.iter() {
             println!("{}={}", key, value.to_str().unwrap());
         }*/
        if headers.contains_key("content-length") {
            let length = headers.get("content-length").unwrap().to_str().unwrap();
            let total = length.parse::<usize>().unwrap();
            return Ok(total);
        }
        Err(err_msg("content-length not find"))
    }

    pub async fn range(&self, url: &String, start: usize, end: usize) -> Result<Bytes, Error> {
        let req =  Self::create_request(Method::GET,format!("{}&range={}-{}", url, start, end));
        let response = (&self.client).request(req).await?;
        let body = hyper::body::to_bytes(response.into_body()).await?;
        Ok(body)
    }

    #[allow(dead_code)]
    pub async fn get(&self, url: String) -> Result<(), Error> {
        let req = Self::create_request(Method::GET,url);
        let response = (&self.client).request(req).await?;
        let body = hyper::body::to_bytes(response.into_body()).await?;
        println!("{:#?}", body);
        Ok(())
    }
}