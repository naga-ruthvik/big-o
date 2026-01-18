# BigO (Neuro DSA Tracker) - "Vibe Coded" Edition

Welcome to **BigO**, a "Vibe Coded" project designed helping you master Data Structures and Algorithms through active recall, interleaving, and AI-powered mental models. 

> **Note:** This project is "Vibe Coded" — meaning it was built for speed, aesthetics, and utility without a traditional backend database. All data is local.

---

## 🚀 Features
- **Flashcard Logic**: Active recall using the SM-2 algorithm.
- **AI Integration**: Auto-fill problem details and generate mental models using **Ollama (Local)** or **Google Gemini**.
- **Mistake Journal**: Log and review your pitfalls.
- **Pattern Quiz**: Test your pattern recognition skills.
- **Desktop Ready**: Runs as a standalone Electron app on Windows/Mac.

## 📸 App Screenshots
| Dashboard | Mental Models |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Mental Models](screenshots/mental-models.png) |

| Quiz Mode | Mistake Journal |
|:---:|:---:|
| ![Quiz](screenshots/quiz.png) | ![Journal](screenshots/journal.png) |

---

## 🤖 AI Features: How to Use

### 1. Ollama (Local & Free)
This runs strictly on your machine. Privacy-focused and free.
1.  **Install Ollama**: Download from [ollama.com](https://ollama.com).
2.  **Pull a Model**: Open your terminal and run:
    ```bash
    ollama pull llama3
    ```
    (Or `mistral`, `deepseek-coder`, etc.)
3.  **Configure in BigO**:
    - Go to **Settings** (Gear Icon).
    - Select **Ollama**.
    - Click **"Fetch"** next to Model Name to auto-detect your installed models.
    - Click **Apps** -> **New Logic Card** -> **Magic Fill** to test it.

### 2. Google Gemini (Cloud)
1.  Get an API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Go to **Settings** in BigO.
3.  Select **Gemini** and paste your key.

---

## 💾 Data Storage (Important!)
**"Where is my database?"**
There is no database! This is a **local-first** application.
- **Web Version**: Data is stored in your browser's `Local Storage`.
- **Desktop Version**: Data is stored in your computer's `AppData` folder (e.g., `C:\Users\You\AppData\Roaming\BigO`).
- **Sync**: There is **no automatic sync** between computers.

**Backup Your Data**:
Since there is no cloud sync, frequently use the **Backup** button (Download JSON) to save your progress safely to a file.

---

## 🖥️ Desktop Application
This project can be converted into a native desktop app using Electron.

### ⚠️ IMPORTANT: Deployment & Usage
If you have built or downloaded the desktop version (`BigO.exe`), please follow these rules to ensure it works correctly:

1.  **DO NOT Move the EXE Alone**: The application relies on resource files in its folder. Moving *only* `BigO.exe` to your Desktop will cause errors (e.g., `ICU data received`).
    *   **Correct Way**: Keep the `BigO.exe` inside the `dist-app/win-unpacked` folder.
    *   **To get a Desktop Icon**: Right-click `BigO.exe` -> **Send to** -> **Desktop (create shortcut)**.

2.  **Debugging**: 
    If you encounter issues, look for the debug log files generated in the build folder, or run the application from the command line to see real-time logs.

### Build Commands
To build the app yourself:

**Windows**:
```bash
npm run electron:build
```
*Output Location*: `dist-app/win-unpacked/BigO.exe`

**Mac (macOS)**:
```bash
npm run electron:build -- --mac
```
*(Note: Requires a Mac to build)*

---

## 🤝 Contributing & Issues
This implies a **"Vibe Coded"** philosophy:
- **Expect Bugs**: It was built fast for the "vibe". If you find issues, please report them!
- **Collaborations Open**: Found a bug? Want to add a feature?
    - Open an **Issue** in the Issues tab.
    - Submit a **Pull Request**.

---


## ✨ Happy Coding!
"Thanks for checking out this project!
If you found it useful or interesting, feel free to explore, experiment, and build on it."

Regards,  
**Ruthvik**
## 📸 App Gallery

---

![App Screenshot 1](screenshots/Screenshot%202026-01-18%20105505.png)
![App Screenshot 2](screenshots/Screenshot%202026-01-18%20105525.png)
![App Screenshot 3](screenshots/Screenshot%202026-01-18%20105540.png)
![App Screenshot 4](screenshots/Screenshot%202026-01-18%20105554.png)
![App Screenshot 5](screenshots/Screenshot%202026-01-18%20105607.png)
![App Screenshot 6](screenshots/Screenshot%202026-01-18%20105621.png)
![App Screenshot 7](screenshots/Screenshot%202026-01-18%20105631.png)
![App Screenshot 8](screenshots/Screenshot%202026-01-18%20105640.png)
![App Screenshot 9](screenshots/Screenshot%202026-01-18%20105651.png)


