use std::{
    fs,
    io::{self, Cursor},
    path::PathBuf,
};

use hyper::StatusCode;
use serde::{Deserialize, Serialize};
use url::Url;
use zip::ZipArchive;

use crate::{
    api::{Hack, HackDetails},
    state::BuibuiState,
};

use super::{settings::Settings, BuibuiError};

/// Represents a locally stored hack
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CollectedHack {
    pub crc: u32,
    pub cover_image_name: String,
    #[serde(flatten)]
    pub base: Hack,
    #[serde(flatten)]
    pub details: HackDetails,
}

impl CollectedHack {
    pub fn from_dir_path(path: PathBuf) -> Result<Self, BuibuiError> {
        let collected_hack_file = path.join("hack.toml");
        let contents = fs::read_to_string(&collected_hack_file)?;
        toml::from_str(&contents).map_err(BuibuiError::DeserializeError)
    }
}

pub struct Collection;

impl Collection {
    pub async fn get_collected_hacks() -> Result<Vec<CollectedHack>, BuibuiError> {
        let hacks_dir = BuibuiState::read().await.settings.hack_dir_location();
        let contents = fs::read_dir(&hacks_dir)?;
        Ok(contents
            .into_iter()
            .filter_map(|item| {
                if let Ok(item) = item {
                    if item.file_type().unwrap().is_dir() {
                        CollectedHack::from_dir_path(item.path()).ok()
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
            .collect())
    }

    pub async fn add_hack(base: Hack, details: HackDetails) -> Result<CollectedHack, BuibuiError> {
        let hack_location = BuibuiState::read()
            .await
            .settings
            .hack_dir_location()
            .join(base.id.to_string());

        let download_res = reqwest::get(&base.download_url).await?;
        if download_res.status() != StatusCode::OK {
            return Err(BuibuiError::DownloadFailed(download_res.status()));
        }
        let file = Cursor::new(download_res.bytes().await?);
        let mut archive = ZipArchive::new(file)?;

        let patch_name = archive
            .file_names()
            .find(|file| file.contains(".bps"))
            .ok_or(BuibuiError::ContainedNoPatchFile)?
            .to_string();

        let mut patch_file = archive.by_name(&patch_name).unwrap();
        let crc = patch_file.crc32();

        if fs::read_dir(&hack_location).is_ok() {
            return Err(BuibuiError::HackAlreadyExists);
        }

        fs::create_dir(&hack_location)?;

        let mut patch_buf = Vec::new();
        io::copy(&mut patch_file, &mut patch_buf)?;
        let rom = fs::read(Settings::rom_location()?)?;
        let (_, rom) = rom.split_at(512);

        let final_hack = flips::BpsPatch::new(patch_buf).apply(rom)?;

        fs::write(hack_location.join("hack.smc"), final_hack.to_bytes())?;

        let url = Url::parse(&base.screenshot_url).unwrap();
        let collected_hack = CollectedHack {
            crc,
            cover_image_name: url.path_segments().unwrap().last().unwrap().to_string(),
            base,
            details,
        };

        fs::write(
            hack_location.join("hack.toml"),
            toml::to_string_pretty(&collected_hack)?,
        )?;

        Ok(collected_hack)
    }
}
