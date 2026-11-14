// ============================================================
// Aary's IDE — Desktop Commands
// Terminal, filesystem, and process management
// ============================================================

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Command;

#[derive(Serialize, Deserialize)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub success: bool,
}

#[derive(Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu: f32,
    pub memory: u64,
}

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub os_version: String,
    pub arch: String,
    pub hostname: String,
    pub cpu_count: usize,
    pub total_memory: u64,
    pub home_dir: String,
}

#[derive(Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: Option<u64>,
}

#[derive(Serialize, Deserialize)]
pub struct InstalledTool {
    pub name: String,
    pub path: String,
    pub version: Option<String>,
}

/// Execute a shell command and return the output.
#[tauri::command]
pub async fn execute_command(
    command: String,
    cwd: Option<String>,
    env: Option<HashMap<String, String>>,
) -> Result<CommandOutput, String> {
    let shell = if cfg!(target_os = "windows") {
        "powershell"
    } else {
        "sh"
    };
    let shell_arg = if cfg!(target_os = "windows") {
        "-Command"
    } else {
        "-c"
    };

    let mut cmd = Command::new(shell);
    cmd.arg(shell_arg).arg(&command);

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }
    if let Some(env_vars) = env {
        for (key, value) in env_vars {
            cmd.env(key, value);
        }
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute command: {}", e))?;

    Ok(CommandOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
        success: output.status.success(),
    })
}

/// List running processes.
#[tauri::command]
pub async fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    let output = if cfg!(target_os = "windows") {
        Command::new("powershell")
            .arg("-Command")
            .arg("Get-Process | Select-Object -First 50 Id,ProcessName,CPU,WorkingSet64 | ConvertTo-Json")
            .output()
    } else {
        Command::new("ps")
            .args(["-eo", "pid,comm,%cpu,rss", "--sort=-%cpu"])
            .output()
    };

    let output = output.map_err(|e| format!("Failed to list processes: {}", e))?;
    let stdout = String::from_utf8_lossy(&output.stdout);

    let mut processes = Vec::new();
    if !cfg!(target_os = "windows") {
        for line in stdout.lines().skip(1).take(50) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                processes.push(ProcessInfo {
                    pid: parts[0].parse().unwrap_or(0),
                    name: parts[1].to_string(),
                    cpu: parts[2].parse().unwrap_or(0.0),
                    memory: parts[3].parse().unwrap_or(0) * 1024,
                });
            }
        }
    }

    Ok(processes)
}

/// Kill a process by PID.
#[tauri::command]
pub async fn kill_process(pid: u32) -> Result<bool, String> {
    let result = if cfg!(target_os = "windows") {
        Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .output()
    } else {
        Command::new("kill")
            .arg(pid.to_string())
            .output()
    };

    match result {
        Ok(output) => Ok(output.status.success()),
        Err(e) => Err(format!("Failed to kill process: {}", e)),
    }
}

/// Get system information.
#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    let home = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/"))
        .to_string_lossy()
        .to_string();

    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        os_version: String::new(), // Populated by platform-specific code
        arch: std::env::consts::ARCH.to_string(),
        hostname: hostname::get()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
        cpu_count: num_cpus::get(),
        total_memory: 0, // Populated by platform-specific code
        home_dir: home,
    })
}

/// Open a file dialog.
#[tauri::command]
pub async fn open_file_dialog(
    title: Option<String>,
    filters: Option<Vec<(String, Vec<String>)>>,
    directory: bool,
    multiple: bool,
) -> Result<Vec<String>, String> {
    // Tauri dialog plugin handles this on the frontend side
    Ok(vec![])
}

/// Read a file's contents.
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

/// Write content to a file.
#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    std::fs::write(&path, content).map_err(|e| format!("Failed to write file {}: {}", path, e))
}

/// List files in a directory.
#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = std::fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory {}: {}", path, e))?;

    let mut files = Vec::new();
    for entry in entries.flatten() {
        let metadata = entry.metadata().unwrap_or_else(|_| {
            std::fs::metadata(entry.path()).unwrap()
        });
        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs());

        files.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            modified,
        });
    }

    files.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(files)
}

/// Detect installed development tools.
#[tauri::command]
pub async fn detect_installed_tools() -> Result<Vec<InstalledTool>, String> {
    let tools_to_check = vec![
        "git", "node", "npm", "python3", "python", "pip", "cargo", "rustc",
        "go", "java", "javac", "gcc", "g++", "clang", "make", "cmake",
        "docker", "kubectl", "adb", "flutter", "godot", "blender",
        "code", "vim", "nvim", "emacs",
    ];

    let mut installed = Vec::new();
    for tool in tools_to_check {
        if let Ok(path) = which::which(tool) {
            let version = Command::new(tool)
                .arg("--version")
                .output()
                .ok()
                .map(|o| {
                    let out = String::from_utf8_lossy(&o.stdout).to_string();
                    out.lines().next().unwrap_or("").trim().to_string()
                });

            installed.push(InstalledTool {
                name: tool.to_string(),
                path: path.to_string_lossy().to_string(),
                version,
            });
        }
    }

    Ok(installed)
}
