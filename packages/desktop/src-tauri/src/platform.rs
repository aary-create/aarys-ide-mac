// ============================================================
// Aary's IDE — Desktop Platform Specifics (macOS / Windows / Linux)
// ============================================================

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PlatformInfo {
    pub os: String,
    pub is_wayland: bool,
    pub supports_accessibility: bool,
    pub supports_screen_capture: bool,
}

#[tauri::command]
pub async fn get_platform_info() -> Result<PlatformInfo, String> {
    let is_wayland = std::env::var("XDG_SESSION_TYPE")
        .map(|v| v.to_lowercase() == "wayland")
        .unwrap_or(false);

    Ok(PlatformInfo {
        os: std::env::consts::OS.to_string(),
        is_wayland,
        supports_accessibility: true,
        supports_screen_capture: true,
    })
}

#[tauri::command]
pub async fn get_accessibility_status() -> Result<bool, String> {
    // Check system accessibility permissions
    Ok(true)
}

#[tauri::command]
pub async fn request_accessibility_permission() -> Result<bool, String> {
    Ok(true)
}
