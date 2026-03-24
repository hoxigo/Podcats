import { app, BrowserWindow, shell, nativeImage, ipcMain } from 'electron';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function getIconPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '..', 'build-resources', 'icon.png');
}

function setDockIcon() {
  if (process.platform !== 'darwin') return;
  const p = getIconPath();
  if (!fs.existsSync(p)) return;
  try {
    const icon = nativeImage.createFromPath(p);
    if (!icon.isEmpty()) app.dock?.setIcon(icon);
  } catch {}
}

function createWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#ffffff',
    icon: fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (app.isPackaged) {
    const indexPath = path.join(process.resourcesPath, 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }



  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function ensureDataDir() {
  const dir = path.join(app.getPath('userData'), 'podcats');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function wireIpc() {
  ipcMain.handle('podcats:save', async (_event, data: any) => {
    const dir = ensureDataDir();
    const target = path.join(dir, 'podcasts.json');
    await fs.promises.writeFile(target, JSON.stringify(data ?? [], null, 2), 'utf8');
    return { path: target };
  });

  ipcMain.handle('podcats:load', async () => {
    const dir = ensureDataDir();
    const target = path.join(dir, 'podcasts.json');
    if (!fs.existsSync(target)) return [];
    try {
      const raw = await fs.promises.readFile(target, 'utf8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });
}

app.whenReady().then(() => {
  setDockIcon();
  wireIpc();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
