# GitGetZip

Browser extension that downloads any GitHub repository as a ZIP file with a single click.

## Features

- **One-click download**: downloads the repository's ZIP archive instantly.
- **GitHub-style notification**: a dark toast that matches GitHub's colors shows the download status or errors.
- **Bilingual**: messages appear in Spanish or English depending on your browser language.
- **Minimal permissions**: reads the active tab URL only when you click the icon, manages downloads, and shows the notification toast.

## Requirements

A Chromium-based browser, such as Google Chrome, Brave, or Microsoft Edge.

## Installation

1. Download or clone this repository to a folder on your machine. It must contain `manifest.json`, `background.js`, and `iconggz.png`.
2. Open `chrome://extensions` in your browser (`brave://extensions` or `edge://extensions` also work).
3. Turn on **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the extension folder.
5. Pin the extension from the puzzle-piece menu so its icon stays visible in the toolbar.

## Usage

1. Open any page of a repository on `github.com`.
2. Click the extension's icon in your toolbar.
3. A toast indicates the download has started, and your browser saves the repository as `<repository-name>.zip` in your downloads folder.

## How it works

When you click the icon, GitGetZip reads the URL of the current tab, extracts the owner and the repository name, and asks the browser to download:

`https://github.com/<owner>/<repository>/archive/HEAD.zip`

`HEAD` points to the repository's default branch, so the ZIP contains the code of that branch. If the download fails, an error toast is shown. If you cancel the save dialog yourself, no error is shown.

## Privacy

- No data is collected, stored, or sent anywhere.
- No analytics, trackers, or external servers.
- The only network request is the ZIP download from `github.com`.
- Downloads use your browser's existing GitHub session, so no credentials are read or stored by the extension.

## Limitations

- Works only on `github.com` repository pages.
- Always downloads the default branch, not the branch or tag you are currently viewing.
- Private repositories work only if you are signed in to GitHub in the same browser and have access to them.
