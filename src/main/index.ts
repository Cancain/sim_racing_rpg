import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import chokidar from 'chokidar';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Sim Racing Career',
  });

  win.loadFile(path.join(__dirname, '..', '..', 'index.html'));
}

function setupDevWatchers(): void {
  if (app.isPackaged) return;

  const htmlPath = path.join(__dirname, '..', '..', 'index.html');
  chokidar.watch(htmlPath).on('change', () => {
    for (const win of BrowserWindow.getAllWindows()) win.webContents.reload();
  });

  chokidar.watch(__filename).on('change', () => {
    app.relaunch();
    app.exit(0);
  });
}

app.whenReady().then(() => {
  createWindow();
  setupDevWatchers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
