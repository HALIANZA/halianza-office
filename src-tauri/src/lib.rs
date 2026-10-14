// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use serde::Serialize;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct FileDocument {
    path: String,
    content: String,
}

#[tauri::command]
fn read_document(path: String) -> Result<FileDocument, String> {
    let file_path = PathBuf::from(&path);

    let content = fs::read_to_string(&file_path)
        .map_err(|error| format!("Não foi possível ler o arquivo: {error}"))?;

    Ok(FileDocument { path, content })
}

#[tauri::command]
fn save_document(path: String, content: String) -> Result<(), String> {
    let file_path = PathBuf::from(&path);

    fs::write(&file_path, content)
        .map_err(|error| format!("Não foi possível salvar o arquivo: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_document,
            save_document
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}