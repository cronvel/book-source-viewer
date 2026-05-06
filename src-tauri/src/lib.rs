// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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

#[tauri::command]
fn is_absolute(input: String) -> bool {
    let path = std::path::PathBuf::from(&input);
    return path.is_absolute();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_cwd,
            resolve_cli_path,
            is_absolute
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
