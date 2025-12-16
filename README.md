# NodeJS YouTube Downloader

Simple Node.js CLI Tool To Download YouTube Videos And Audio With Quality Selection.

## Features

✅ Download Videos In Multiple Qualities (144p - 1080p+)  
✅ Download Audio With Quality Selection  
✅ Save To Default Or Custom Directory  
✅ View Available Formats Before Downloading  
✅ Global Command Support With `npm link`  
✅ Progress Bars During Download

## Installation

```bash
npm install
```

## Quick Start

```bash
# Show Help
node yt.js

# Show Video Info & Available Formats
node yt.js info <videoUrl|videoId>
node yt.js info n1PCW0C1aiM

# Download Video (Default 720p webm)
node yt.js download <videoUrl|videoId> --quality <720p> --format <mp4>
node yt.js download n1PCW0C1aiM --quality 720p --format mp4

# Download Audio
node yt.js download n1PCW0C1aiM --quality AUDIO_QUALITY_MEDIUM

# Download To Specific Folder
node yt.js download n1PCW0C1aiM --quality 720p --output C:\Users\YourName\Videos
```

## Available Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `-q` `--quality` | `360p`, `480p`, `720p`, `1080p`, etc. | `720p` | Video Quality/Resolution |
| `-f` `--format` | `mp4`, `webm` | `webm` | Container Format |
| `-o` `--output` | Any Valid Directory Path | `./saved` | Output Save Directory |

### Video Download

```bash
node yt.js download <videoUrl|videoId> --quality <quality> --format <format> [--output <directory>]
```

**Examples:**
```bash
node yt.js download n1PCW0C1aiM -q 1080p -f mp4
node yt.js download n1PCW0C1aiM -q 720p -o C:\Users\YourName\Videos
node yt.js download "https://www.youtube.com/watch?v=n1PCW0C1aiM" -q 480p
```

### Audio Download

```bash
node yt.js download <videoUrl|videoId> --quality <audioQuality> [--output <directory>]
```

| Audio Quality | Notes |
|---------------|-------|
| `AUDIO_QUALITY_LOW` | Smallest File Size (~1-2 MB) |
| `AUDIO_QUALITY_MEDIUM` | Balanced Quality/Size (~3-4 MB) |
| `AUDIO_QUALITY_HIGH` | Best Quality (~5+ MB) |

**Examples:**
```bash
node yt.js download n1PCW0C1aiM -q AUDIO_QUALITY_MEDIUM
node yt.js download n1PCW0C1aiM -q AUDIO_QUALITY_HIGH -o C:\Users\YourName\Musics
```

## Global Install (Optional)

Make Commands Available Globally On Your System:

```bash
npm link
```

Then Use From Anywhere Without The `node yt.js` Prefix:
```bash
yt info n1PCW0C1aiM
yt download n1PCW0C1aiM -q 720p
yt download n1PCW0C1aiM -q 720p -o C:\Users\YourName\Videos
```

Uninstall Global Commands With:
```bash
npm unlink node_yt_downloader
```

## Output Files

By Default, Downloaded Files Are Saved To the `./saved` Project Directory. You Can Override This With The `--output` Flag.

### File Naming Pattern

- **Video:** `{VideoTitle}.video.{format}`
- **Audio:** `{VideoTitle}.audio.{format}`

### Example

Default Output:
```
./saved/Shadow_Of_The_Day__Official_Music_Video____Linkin_Park.video.mp4
./saved/Shadow_Of_The_Day__Official_Music_Video____Linkin_Park.audio.webm
```

Custom Output:
```
C:\Users\YourName\Videos\Shadow_Of_The_Day__Official_Music_Video____Linkin_Park.video.mp4
```

## Supported Formats

- **Video:** mp4, webm
- **Audio:** webm (opus codec), m4a (aac codec)
- **Quality:** YouTube Available Qualities (Typically 144p Through 1080p+)

## Supported Platforms

- Windows (PowerShell / Command Prompt)
- macOS
- Linux

## Troubleshooting

### "Cannot find package" or Module Errors
```bash
npm install
```

### "Permission denied" (Linux/Mac)
Make Scripts Executable:
```bash
chmod +x yt.js
```

### "Video not found" or Download Fails
- Verify The Video ID Or URL Is Correct
- Ensure The Video Is Publicly Available
- Check Your Internet Connection
- Try A Different Video Quality
