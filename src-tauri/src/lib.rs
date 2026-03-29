#[tauri::command]
fn reveal_file(path: String) {
  #[cfg(target_os = "macos")]
  {
    if let Some(parent) = std::path::Path::new(&path).parent() {
      std::process::Command::new("open")
        .arg(parent.to_str().unwrap())
        .spawn()
        .unwrap_or_else(|_| panic!("Failed to reveal folder for file: {}", path));
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![reveal_file])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
