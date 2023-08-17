use hyper::header::USER_AGENT;
use reqwest::Client;

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

    pub async fn request(&self, req: ApiRequest) -> Result<String, reqwest::Error> {
        let text = self
            .client
            .get(Self::BASE_URL)
            .query(&req.query())
            .header(USER_AGENT, "buibui/0.1")
            .send()
            .await?
            .text()
            .await?;

        Ok(text.replace("\t", "").replace("\n", ""))
    }
}

pub enum ApiRequest {
    HackList { page: u64, gallery: bool },
    HackDetails { id: u64 },
}

impl ApiRequest {
    fn a_query(&self) -> String {
        match self {
            ApiRequest::HackList { page, gallery } => "list",
            ApiRequest::HackDetails { id } => "details",
        }
        .to_string()
    }

    fn id_query(&self) -> Option<String> {
        match self {
            ApiRequest::HackList { page, gallery } => None,
            ApiRequest::HackDetails { id } => Some(format!("{}", id)),
        }
    }

    fn s_query(&self) -> Option<String> {
        match self {
            ApiRequest::HackList { page, gallery } => Some("smwhacks".to_string()),
            ApiRequest::HackDetails { id } => None,
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

        list
    }
}
