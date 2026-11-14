// ============================================================
// Aary's IDE — Desktop Shell (Tauri)
// Platform-specific capabilities for macOS, Windows, Linux
// ============================================================

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod computer_use;
mod platform;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::execute_command,
            commands::list_processes,
            commands::kill_process,
            commands::get_system_info,
            commands::open_file_dialog,
            commands::read_file,
            commands::write_file,
            commands::list_directory,
            commands::detect_installed_tools,
            computer_use::capture_screen,
            computer_use::mouse_click,
            computer_use::mouse_move,
            computer_use::keyboard_type,
            computer_use::keyboard_key,
            computer_use::scroll,
            computer_use::get_active_window,
            computer_use::list_windows,
            platform::get_platform_info,
            platform::get_accessibility_status,
            platform::request_accessibility_permission,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running Aary's IDE");
}
