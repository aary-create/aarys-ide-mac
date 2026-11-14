# Aary's IDE — macOS & Desktop Application

> Universal Autonomous AI Agent Runtime & IDE for macOS (Apple Silicon & Intel), Windows, and Linux.

## 💻 Architecture

- **Desktop Core**: Tauri v2 + Rust platform bridge (`packages/desktop/src-tauri/`) with native computer use, screen capture, process manager, and accessibility integrations.
- **Central Agent Runtime**: Express + WebSocket autonomous orchestrator (`packages/backend/`) with tool execution loop, planner, and real verification engine.
- **Universal AI Adapters**: OmniRoute, OpenRouter, OpenAI, Anthropic (Claude), Google Gemini, Ollama (local models).
- **Persistent Memory**: SQLite database storing 5 categories: Working, User, Project, Task, and Knowledge memory.
- **Universal Interface**: React 19 + TypeScript + Monaco Code Editor + Tailwind CSS (`packages/frontend/`).

## 🚀 Quick Start (Development & Build)

### 1. Requirements
- Node.js >= 20.0.0
- Rust & Cargo (for native desktop build)
- Xcode Command Line Tools (on macOS: `xcode-select --install`)

### 2. Install & Configure
```bash
cp .env.example .env
npm install
npm run build:shared
```

### 3. Run Development Server
```bash
# Starts backend (port 3001) & frontend (port 5173)
npm run dev
```

### 4. Build Native macOS Bundle (.dmg)
```bash
npm run build:desktop
# App bundle created at packages/desktop/src-tauri/target/release/bundle/dmg/
```
