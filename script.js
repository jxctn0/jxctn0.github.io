const clientId = '9366e6cc6fdf45c191fbf05fb374e297';
const redirectUri = window.location.origin;
const scopes = 'user-library-read playlist-read-private';

document.getElementById('login-button').onclick = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
};

const hash = window.location.hash;
let accessToken = null;
if (hash) {
    const params = new URLSearchParams(hash.replace('#', ''));
    accessToken = params.get('access_token');
    window.history.replaceState({}, document.title, window.location.pathname);
}

if (accessToken) {
    document.getElementById('album-input').disabled = false;
    document.getElementById('generate-posters-button').disabled = false;
    document.getElementById('generate-posters-button').addEventListener('click', generatePosters);
}

async function generatePosters() {
    const albumInput = document.getElementById('album-input').value;
    const albums = albumInput.split('\n').map(album => album.trim()).filter(Boolean);
    const posterContainer = document.getElementById('poster-container');
    posterContainer.innerHTML = '';

    for (const albumName of albums) {
        try {
            const albumData = await fetchAlbumData(albumName);
            if (albumData) {
                const colours = await getDominantColours(albumData.images[0].url);
                
                // Create and name the iframe
                const iframe = await createPosterIframe(albumData, colours);
                if (iframe instanceof HTMLElement) {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('poster-wrapper');
                    wrapper.appendChild(iframe);

                    const downloadButton = document.createElement('button');
                    downloadButton.classList.add('download-button');
                    downloadButton.innerText = 'Download as PNG';
                    downloadButton.onclick = () => downloadPosterAsPng(iframe, albumData.name, albumData.artists[0].name);

                    wrapper.appendChild(downloadButton);
                    posterContainer.appendChild(wrapper);
                } else {
                    console.error(`Failed to create an iframe for album: ${albumName}`);
                }
            } else {
                console.error(`Album ${albumName} not found.`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${albumName}:`, error);
        }
    }
}

async function fetchAlbumData(albumName) {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.albums.items.length > 0) {
        const album = data.albums.items[0];
        const tracksRes = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const tracksData = await tracksRes.json();
        return { ...album, tracks: tracksData.items };
    }
    return null;
}

async function createPosterIframe(album, colours) {
    const sortedColours = colours.sort((a, b) => getLuminance(a) - getLuminance(b));
    try {
        const albumImageBlob = await fetch(album.images[0].url).then(response => response.blob());
        const albumImageUrl = URL.createObjectURL(albumImageBlob);

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --primary-text-color: #333333;
                        --linework-color: #ddd;
                        --background-color: #f5f5dc;
                        --container-background-color: #ffffff;
                        --swatch-outline-color: #ddd;
                        --title-font-size: 14px;
                        --subtitle-font-size: 14px;
                        --tracklist-font-size: 11px;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: var(--background-color);
                        color: var(--primary-text-color);
                    }
                    .container {
                        width: 4in;
                        height: 6in;
                        background-color: var(--container-background-color);
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        overflow: hidden;
                        text-align: left;
                        padding: 15px;
                        box-sizing: border-box;
                    }
                    .album-art {
                        width: 100%;
                        border-radius: 5px;
                        margin-bottom: 8px;
                    }
                    .title {
                        display: flex;
                        justify-content: center;
                        align-items: baseline;
                        font-family: 'Oswald', sans-serif;
                        font-size: var(--title-font-size);
                        font-weight: bold;
                        gap: 5px;
                        margin-bottom: 8px;
                        color: var(--primary-text-color);
                    }
                    .sub {
                        font-weight: normal;
                        font-size: var(--subtitle-font-size);
                    }
                    hr {
                        border: 0;
                        border-top: 1px solid var(--linework-color);
                        margin: 3px 0 8px;
                    }
                    .palette {
                        display: flex;
                        gap: 4px;
                        margin-bottom: 8px;
                        justify-content: center;
                    }
                    .swatch {
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        border: 1px solid var(--swatch-outline-color);
                    }
                    .tracklist-container {
                        display: grid;
                        grid-template-columns: auto 1fr auto 1fr;
                        gap: 5px 10px;
                        justify-content: center;
                    }
                    .tracklist-number {
                        font-size: var(--tracklist-font-size);
                        font-weight: normal;
                        color: var(--primary-text-color);
                        text-align: right;
                        padding-right: 5px;
                    }
                    .tracklist-title {
                        font-size: var(--tracklist-font-size);
                        font-weight: bold;
                        color: var(--primary-text-color);
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="${albumImageUrl}" class="album-art" alt="${album.name} album cover">
                    <div class="title">${album.name}&nbsp;<div class="sub">${album.artists[0].name}</div></div>
                    <hr/>
                    <div class="palette">
                        ${sortedColours.map(colour => `<div class="swatch" style="background-color: ${colour};"></div>`).join('')}
                    </div>
                    <div class="tracklist-container">
                        ${album.tracks.map((track, index) => `
                            <div class="tracklist-number">${index + 1}.</div>
                            <div class="tracklist-title">${track.name}</div>
                        `).join('')}
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const iframe = document.createElement('iframe');
        const formattedAlbum = album.name.replace(/[^a-zA-Z0-9]/g, '_');
        const formattedArtist = album.artists[0].name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Set title or id attribute for naming
        iframe.title = `${formattedAlbum}-${formattedArtist}_Poster`;
        iframe.src = url;
        iframe.width = '400';
        iframe.height = '600';

        return iframe;
    } catch (error) {
        console.error("Error creating iframe:", error);
        return null;
    }
}

function downloadPosterAsPng(iframe, albumName, artistName) {
    html2canvas(iframe.contentWindow.document.body).then((canvas) => {
        const link = document.createElement('a');
        
        // Format the filename as `{Album}-{Artist}_Poster.png`
        const formattedAlbum = albumName.replace(/[^a-zA-Z0-9]/g, '_');
        const formattedArtist = artistName.replace(/[^a-zA-Z0-9]/g, '_');
        link.href = canvas.toDataURL('image/png');
        link.download = `${formattedAlbum}-${formattedArtist}_Poster.png`;
        
        link.click();
    });
}

function getLuminance(rgb) {
    const rgbArray = rgb.match(/\d+/g).map(Number);
    return 0.299 * rgbArray[0] + 0.587 * rgbArray[1] + 0.114 * rgbArray[2];
}

async function getDominantColours(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    return new Promise((resolve) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
            let colours = extractColours(imageData);
            colours = colours.sort((a, b) => getLuminance(a) - getLuminance(b));
            resolve(colours);
        };
    });
}

function extractColours(data) {
    const colours = [];
    const tolerance = 30;
    function isUniqueColour(r, g, b) {
        return colours.every(([cr, cg, cb]) => Math.abs(cr - r) > tolerance || Math.abs(cg - g) > tolerance || Math.abs(cb - b) > tolerance);
    }

    for (let i = 0; i < data.length; i += 4 * 5000) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (isUniqueColour(r, g, b)) colours.push([r, g, b]);
        if (colours.length === 4) break;
    }
    return colours.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);
}
