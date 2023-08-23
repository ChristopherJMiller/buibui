use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};

/// Additional Hack Information Obtained from the submissions details page.
#[derive(Debug, Serialize, Deserialize)]
pub struct HackDetails {
    /// Hack Description
    pub description: String,
    /// Hack Tags
    pub tags: Vec<String>,
    /// All Screenshots
    pub screenshot_urls: Vec<String>,
}

impl HackDetails {
    pub fn parse_html(details_html: Html, screenshot_html: Html) -> Self {
        let description = Selector::parse("table.list > tbody > tr > td").unwrap();
        let tags = Selector::parse("a.tag").unwrap();
        let screenshot_selected = Selector::parse("div.content > img").unwrap();

        let screenshot_urls = screenshot_html
            .select(&screenshot_selected)
            .map(|val| format!("https:{}", val.value().attr("src").unwrap()))
            .collect::<Vec<_>>();

        let mut details_iter = details_html.select(&description).into_iter();
        details_iter.find(|val| {
            val.first_child()
                .unwrap()
                .value()
                .as_text()
                .map(|val| val.to_string() == "Description:".to_string())
                .unwrap_or_default()
        });
        let details = details_iter.next().unwrap();
        let description = details
            .first_child()
            .unwrap()
            .value()
            .as_text()
            .unwrap()
            .to_string();

        let tags = details_html
            .select(&tags)
            .map(|element| element.inner_html())
            .collect::<Vec<_>>();

        Self {
            tags,
            description,
            screenshot_urls,
        }
    }
}
