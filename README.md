# 🎓 Simple Student Information System

A lightweight desktop application for managing academic directory records — Students, Programs, and Colleges — backed by local CSV files and delivered via the Neutralino runtime.

---

## 📋 Overview

Simple Student Information System (SSIS) is a borderless desktop app built with Neutralino.js and a Bootstrap 5 UI. It provides full CRUD operations across three linked directories with fast, searchable, and sortable DataTables grids. All data is persisted locally in plain CSV files with schema validation on every load.

---

## ✨ Features

- 📁 Three linked directories: Students, Programs, and Colleges
- ✏️ Full create, read, update, and delete flows with modal forms
- 🔍 Row-click info panels for detailed record views
- 💾 Local CSV persistence with header schema validation
- ⚠️ NULL value detection with in-app warnings
- ⚡ Fast search, sort, and pagination via DataTables
- 🔗 Cascading referential integrity (e.g., deleting a college nullifies linked program records)
- 🌙 Persistent dark/light theme toggle saved across sessions
- 🖥️ Borderless custom title bar with draggable region

---

## 🧰 Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Neutralino.js](https://neutralino.js.org/) | 6.5.0 | Desktop runtime (replaces Electron) |
| [Bootstrap](https://getbootstrap.com/) | 5.x | UI component framework and theming |
| [jQuery](https://jquery.com/) | 3.x | DOM manipulation and event handling |
| [DataTables](https://datatables.net/) | 2.x | Table rendering, search, sort, pagination |
| [Moment.js](https://momentjs.com/) | 2.x | Date formatting utilities |
| [Heroicons](https://heroicons.com/) | 2.x | SVG icon set (outline + solid variants) |

---

## 🧾 Data Model

### 👤 Students

| Column | Type | Constraints | Description |
|---|---|---|---|
| `ID` | String | Primary Key, Required | Unique student identifier |
| `First Name` | String | Required | Student's first name |
| `Last Name` | String | Required | Student's last name |
| `Program Code` | String | FK → Programs.Code, nullable (`NULL`) | Enrolled program |
| `Year` | String | Required | Year level (e.g., `1`, `2`, `3`, `4`) |
| `Gender` | String | Required | Gender (e.g., `Male`, `Female`) |

**CSV header:** `ID,First Name,Last Name,Program Code,Year,Gender`

---

### 📄 Programs

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Code` | String | Primary Key, Required | Unique program code (e.g., `BSCS`) |
| `Name` | String | Required | Full program name |
| `College` | String | FK → Colleges.Code, nullable (`NULL`) | Parent college |

**CSV header:** `Code,Name,College`

---

### 🏛️ Colleges

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Code` | String | Primary Key, Required | Unique college code (e.g., `CCS`) |
| `Name` | String | Required | Full college name |

**CSV header:** `Code,Name`

---

### 🔗 Relationships

```
Colleges (1) ──── (0..*) Programs (1) ──── (0..*) Students
```

- Deleting a **College** nullifies the `College` field on all linked Programs.
- Deleting a **Program** nullifies the `Program Code` field on all linked Students.
- Editing a **College Code** or **Program Code** cascades the update to all referencing records.

---

## 🗂️ Project Structure

```
ssis/
├── neutralino.config.json       # App configuration (window, CLI, API allowlist)
├── src/
│   ├── index.html               # Single-page shell — layout, modals, script tags
│   ├── css/
│   │   ├── styles.css           # Custom app styles
│   │   ├── bootstrap/
│   │   │   └── bootstrap.css    # Bootstrap 5 full build
│   │   ├── datatables/
│   │   │   └── datatables.css   # DataTables + extensions CSS
│   │   └── heroicons/
│   │       └── heroicons.css    # Heroicon CSS sprite references
│   ├── img/
│   │   ├── appIcon.png          # Application window icon
│   │   └── heroicons/
│   │       ├── outline/         # Outline SVG icons
│   │       └── solid/           # Solid SVG icons
│   └── js/
│       ├── main.js              # Entry point — init, DataTable setup, theme, nav
│       ├── core/
│       │   ├── csv.js           # CSV config, read/write/parse/delete utilities
│       │   ├── students.js      # Student CRUD, table render, modal logic
│       │   ├── programs.js      # Program CRUD, table render, modal logic
│       │   └── colleges.js      # College CRUD, table render, modal logic
│       ├── bootstrap/
│       │   └── bootstrap.js     # Bootstrap 5 JS bundle
│       ├── datatables/
│       │   └── datatables.js    # DataTables + Responsive + FixedHeader + Select
│       ├── jquery/
│       │   └── jquery.js        # jQuery full build
│       ├── moment/
│       │   └── moment.js        # Moment.js date library
│       └── neutralino/
│           └── neutralino.js    # Neutralino client library
└── csv/                         # Auto-created on first run
    ├── students.csv
    ├── programs.csv
    └── colleges.csv
```

---

## 🚀 Getting Started

### ✅ Prerequisites

| Requirement | Notes |
|---|---|
| [Node.js](https://nodejs.org/) 18+ | Required for the Neutralino CLI |
| [Neutralino CLI](https://neutralino.js.org/docs/cli/neu-cli) | Install globally: `npm install -g @neutralinojs/neu` |

### ▶️ Run in Development

```bash
# Clone the repository
git clone <repo-url>
cd ssis

# Start the development server with hot reload
neu run
```

The app window will open automatically. The `csv/` directory is created on first launch if it does not exist.

### 📦 Build for Production

```bash
# Build binaries for the current platform
neu build
```

Output binaries are placed in the `dist/` directory. The build produces a self-contained executable (`ssis.exe` on Windows) alongside a `resources.neu` bundle.

To build for a specific platform, refer to the [Neutralino build documentation](https://neutralino.js.org/docs/cli/neu-cli#neu-build).

---

## 📌 Notes

- CSV headers are validated on every load; a schema mismatch will surface as an error toast.
- Empty datasets are handled gracefully — a warning toast is shown but the app remains functional.
- Theme preference (dark/light) is persisted via Neutralino's storage API across sessions.
- The `csv/` directory is relative to the binary's working directory and is created automatically.
