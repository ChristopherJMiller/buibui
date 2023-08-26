use app_dirs2::AppDirsError;
use hyper::StatusCode;
use thiserror::Error;

pub mod collection;
pub mod settings;

#[derive(Error, Debug)]
pub enum BuibuiError {
    #[error("filesystem error encountered: {0}")]
    FilesystemError(#[from] std::io::Error),
    #[error("failed to find a valid location to put app files {0}")]
    AppDirectoryError(#[from] AppDirsError),
    #[error("failed to decode file {0}")]
    DeserializeError(#[from] toml::de::Error),
    #[error("failed to encode file {0}")]
    SerializeError(#[from] toml::ser::Error),
    #[error("encounted an error while making a request: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("got unsuccessful download with status code {0}")]
    DownloadFailed(StatusCode),
    #[error("error occured while handling zip file {0}")]
    ZipError(#[from] zip::result::ZipError),
    #[error("download contained no patch file")]
    ContainedNoPatchFile,
    #[error("hack already existed in collection")]
    HackAlreadyExists,
}
