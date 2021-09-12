use hyper::{Client, Request, Body, Method,StatusCode};
use hyper_tls::HttpsConnector;
use hyper::client::HttpConnector;
use failure::{Error, err_msg};
use bytes::Bytes;

static USER_AGENT: &str ="Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36";

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
    fn create_request(method: Method, url: String) -> hyper::http::Result<Request<Body>> {
        return Request::builder()
            .method(method)
            .uri(url)
            .header("user-agent", USER_AGENT)
            .body(Body::empty());
    }
}

impl Fetcher {
    pub async fn head(&self, url: String) -> Result<usize, Error> {
        let req = Self::create_request(
            Method::HEAD, url
        )?;
        let response = (&self.client).request(req).await?;
        if response.status()==StatusCode::OK{
            let headers = response.headers();
            if headers.contains_key("content-length") {
                let length = headers.get("content-length").unwrap().to_str().unwrap();
                let total = length.parse::<usize>().unwrap();
                return Ok(total);
            }
        }
        Err(err_msg("content-length not find"))
    }

    pub async fn range(&self, url: &String, start: usize, end: usize) -> Result<Bytes, Error> {
        let req = Self::create_request(
            Method::GET,
            format!("{}&range={}-{}", url, start, end)
        )?;
        let response = (&self.client).request(req).await?;
        if response.status()==StatusCode::PARTIAL_CONTENT {
            let body = hyper::body::to_bytes(response.into_body()).await?;
            return Ok(body);
        }
        Err(err_msg("get range error"))
    }
}