# GuessKar

Standalone responsive music guessing game. No dependencies, accounts or backend.

Open `dist/index.html` directly for the self-contained local-audio version, or serve/deploy `dist` for YouTube playback and consistent browser storage. The HTML includes its CSS and JavaScript; Google Fonts is optional and falls back to system fonts.

## Run

Node.js 22+: `npm run dev`, then visit http://localhost:5173.

`npm test` runs twenty automated tests, including simulated complete gameplay with an instrumented audio context, matching, CSV parsing, duplicate filtering, random offsets and default rules. `npm run build` checks JavaScript syntax; the deployable app already lives in `dist`.

## Deploy to Vercel

Import this directory as a repository into Vercel. Choose **Other**, Build Command `npm run build`, Output Directory `dist`. No environment variables required. `vercel.json` includes these settings. HTTPS is recommended for durable browser storage and Web Audio.

## Start playing

The five-song demo uses original, procedurally generated synth melodies. Preview and learn their names in My library. For your music, import local audio files (Artist - Title filenames recommended). Audio persists in this browser's IndexedDB; collection metadata and rules persist in localStorage. Browser data clearing or storage eviction removes them. Use audio you own or have permission to use.

Pick one or more collections, rounds and challenge mode. Play, type the song title, replay for free, or reveal a longer total snippet for fewer points. Wrong guesses do not reduce points. Skip scores zero. The final screen shows every answer and score. Unsupported audio and unavailable videos are replaced with remaining tracks; games shorten when no replacements remain.

## YouTube

Public playlists use the official YouTube Data API v3. Enable this API in Google Cloud Console, create a key restricted to this API and your deployed website's referrers (plus localhost if needed), and enter it in the import dialog. It is used only for that import, never saved. Paginated playlistItems requests retrieve the collection; batched videos requests check embedding availability, duration and live status. Deleted, missing, private, live, upcoming and non-embeddable entries are excluded. A summary reports skipped entries. Region, age, account and device restrictions can still appear at playback time. Existing collections remain usable; reimport to apply the new availability filter and save durations. A random round can also wait for the player's duration metadata.

**A blind YouTube game cannot be provided under the official player requirements.** The full player, title, video, controls, branding, thumbnails and ads stay visible. A pre-game disclosure and an inline warning explain that these can reveal the answer. No overlays, hiding, clipping, extraction or audio downloads are used. Use local audio for blind, precisely scheduled guessing.

The player remains in the same DOM position throughout the round: readiness updates, replays, reveals and answers never detach or reparent the iframe. Each snippet uses the official loadVideoById object form with the same startSeconds and a total endSeconds, plus independent polling installed before the playback command and a playing-time fallback cutoff. This avoids relying on a single PLAYING event or delayed/coarse media-time updates. A startup deadline, browser autoplay handling, explicit Stop control, round cancellation and stale-player guards cover failure cases. Browser user activation is preserved by issuing YouTube playback synchronously from the click handler, without awaiting Web Audio. Intro playback does not require getDuration to be ready on the first click.

All YouTube intervals are experimental and approximate. Even with native boundaries and watchdogs, the API cannot guarantee a 0.1-second audible cut; it may be silent or overrun. Startup delays, keyframe seeks, cross-origin message latency, ads, browser throttling and coarse media-time updates remain platform limitations. No hardware timing accuracy is claimed. Ads are not bypassed. If blocked, click the visible player's native play button once, then replay; otherwise wait or replace the track without using a round. No key is needed for iframe playback.

## Spotify CSV

No Spotify integration or API. Export playlist metadata manually, using Title / Track Name and Artist / Artist Name(s) columns. Quoted commas, line breaks and UTF-8 are supported. CSV tracks are not playable until you attach a local audio file in My library. Spotify URLs are not streamed or resolved.

## Timing

Local files are decoded completely before a round. AudioBufferSourceNode schedules playback 40 ms ahead of the AudioContext clock, with start(offset, duration) and stop(startTime + duration); the duration is not controlled by a JavaScript timeout. The 0.1 s stage therefore uses sample-accurate audio scheduling. Actual output latency is device/browser dependent; this is not a guarantee of acoustically measured hardware timing. Compressed file encoders may introduce silence. Random mode picks one offset per round with enough space for the longest snippet. Every stage replays from that offset. Switching tabs cancels playback to avoid timer-throttled YouTube overruns. Hardware output has not been measured.

## Verification limits

Real YouTube playlist import requires your restricted API key and network access; no live playlist credentials are bundled. YouTube embedding, ads, geographic restrictions and mobile autoplay vary by platform. No streaming service timing accuracy is promised.

Build verification passed. Browser QA and hardware audio timing were not verified: this execution environment blocked the local HTTP server and local-file browser preview. Hosted publication was attempted but its Git endpoint could not be resolved. No live hosted URL is claimed.
