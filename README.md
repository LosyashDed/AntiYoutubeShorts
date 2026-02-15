[Читать на русском](README_RU.md)

> Made by [losyash](http://losyashded.ru/)

# Anti-Shorts

A Chrome browser extension that cleans your feed from YouTube Shorts and converts Shorts links into normal videos.

## Features

*   🚫 **Complete Visual Hiding**: Completely cuts out the "Shorts" button from the side menu and horizontal shelves from the recommendation feed. The interface looks as if Shorts never existed.
*   🛡️ **Fail-Safe Technology**: Blocking works at the CSS level by default. This means Shorts are hidden instantly when the page loads, without "flickering" or waiting for scripts to load.
*   ⏳ **Eternal Loading**: If you do open a direct link to a Short, the extension will mimic "eternal buffering" (spinner), making viewing impossible.
*   🎚️ **Easy Control**: Turn blocking on and off via the popup menu. When turned off, hidden elements return to their places.

## Installation

Since this extension is not yet published in the Chrome Web Store, it needs to be installed manually (in Developer Mode). It is safe and takes 1 minute.

1.  **Download this repository**:
    *   Click the green **Code** button -> **Download ZIP** and unpack the archive.
    *   Or clone via git: `git clone https://github.com/your-username/AntiYoutubeShorts.git`

2.  **Open Extension Management**:
    *   In the browser address bar (Chrome, Edge, Brave, Yandex) type: `chrome://extensions`
    *   Or go through the menu: Settings -> Extensions.

3.  **Enable Developer Mode**:
    *   In the top right corner, find the **"Developer mode"** switch and turn it on.

4.  **Load the Extension**:
    *   A panel with buttons will appear. Click **"Load unpacked"**.
    *   In the window that opens, select the folder with the downloaded `AntiYoutubeShorts` project (the one containing the `manifest.json` file).

Done! The icon should appear in the extensions panel.

## Usage

1.  Go to YouTube.
2.  Shorts should disappear from the feed.
3.  Click on the extension icon to see the toggle switch. If you want to temporarily bring Shorts back, simply turn off the toggle.

## Removal

Simply click the "Remove" button on the extension card at `chrome://extensions`.
