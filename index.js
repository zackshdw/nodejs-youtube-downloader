import { Innertube, UniversalCache } from 'youtubei.js';
import { resolve } from 'path';
import { makePlayerRequest } from './utils/sabr-stream-factory.js';
import {
    createOutputStream,
    createStreamSink,
    createSabrStream,
    createMultiProgressBar,
    setupProgressBar
} from './utils/sabr-stream-factory.js';
import { EnabledTrackTypes } from 'googlevideo/utils';

function extractVideoId(input) {
    if (!input) return null;
    try {
        const url = new URL(input);
        if (url.searchParams.has('v')) return url.searchParams.get('v');
        if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    } catch (e) {
        if (/^[a-zA-Z0-9_-]{6,}$/.test(input)) return input;
    }
    return null;
}

function parseArgs(argv) {
    const args = { _: [] };
    const shortMap = { q: 'quality', f: 'format', o: 'output' };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (!a) continue;
        if (a.startsWith('--')) {
            const key = a.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('-')) {
                args[key] = next;
                i++;
            } else {
                args[key] = true;
            }
        } else if (a.startsWith('-') && !a.startsWith('--')) {
            const keyChar = a.slice(1);
            const mapped = shortMap[keyChar];
            const next = argv[i + 1];
            if (mapped) {
                if (next && !next.startsWith('-')) {
                    args[mapped] = next;
                    i++;
                } else {
                    args[mapped] = true;
                }
            } else {
                args._.push(a);
            }
        } else {
            args._.push(a);
        }
    }
    return args;
}

function cmdHelp() {
    console.log(`
NodeJS YouTube Downloader CLI

Installation:
  npm install

Usage:
  node yt.js help
  node yt.js info <videoUrl|videoId>
  node yt.js download <videoUrl|videoId> [options]

Options:
  -q  --quality  <quality>       Video Quality (360p,480p,720p,1080p) Or Audio Quality
  -f  --format   <format>        Container Format (mp4, webm)
  -o  --output   <directory>     Save Directory (Default: ./saved)

Examples:
  node yt.js info n1PCW0C1aiM
  node yt.js download n1PCW0C1aiM --quality 720p --format mp4
  node yt.js download n1PCW0C1aiM --quality AUDIO_QUALITY_MEDIUM
  node yt.js download n1PCW0C1aiM -q 720p -o C:\\Users\\YourName\\Videos

Audio Qualities:
  AUDIO_QUALITY_LOW, AUDIO_QUALITY_MEDIUM, AUDIO_QUALITY_HIGH

Global Install (optional):
  npm link    # Makes \`yt\` Available Globally

Output Files In saved Folder:
  {Title}.video.{format} And {Title}.audio.{format}

Credits:
  https://github.com/zackshdw/nodejs-youtube-downloader.git

`);

    process.exit(0);
}


async function cmdInfo(opts) {

    const urlOrId = opts._?.[0] || opts;
    const videoId = extractVideoId(urlOrId);
    if (!videoId) {
        console.error('Please Insert A Valid YouTube Video URL Or Video ID As First Argument After "info".');
        process.exit(1);
    }

    const innertube = await Innertube.create({ cache: new UniversalCache(true) });
    const playerResponse = await makePlayerRequest(innertube, videoId);

    console.log(`Title: ${playerResponse.video_details?.title}`);
    console.log(`Duration: ${playerResponse.video_details?.duration}`);
    console.log(`Author: ${playerResponse.video_details?.author}`);
    console.log(`Video ID: ${playerResponse.video_details?.id}`);
    console.log('Available Formats:');

    const formats = (playerResponse.streaming_data?.adaptive_formats || []).concat(playerResponse.streaming_data?.formats || []);
    const seen = new Set();
    formats.forEach((f) => {
        const mime = f.mime_type || 'unknown';
        const quality = f.quality_label || f.audio_quality || f.quality || 'unknown';
        const len = f.content_length ? `${(Number(f.content_length) / (1024 * 1024)).toFixed(2)} MB` : 'unknown';
        const key = `${mime}|${quality}|${len}`;
        if (seen.has(key)) return;
        seen.add(key);
        console.log(` - ${quality} | ${mime} | ${len}`);
    });
}

async function cmdDownload(opts) {

    const videoId = extractVideoId(opts._[0]);
    if (!videoId) {
        console.error('Could Not Determine Video URL Or Video ID. Provide As First Argument After "download".');
        process.exit(1);
    }

    const outputDir = opts.output ? resolve(opts.output) : undefined;

    const qualityStr = (opts.quality || '').toLowerCase();
    const formatStr = (opts.format || 'webm').toLowerCase();
    const isAudioQuality = qualityStr.includes('audio_quality');
    const audioOnly = isAudioQuality || opts.audioOnly;

    let audioQuality = 'AUDIO_QUALITY_MEDIUM';
    if (isAudioQuality) {
        audioQuality = opts.quality;
    }

    const options = {
        preferWebM: formatStr === 'webm',
        preferOpus: true,
        videoQuality: audioOnly ? undefined : (opts.quality || '720p'),
        audioQuality: audioQuality,
        enabledTrackTypes: audioOnly ? EnabledTrackTypes.AUDIO_ONLY : EnabledTrackTypes.VIDEO_AND_AUDIO
    };

    const progressBars = createMultiProgressBar();

    try {
        const { streamResults } = await createSabrStream(videoId, options, outputDir);
        const { videoStream, audioStream, selectedFormats, videoTitle } = streamResults;

        if (audioOnly) {
            const audioOutputStream = createOutputStream(videoTitle, selectedFormats.audioFormat.mimeType, outputDir);
            const audioBar = setupProgressBar(progressBars, 'audio', selectedFormats.audioFormat.contentLength || 0);
            await audioStream.pipeTo(createStreamSink(selectedFormats.audioFormat, audioOutputStream.stream, audioBar));
            progressBars.stop();
            console.log(`Audio Saved As: ${audioOutputStream.filePath}`);
            return;
        }

        const videoOutputStream = createOutputStream(videoTitle, selectedFormats.videoFormat.mimeType, outputDir);
        const videoBar = setupProgressBar(progressBars, 'video', selectedFormats.videoFormat.contentLength || 0);
        await videoStream.pipeTo(createStreamSink(selectedFormats.videoFormat, videoOutputStream.stream, videoBar));
        progressBars.stop();
        console.log(`Video Saved As: ${videoOutputStream.filePath}`);
    } catch (error) {
        console.error('Download Failed:', error);
        progressBars.stop();
        process.exit(1);
    }
}

async function main() {
    const argv = process.argv.slice(2);
    const command = argv[0];
    const rest = argv.slice(1);
    const parsed = parseArgs(rest);

    if (!command || command === 'help' || command === '--help') {
        cmdHelp();
        return;
    }

    if (command === 'info') {
        await cmdInfo(parsed);
        return;
    }

    if (command === 'download') {
        await cmdDownload(parsed);
        return;
    }

    console.error('Unknown Command:', command);
    process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
