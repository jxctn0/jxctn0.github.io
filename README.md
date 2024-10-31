# Spotify Album Poster Generator

This project is a web application that allows users to generate custom posters for their favourite Spotify albums. Users can log into Spotify, input album names, and the app will generate a poster for each album, including album art, title, artist, colour palette, and tracklist. Users can also download each poster as a PNG image.

## Features

- **Spotify Authentication**: Log in using your Spotify account to access album data.
- **Album Poster Generation**: Enter multiple album names, and generate individual posters for each.
- **Poster Design**: Each poster includes album art, title, artist name, a unique colour palette, and a tracklist.
- **Download as PNG**: Download each generated poster as a high-quality PNG file.
- **Responsive and Styled Layout**: A clean, responsive UI with a consistent colour scheme and modern styling.

## Project Structure

This project is split into three main files:
- `index.html`: The HTML structure for the web app.
- `styles.css`: Styling for the outer page and UI elements.
- `script.js`: JavaScript code for interacting with Spotify, generating posters, and handling downloads.

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/spotify-album-poster-generator.git
   cd spotify-album-poster-generator
   ```

2. **Add Your Spotify Client ID**:
   - Open `script.js`, and replace `'YOUR_CLIENT_ID'` with your actual Spotify Client ID.
   - If you don’t have a Spotify Client ID, you can register an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

3. **Start a Local Server**:
   - Since this is a frontend project, you can open `index.html` directly, or use a local server (recommended for better performance).
   - For example, using Python:
     ```bash
     python3 -m http.server
     ```
   - Open `http://localhost:8000` in your browser.

## Usage

1. **Log in to Spotify**: Click on the "Log in to Spotify" button and follow the authentication process.
2. **Enter Album Names**: Enter the names of the albums you want posters for, separated by newlines.
3. **Generate Posters**: The app will automatically generate posters for each album entered.
4. **Download Posters**: Use the "Download as PNG" button under each poster to save the poster as a PNG image.

## Technology Stack

- **HTML, CSS, JavaScript**: Core technologies for frontend development.
- **Spotify Web API**: For accessing album data and images.
- **html2canvas**: For rendering the poster content as PNG images.

## Screenshots

![Screenshot of App Interface](images/screenshot-interface.png)
![Screenshot of Generated Poster](images/screenshot-poster.png)

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

&copy; Joshua Cotugno 2024
```