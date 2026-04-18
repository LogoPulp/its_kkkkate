const sfxHover = new Audio('assets/hover.mp3'); sfxHover.volume = 0.15;
const sfxClick = new Audio('assets/click.mp3'); sfxClick.volume = 0.25;

export const soundOut = new Audio('assets/out.mp3'); soundOut.volume = 0.1;
export const soundComplete = new Audio('assets/complete.mp3'); soundComplete.volume = 0.1;

export const bgMusic = new Audio('assets/bg-music.mp3');
bgMusic.loop = true; 
bgMusic.volume = 0.15; 

export function playSfx(type) {
    if (localStorage.getItem('sfx_muted') === 'true') return;
    
    const sound = type === 'hover' ? sfxHover : sfxClick;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

export function initSoundTriggers() {
    // Music and SFX toggles are now handled by the cozy player module
    setupGlobalTriggers();
}

function setupGlobalTriggers() {
    const triggers = document.querySelectorAll('a, button, .s-btn, .donate-btn, .plastic-card, .system-trigger, .nav-btn, .stream-preview, .player-ctrl-btn, .playlist-item');
    triggers.forEach(el => {
        el.addEventListener('mouseenter', () => playSfx('hover'));
        el.addEventListener('mousedown', () => playSfx('click'));
    });
}


export function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const el = document.createElement("textarea");
    el.value = text; el.style.position="fixed"; el.style.opacity="0";
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand('copy'); showToast(); } catch (e) {}
    document.body.removeChild(el);
}

function showToast() {
    const t = document.getElementById("toast-notification");
    if(t) { 
        t.classList.add("active"); 
        t.innerHTML = '<i class="fas fa-check-circle" style="color:#22c55e;margin-right:8px;"></i> Скопировано!'; 
        setTimeout(()=>t.classList.remove("active"),2500); 
    }
}