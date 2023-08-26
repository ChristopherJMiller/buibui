// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::api::Hack;
use api::{ApiController, HackDetails};
use manage::{
    collection::{CollectedHack, Collection},
    settings::Settings,
};
use state::BuibuiState;

mod api;
mod manage;
mod state;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn get_hack_list(page: u64) -> Result<Vec<Hack>, String> {
    let api = ApiController::new();
    api.get_hack_list(page).await
}

#[tauri::command]
async fn get_hack_details(id: u64) -> Result<HackDetails, String> {
    let api = ApiController::new();
    api.get_hack_details(id).await
}

#[tauri::command]
async fn get_settings() -> Settings {
    BuibuiState::read().await.settings.clone()
}

#[tauri::command]
async fn hack_collection() -> Result<Vec<CollectedHack>, String> {
    Collection::get_collected_hacks()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
async fn add_hack(base: Hack, details: HackDetails) -> Result<CollectedHack, String> {
    Collection::add_hack(base, details)
        .await
        .map_err(|err| err.to_string())
}

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_hack_list,
            get_hack_details,
            get_settings,
            hack_collection,
            add_hack
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
