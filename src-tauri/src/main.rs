// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::api::Hack;
use api::{ApiController, HackDetails};

mod api;

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

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_hack_list, get_hack_details])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
