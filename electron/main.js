import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Env var to distinguish dev/prod
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simple local storage access if needed, though secure defaults are better. Keeping simples for conversion.
        },
        icon: path.join(__dirname, '../public/logo.svg') // Custom BigO Logo
    });

    if (isDev) {
        // In dev, load from the vite dev server
        mainWindow.loadURL('http://localhost:3000');
        // Open DevTools
        mainWindow.webContents.openDevTools();
    } else {
        // In prod, load from the build output
        // Note: We need to go up one level from 'electron' folder to find 'dist-electron'
        mainWindow.loadFile(path.join(__dirname, '../dist-electron/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
