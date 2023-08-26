use std::{fs, path::PathBuf};

use app_dirs2::{get_app_root, AppDataType, AppInfo};
use serde::{Deserialize, Serialize};

use super::BuibuiError;

const APP_INFO: AppInfo = AppInfo {
    name: "BuiBui",
    author: "ALUMUX",
};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    /// Configuration location, more to tell end users where to find it.
    config_location: String,
    /// Where buibui will download and manage hacks and it's settings
    workspace_location: String,
    /// Relative to the workspace location, where should the hacks be stored?
    hack_relative_location: String,
}

impl Settings {
    /// Get location of configuration file.
    fn config_location() -> Result<String, BuibuiError> {
        get_app_root(AppDataType::UserConfig, &APP_INFO)
            .map(|x| x.to_string_lossy().to_string())
            .map_err(|err| BuibuiError::AppDirectoryError(err))
    }

    pub fn hack_dir_location(&self) -> PathBuf {
        PathBuf::from(&self.workspace_location).join(&self.hack_relative_location)
    }

    /// Get Settings from desk, if it exists
    pub fn from_disk() -> Result<Self, BuibuiError> {
        let contents =
            fs::read_to_string(PathBuf::from(Self::config_location()?).join("settings.toml"))?;
        toml::from_str(&contents).map_err(|err| BuibuiError::DeserializeError(err))
    }

    /// Sets up the directories defined in the settings file.
    pub fn bootstrap_settings_location(&self) -> Result<(), BuibuiError> {
        fs::create_dir_all(&self.workspace_location)?;
        fs::create_dir_all(&self.hack_dir_location())?;
        Ok(())
    }

    /// Bootstrap settings
    pub fn bootstrap() -> Result<Self, BuibuiError> {
        let from_disk = match Self::from_disk() {
            Ok(from_disk) => from_disk,
            Err(_) => {
                let settings = Self::from_os_default()?;
                let config_path = Self::config_location()?;

                // Create directory locations
                fs::create_dir_all(&config_path)?;

                fs::write(
                    PathBuf::from(config_path).join("settings.toml"),
                    toml::to_string_pretty(&settings)?,
                )?;
                settings
            }
        };

        from_disk.bootstrap_settings_location()?;

        Ok(from_disk)
    }

    /// Operating System default
    pub fn from_os_default() -> Result<Self, BuibuiError> {
        let root = get_app_root(AppDataType::UserData, &APP_INFO)?;
        Ok(Self {
            config_location: Self::config_location()?,
            workspace_location: root.to_string_lossy().to_string(),
            hack_relative_location: "hacks".to_string(),
        })
    }
}
