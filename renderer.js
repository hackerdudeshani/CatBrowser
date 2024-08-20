const { ipcRenderer } = require('electron');

// Handle search button click
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value;
    const engine = document.getElementById('search-engine').value;
    const enableCSP = !['Google', 'Bing'].includes(engine); // Disable CSP for search engines like Google and Bing
    ipcRenderer.send('set-csp', enableCSP);

    let url = '';
    if (engine === 'Google') {
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    } else if (engine === 'Bing') {
        url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    }

    ipcRenderer.send('navigate-to-url', url);
});

// Handle open file button click
document.getElementById('open-file-button').addEventListener('click', () => {
    const filePath = document.getElementById('file-input').files[0].path;
    ipcRenderer.send('open-file', filePath);
});

// Handle check security button click
document.getElementById('check-security-button').addEventListener('click', () => {
    const url = document.getElementById('security-check-url').value;
    ipcRenderer.send('check-security', url);
});

// Receive security check result
ipcRenderer.on('security-check-result', (event, result) => {
    document.getElementById('security-result').innerText = result;
});
