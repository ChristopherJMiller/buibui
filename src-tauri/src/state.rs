use once_cell::sync::Lazy;
use tokio::sync::{RwLock, RwLockReadGuard};

use crate::manage::settings::Settings;

static STATE: Lazy<RwLock<BuibuiState>> = Lazy::new(|| RwLock::new(BuibuiState::new()));

pub struct BuibuiState {
    pub settings: Settings,
}

impl BuibuiState {
    pub fn new() -> Self {
        Self {
            settings: Settings::bootstrap().unwrap(),
        }
    }

    pub async fn read<'a>() -> RwLockReadGuard<'a, Self> {
        STATE.read().await
    }
}
