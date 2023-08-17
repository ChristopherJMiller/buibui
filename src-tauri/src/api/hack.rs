use byte_unit::Byte;
use chrono::NaiveDateTime;
use scraper::{Html, Selector};
use tracing::info;

/// The type of Hack, with Other being used as a fallback in case new types are added on the fly.
#[derive(Debug)]
pub enum HackType {
    StandardEasy,
    StandardNormal,
    StandardHard,
    StandardVeryHard,
    KaizoBeginner,
    KaizoIntermediate,
    KaizoExpert,
    TASKaizo,
    TASPit,
    Troll,
    Other(String),
}

impl From<String> for HackType {
    fn from(value: String) -> Self {
        match value.as_str() {
            "Standard: Easy" => Self::StandardEasy,
            "Standard: Normal" => Self::StandardNormal,
            "Standard: Hard" => Self::StandardHard,
            "Standard: Very Hard" => Self::StandardVeryHard,
            "Kaizo: Beginner" => Self::KaizoBeginner,
            "Kaizo: Intermediate" => Self::KaizoIntermediate,
            "Kaizo: Expert" => Self::KaizoExpert,
            "Tool-Assisted: Kaizo" => Self::TASKaizo,
            "Tool-Assisted: Pit" => Self::TASPit,
            "Misc.: Troll" => Self::Troll,
            x => Self::Other(x.to_string()),
        }
    }
}

#[derive(Debug)]
/// Represents a ROM Hack.
pub struct Hack {
    /// Hack uid
    pub id: u64,
    /// Name of Hack
    pub name: String,
    /// Is this Hack flagged as a demo?
    pub demo: bool,
    /// Is this Hack moderated?
    pub moderated: bool,
    /// Datetime Added
    pub added: NaiveDateTime,
    /// Is this Hack flagged as featured?
    pub featured: bool,
    /// Number of Exists
    pub exit_length: u16,
    /// Hack Type
    pub hack_type: HackType,
    /// Hack Authors
    pub authors: Vec<String>,
    /// Rating, if exists. usually 0..5.
    pub rating: Option<f32>,
    /// Size of download
    pub size: Byte,
    /// Download URL
    pub download_url: String,
    /// URLs to the screenshot images/gifs.
    pub screenshot_urls: Vec<String>,
    /// Hack Tags. Requires loading the main hack page to view, so be Nothing.
    pub tags: Option<Vec<String>>,
}

impl Hack {
    pub fn from_scraped_hack_lists(list_view: Html) -> Vec<Self> {
        let list_selector = Selector::parse("div.content > table > tbody > tr").unwrap();

        list_view
            .select(&list_selector)
            .map(|tr| {
                let mut children = tr.children();

                let cell_one = children.next().unwrap();

                let id = cell_one
                    .first_child() // <a> tag
                    .unwrap()
                    .value()
                    .as_element()
                    .unwrap()
                    .attr("href") // href on <a> tag
                    .unwrap()
                    .split("&id=") // get id
                    .collect::<Vec<_>>()
                    .get(1) // it's in the second item
                    .unwrap()
                    .to_string();

                let id = id.parse::<u64>().unwrap();

                let name = cell_one
                    .first_child()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .to_string();

                let added = cell_one
                    .last_child()
                    .unwrap()
                    .last_child()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .to_string();
                let added = NaiveDateTime::parse_from_str(&added, "%Y-%m-%d %r").unwrap();

                let demo = children
                    .next()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .to_string();

                let demo = demo == "Yes".to_string();

                let featured = children
                    .next()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .to_string();

                let featured = featured == "Yes".to_string();

                let exit_length = children
                    .next()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .split(" exit(s)")
                    .collect::<Vec<_>>()
                    .first()
                    .unwrap()
                    .to_string();

                let exit_length = exit_length.parse::<u16>().unwrap();

                let hack_type = HackType::from(
                    children
                        .next()
                        .unwrap()
                        .first_child()
                        .unwrap()
                        .value()
                        .as_text()
                        .unwrap()
                        .to_string(),
                );

                let authors = children.next().unwrap();
                let author_root_list = if authors
                    .first_child()
                    .unwrap()
                    .value()
                    .as_element()
                    .and_then(|ele| ele.attr("small"))
                    == Some("small")
                {
                    authors.first_child().unwrap().first_child().unwrap()
                } else {
                    authors.first_child().unwrap()
                };

                let authors = author_root_list
                    .children()
                    .filter_map(|child| {
                        let text = {
                            let n_0_text = child.value().as_text();
                            let n_1_text = child
                                .first_child()
                                .and_then(|child| child.value().as_text());

                            if let Some(text) = n_0_text.or(n_1_text) {
                                text.to_string()
                            } else {
                                child
                                    .first_child()
                                    .unwrap()
                                    .first_child()
                                    .unwrap()
                                    .value()
                                    .as_text()
                                    .unwrap()
                                    .to_string()
                            }
                        };

                        let cleaned_up = text.replace(", ", "");

                        if cleaned_up.is_empty() {
                            None
                        } else {
                            Some(cleaned_up)
                        }
                    })
                    .collect::<Vec<_>>();

                let rating = children
                    .next()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .to_string();

                let rating: Option<f32> = rating.parse::<f32>().ok();

                let size = children
                    .next()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_text()
                    .unwrap()
                    .to_string()
                    .replace("\u{a0}", "");

                let size = Byte::from_str(size).unwrap();

                let download_url = children
                    .next()
                    .unwrap()
                    .first_child()
                    .unwrap()
                    .value()
                    .as_element()
                    .unwrap()
                    .attr("href") // href on <a> tag
                    .unwrap()
                    .to_string();

                let download_url = format!("https:{}", download_url);

                Hack {
                    id,
                    name,
                    demo,
                    moderated: true,
                    added,
                    featured,
                    exit_length,
                    hack_type,
                    authors,
                    rating,
                    size,
                    download_url,
                    screenshot_urls: Vec::new(),
                    tags: None,
                }
            })
            .collect()
    }
}
