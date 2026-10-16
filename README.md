# GuessKar

Standalone responsive music guessing game. No dependencies, accounts or backend.

Open `dist/index.html` directly for the self-contained local-audio version, or serve/deploy `dist` for YouTube playback and consistent browser storage. The HTML includes its CSS and JavaScript; Google Fonts is optional and falls back to system fonts.

## Run

Node.js 22+: `npm run dev`, then visit http://localhost:5173.

`npm test` runs seven automated tests, including simulated complete gameplay with an instrumented audio context, matching, CSV parsing, duplicate filtering, random offsets and default rules. `npm run build` checks JavaScript syntax; the deployable app already lives in `dist`.

## Deploy to Vercel

Import this directory as a repository into Vercel. Choose **Other**, Build Command `npm run build`, Output Directory `dist`. No environment variables required. `vercel.json` includes these settings. HTTPS is recommended for durable browser storage and Web Audio.

## Start playing

The five-song demo uses original, procedurally generated synth melodies. Preview and learn their names in My library. For your music, import local audio files (Artist - Title filenames recommended). Audio persists in this browser's IndexedDB; collection metadata and rules persist in localStorage. Browser data clearing or storage eviction removes them. Use audio you own or have permission to use.

Pick one or more collections, rounds and challenge mode. Play, type the song title, replay for free, or reveal a longer total snippet for fewer points. Wrong guesses do not reduce points. Skip scores zero. The final screen shows every answer and score. Unsupported audio and unavailable videos are replaced with remaining tracks; games shorten when no replacements remain.

## YouTube

Public playlist import uses the official YouTube Data API v3, with paginated playlistItems requests (50 items per request). In Google Cloud Console enable YouTube Data API v3, create an API key, restrict the key to that API and HTTP referrers for your domain (plus localhost for development). Paste it into the import dialog. The key is sent directly to Google and is never saved. No key is needed for the official IFrame Player API used for playback. Quotas and embedding restrictions apply; metadata guesses from video titles can be corrected in My library. Up to 2,000 tracks per import.

YouTube's player remains fully visible, at least 200 × 200 pixels, with controls, branding, title and ads intact. These may reveal answers. No audio is extracted, downloaded or separated from video. YouTube cannot guarantee 0.1-second snippets: command latency, keyframe seeking, buffering, ads, and delayed state/time updates can cause significant overruns. All YouTube stages are explicitly approximate. Playback cutoff monitors media time rather than timing from the initial play request. If playback does not start, use the visible player to allow playback, then replay. Replace track allows skipping ads/unavailable content without bypassing it or losing a round.

## Spotify CSV

No Spotify integration or API. Export playlist metadata manually, using Title / Track Name and Artist / Artist Name(s) columns. Quoted commas, line breaks and UTF-8 are supported. CSV tracks are not playable until you attach a local audio file in My library. Spotify URLs are not streamed or resolved.

## Timing

Local files are decoded completely before a round. AudioBufferSourceNode schedules playback 40 ms ahead of the AudioContext clock, with start(offset, duration) and stop(startTime + duration); the duration is not controlled by a JavaScript timeout. The 0.1 s stage therefore uses sample-accurate audio scheduling. Actual output latency is device/browser dependent; this is not a guarantee of acoustically measured hardware timing. Compressed file encoders may introduce silence. Random mode picks one offset per round with enough space for the longest snippet. Every stage replays from that offset. Switching tabs cancels playback to avoid timer-throttled YouTube overruns. Hardware output has not been measured.

## Verification limits

Real YouTube playlist import requires your restricted API key and network access; no live playlist credentials are bundled. YouTube embedding, ads, geographic restrictions and mobile autoplay vary by platform. No streaming service timing accuracy is promised.

Build verification passed. Browser QA and hardware audio timing were not verified: this execution environment blocked the local HTTP server and local-file browser preview. Hosted publication was attempted but its Git endpoint could not be resolved. No live hosted URL is claimed.
