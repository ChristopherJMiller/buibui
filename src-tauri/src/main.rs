// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use api::{ApiController, ApiRequest};
use scraper::Html;
use tracing::info;

use crate::api::Hack;

mod api;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    let api = ApiController::new();
    info!("{:#?}", api.get_hack_list(0).await);

    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
