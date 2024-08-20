const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');
}

// Function to set or remove CSP headers
function applyCSP(enableCSP) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        let cspDirectives = [];
        
        if (enableCSP) {
            cspDirectives = [
                "default-src 'none'",
                "img-src 'none' data:",
                "script-src 'self' 'unsafe-inline' https://trusted.cdn.com",
                "style-src 'self' 'unsafe-inline'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ];
        }

        const csp = cspDirectives.join('; ');

        callback({
            responseHeaders: {
                ...details.responseHeaders,
                ...(enableCSP && { 'Content-Security-Policy': [csp] })
            }
        });
    });
}

// Event handling
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('set-csp', (event, enableCSP) => {
        applyCSP(enableCSP);
    });

    ipcMain.on('navigate-to-url', (event, url) => {
        mainWindow.loadURL(url);
    });

    ipcMain.on('open-file', (event, filePath) => {
        // Apply CSP strictly for file opening
        applyCSP(true);
        mainWindow.loadFile(filePath);
    });

    ipcMain.on('check-security', async (event, url) => {
        try {
            const score = Math.floor(Math.random() * 101);
            let status = '';

            if (score >= 80) {
                status = 'Safe';
            } else if (score >= 50) {
                status = 'Moderately Safe';
            } else {
                status = 'Unsafe';
            }

            event.sender.send('security-check-result', `Security score for ${url}: ${score}/100 - ${status}`);
        } catch (error) {
            event.sender.send('security-check-result', `Error checking security for ${url}. Please try again.`);
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
