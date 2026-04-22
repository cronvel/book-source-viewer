// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_cwd() -> String {
    std::env::current_dir()
        .unwrap()
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn resolve_cli_path(input: String) -> String {
    let path = std::path::PathBuf::from(&input);

    if path.is_absolute() {
        return path.to_string_lossy().to_string();
    }

    let cwd = std::env::current_dir().unwrap();
    cwd.join(path).to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_cwd,
            resolve_cli_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
