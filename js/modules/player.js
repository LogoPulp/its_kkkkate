/**
 * Cozy Music Player — Premium floating widget
 * Handles playback, progress, volume, playlist, SFX toggle, collapse/expand
 */
import { playSfx, bgMusic } from './utils.js';

// ─── Playlist ──────────────────────────────────────────────
const PLAYLIST = [
    { title: 'Cozy Vibes OST',    artist: 'its_kkkkate', src: 'assets/bg-music.mp3' },
    // Add more tracks here:
    // { title: 'Chill Evening',   artist: 'its_kkkkate', src: 'assets/track2.mp3' },
];

let currentTrackIndex = 0;
let isPlaying = false;
let isSeeking = false;
let animFrameId = null;

// ─── DOM References ────────────────────────────────────────
const $ = (id) => document.getElementById(id);

export function initCozyPlayer() {
    const player        = $('cozy-player');
    const miniToggle    = $('player-mini-toggle');
    const collapseBtn   = $('player-collapse-btn');
    const playBtn       = $('player-play-btn');
    const playIcon      = $('player-play-icon');
    const prevBtn       = $('player-prev-btn');
    const nextBtn       = $('player-next-btn');
    const progressTrack = $('player-progress-track');
    const progressFill  = $('player-progress-fill');
    const timeCurrent   = $('player-time-current');
    const timeTotal     = $('player-time-total');
    const volumeSlider  = $('player-volume');
    const volIcon       = $('player-vol-icon');
    const sfxBtn        = $('player-sfx-btn');
    const playlistBtn   = $('player-playlist-btn');
    const playlistWrap  = $('player-playlist-wrap');
    const playlistEl    = $('player-playlist');
    const trackNameEl   = $('player-track-name');
    const artistEl      = $('player-artist');
    const statusLabel   = $('player-status-label');

    if (!player) return;

    // ─── Init Audio ────────────────────────────────────────
    bgMusic.loop = PLAYLIST.length === 1; // Loop only if single track
    
    // Restore volume
    const savedVol = localStorage.getItem('player_volume');
    if (savedVol !== null) {
        bgMusic.volume = parseFloat(savedVol);
        if (volumeSlider) volumeSlider.value = Math.round(bgMusic.volume * 100);
    }

    // ─── Build Playlist UI ─────────────────────────────────
    function buildPlaylist() {
        if (!playlistEl) return;
        playlistEl.innerHTML = '';
        
        PLAYLIST.forEach((track, i) => {
            const item = document.createElement('div');
            item.className = 'playlist-item' + (i === currentTrackIndex ? ' active' : '');
            item.innerHTML = `
                <span class="pl-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="pl-title">${track.title}</span>
                <div class="pl-eq">
                    <span></span><span></span><span></span>
                </div>
                <span class="pl-duration">—:——</span>
            `;
            item.addEventListener('click', () => {
                loadTrack(i);
                play();
            });
            playlistEl.appendChild(item);
        });
    }

    // ─── Track Loading ─────────────────────────────────────
    function loadTrack(index) {
        if (index < 0) index = PLAYLIST.length - 1;
        if (index >= PLAYLIST.length) index = 0;
        currentTrackIndex = index;

        const track = PLAYLIST[currentTrackIndex];
        bgMusic.src = track.src;
        bgMusic.load();
        
        if (trackNameEl) trackNameEl.textContent = track.title;
        if (artistEl) artistEl.textContent = track.artist;
        
        buildPlaylist(); // Highlight active
    }

    // ─── Play / Pause ──────────────────────────────────────
    function play() {
        bgMusic.play().then(() => {
            isPlaying = true;
            updatePlayUI();
            localStorage.setItem('music_playing', 'true');
            startProgressLoop();
        }).catch((err) => {
            console.log('Playback blocked:', err);
        });
    }

    function pause() {
        bgMusic.pause();
        isPlaying = false;
        updatePlayUI();
        localStorage.setItem('music_playing', 'false');
        cancelAnimationFrame(animFrameId);
    }

    function togglePlay() {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }

    function updatePlayUI() {
        if (playIcon) {
            playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
        if (statusLabel) {
            statusLabel.textContent = isPlaying ? 'NOW PLAYING' : 'PAUSED';
        }
        if (player) {
            player.classList.toggle('playing', isPlaying);
        }
    }

    // ─── Progress Loop ─────────────────────────────────────
    function startProgressLoop() {
        function update() {
            if (!isSeeking && bgMusic.duration && isFinite(bgMusic.duration)) {
                const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
                if (progressFill) progressFill.style.width = pct + '%';
                if (timeCurrent) timeCurrent.textContent = formatTime(bgMusic.currentTime);
                if (timeTotal) timeTotal.textContent = formatTime(bgMusic.duration);
            }
            if (isPlaying) {
                animFrameId = requestAnimationFrame(update);
            }
        }
        animFrameId = requestAnimationFrame(update);
    }

    function formatTime(sec) {
        if (!sec || !isFinite(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    // ─── Seek ──────────────────────────────────────────────
    if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
            if (!bgMusic.duration || !isFinite(bgMusic.duration)) return;
            const rect = progressTrack.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            bgMusic.currentTime = pct * bgMusic.duration;
        });
    }

    // ─── Volume ────────────────────────────────────────────
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) / 100;
            bgMusic.volume = val;
            localStorage.setItem('player_volume', val);
            updateVolumeIcon(val);
        });
    }

    if (volIcon) {
        volIcon.addEventListener('click', () => {
            if (bgMusic.volume > 0) {
                volIcon._prevVol = bgMusic.volume;
                bgMusic.volume = 0;
                if (volumeSlider) volumeSlider.value = 0;
            } else {
                bgMusic.volume = volIcon._prevVol || 0.15;
                if (volumeSlider) volumeSlider.value = Math.round(bgMusic.volume * 100);
            }
            localStorage.setItem('player_volume', bgMusic.volume);
            updateVolumeIcon(bgMusic.volume);
        });
    }

    function updateVolumeIcon(vol) {
        if (!volIcon) return;
        volIcon.className = 'player-volume-icon fas ' + 
            (vol === 0 ? 'fa-volume-mute' : vol < 0.4 ? 'fa-volume-low' : 'fa-volume-up');
    }

    // ─── SFX Toggle ────────────────────────────────────────
    if (sfxBtn) {
        const updateSfxUI = () => {
            const isMuted = localStorage.getItem('sfx_muted') === 'true';
            sfxBtn.classList.toggle('sfx-off', isMuted);
        };

        sfxBtn.addEventListener('click', () => {
            const isMuted = localStorage.getItem('sfx_muted') === 'true';
            localStorage.setItem('sfx_muted', !isMuted);
            if (!isMuted) playSfx('click');
            updateSfxUI();
        });

        updateSfxUI();
    }

    // ─── Prev / Next ───────────────────────────────────────
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // If more than 3 seconds in, restart; otherwise go previous
            if (bgMusic.currentTime > 3) {
                bgMusic.currentTime = 0;
            } else {
                loadTrack(currentTrackIndex - 1);
                if (isPlaying) play();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            loadTrack(currentTrackIndex + 1);
            if (isPlaying) play();
        });
    }

    // Auto-next track at end
    bgMusic.addEventListener('ended', () => {
        if (PLAYLIST.length > 1) {
            loadTrack(currentTrackIndex + 1);
            play();
        }
    });

    // ─── Playlist Toggle ───────────────────────────────────
    if (playlistBtn && playlistWrap) {
        playlistBtn.addEventListener('click', () => {
            playlistWrap.classList.toggle('open');
            playlistBtn.classList.toggle('active');
        });
    }

    // ─── Collapse / Expand ─────────────────────────────────
    if (miniToggle) {
        miniToggle.addEventListener('click', () => {
            player.classList.remove('collapsed');
        });
    }

    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            player.classList.add('collapsed');
            // Close playlist too
            if (playlistWrap) playlistWrap.classList.remove('open');
        });
    }

    // ─── Play Button ───────────────────────────────────────
    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }

    // ─── Duration loaded — update playlist durations ───────
    bgMusic.addEventListener('loadedmetadata', () => {
        if (timeTotal) timeTotal.textContent = formatTime(bgMusic.duration);
        
        // Update duration in playlist
        const items = playlistEl?.querySelectorAll('.playlist-item');
        if (items && items[currentTrackIndex]) {
            const durEl = items[currentTrackIndex].querySelector('.pl-duration');
            if (durEl) durEl.textContent = formatTime(bgMusic.duration);
        }
    });

    // ─── Keyboard Shortcut: Space to toggle play ───────────
    document.addEventListener('keydown', (e) => {
        // Don't interfere with input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space' && !e.target.closest('.console-wrapper')) {
            e.preventDefault();
            togglePlay();
        }
    });

    // ─── Initialize ────────────────────────────────────────
    // Load first track info
    const firstTrack = PLAYLIST[currentTrackIndex];
    if (trackNameEl) trackNameEl.textContent = firstTrack.title;
    if (artistEl) artistEl.textContent = firstTrack.artist;
    updateVolumeIcon(bgMusic.volume);
    buildPlaylist();

    // Check if music was playing last session
    const wasMusicPlaying = localStorage.getItem('music_playing') !== 'false';
    if (wasMusicPlaying) {
        // Try to autoplay — browsers may block this
        const startPromise = bgMusic.play();
        if (startPromise !== undefined) {
            startPromise.then(() => {
                isPlaying = true;
                updatePlayUI();
                startProgressLoop();
            }).catch(() => {
                // Autoplay blocked — wait for user interaction
                const tryStart = () => {
                    if (localStorage.getItem('music_playing') !== 'false') {
                        bgMusic.play().then(() => {
                            isPlaying = true;
                            updatePlayUI();
                            startProgressLoop();
                            cleanup();
                        }).catch(() => {});
                    }
                };
                const cleanup = () => {
                    document.removeEventListener('click', tryStart);
                    document.removeEventListener('keydown', tryStart);
                    document.removeEventListener('touchstart', tryStart);
                };
                document.addEventListener('click', tryStart);
                document.addEventListener('keydown', tryStart);
                document.addEventListener('touchstart', tryStart);
            });
        }
    }
}
