use hyper::header::USER_AGENT;
use reqwest::Client;
use scraper::Html;
use tracing::debug;

use super::{Hack, HackDetails};

pub struct ApiController {
    client: Client,
}

impl ApiController {
    const BASE_URL: &str = "https://www.smwcentral.net/";

    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    async fn request(&self, req: ApiRequest) -> Result<String, reqwest::Error> {
        let query = req.query();
        debug!("{:?}", query);
        let text = self
            .client
            .get(Self::BASE_URL)
            .query(&query)
            .header(USER_AGENT, "buibui/0.1")
            .send()
            .await?
            .text()
            .await?;

        Ok(text.replace("\t", "").replace("\n", ""))
    }

    pub async fn get_hack_list(&self, page: u64) -> Result<Vec<Hack>, String> {
        debug!("List View Req");
        let list_view = self
            .request(ApiRequest::HackList {
                page,
                gallery: false,
            })
            .await
            .map_err(|err| err.to_string())?;

        debug!("Gallery View Req");
        let gallery_view = self
            .request(ApiRequest::HackList {
                page,
                gallery: true,
            })
            .await
            .map_err(|err| err.to_string())?;

        let list_view = Html::parse_document(&list_view);
        let gallery_view = Html::parse_document(&gallery_view);

        Ok(Hack::from_scraped_hack_lists(list_view, gallery_view))
    }

    pub async fn get_hack_details(&self, id: u64) -> Result<HackDetails, String> {
        debug!("Details Req");

        let details = self
            .request(ApiRequest::HackDetails { id })
            .await
            .map_err(|err| err.to_string())?;

        debug!("Images Req");
        let images = self
            .request(ApiRequest::HackImages { id })
            .await
            .map_err(|err| err.to_string())?;

        Ok(HackDetails::parse_html(
            Html::parse_document(&details),
            Html::parse_document(&images),
        ))
    }
}

pub enum ApiRequest {
    HackList { page: u64, gallery: bool },
    HackDetails { id: u64 },
    HackImages { id: u64 },
}

impl ApiRequest {
    fn a_query(&self) -> String {
        match self {
            ApiRequest::HackList {
                page: _,
                gallery: _,
            } => "list",
            ApiRequest::HackDetails { id: _ } => "details",
            ApiRequest::HackImages { id: _ } => "images",
        }
        .to_string()
    }

    fn id_query(&self) -> Option<String> {
        match self {
            ApiRequest::HackList {
                page: _,
                gallery: _,
            } => None,
            ApiRequest::HackDetails { id } => Some(format!("{}", id)),
            ApiRequest::HackImages { id } => Some(format!("{}", id)),
        }
    }

    fn s_query(&self) -> Option<String> {
        match self {
            ApiRequest::HackList {
                page: _,
                gallery: _,
            } => Some("smwhacks".to_string()),
            _ => None,
        }
    }

    fn g_query(&self) -> Option<String> {
        match self {
            ApiRequest::HackList { page: _, gallery } => {
                if *gallery {
                    Some("1".to_string())
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    fn n_query(&self) -> Option<String> {
        match self {
            ApiRequest::HackList { page, gallery: _ } => Some(format!("{}", page)),
            _ => None,
        }
    }

    pub fn query(self) -> Vec<(String, String)> {
        let mut list = vec![
            ("p".to_string(), "section".to_string()),
            ("a".to_string(), self.a_query()),
        ];

        if let Some(id) = self.id_query() {
            list.push(("id".to_string(), id));
        }

        if let Some(s) = self.s_query() {
            list.push(("s".to_string(), s));
        }

        if let Some(g) = self.g_query() {
            list.push(("g".to_string(), g));
            list.push(("u".to_string(), "0".to_string()));
        }

        if let Some(n) = self.n_query() {
            list.push(("n".to_string(), n));
        }

        list
    }
}
