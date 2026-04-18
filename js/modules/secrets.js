import { playSfx, bgMusic } from './utils.js'; 

const SECRET_CODES = {
    'kate':   { type: 'video', src: 'assets/cute-cat.mp4' },
    'heart':  { type: 'image-peek', src: 'assets/heart-icon.png' },
    'dance': { type: 'barrel-roll' }
};

let clickHistory = [];
const CLICK_THRESHOLD = 24;
const TIME_WINDOW = 1000;
const PIXEL_VARIANCE = 5;
let isActing = false;

export function initSecrets() {
    setupKeyboardSecrets();
    setupAutoclickerDetector();
}

function setupAutoclickerDetector() {
    document.addEventListener('click', (e) => {
        if (isActing) return;

        const now = Date.now();
        const x = e.clientX;
        const y = e.clientY;

        clickHistory.push({ time: now, x: x, y: y });

        clickHistory = clickHistory.filter(c => now - c.time < TIME_WINDOW);

        if (clickHistory.length >= CLICK_THRESHOLD) {
            const minX = Math.min(...clickHistory.map(c => c.x));
            const maxX = Math.max(...clickHistory.map(c => c.x));
            const minY = Math.min(...clickHistory.map(c => c.y));
            const maxY = Math.max(...clickHistory.map(c => c.y));

            const varianceX = maxX - minX;
            const varianceY = maxY - minY;

            if (varianceX < PIXEL_VARIANCE && varianceY < PIXEL_VARIANCE) {
                triggerMeow();
                clickHistory = []; 
            }
        }
    });
}

function triggerMeow() {
    isActing = true;

    // Пытаемся проиграть звук (плейсхолдер)
    const audio = new Audio('assets/meow.mp3'); 
    audio.volume = 0.6; 

    const overlay = document.createElement('div');
    overlay.className = 'cozy-secret-overlay';
    
    const heart = document.createElement('div');
    heart.innerHTML = '💜';
    heart.style.fontSize = '10rem';
    heart.style.filter = 'drop-shadow(0 0 30px var(--accent))';
    heart.style.transform = 'scale(0)';
    heart.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    overlay.appendChild(heart);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        audio.play().catch(e => console.warn("Meow sound missing or blocked:", e));

        setTimeout(() => {
            heart.style.transform = 'scale(1)';
        }, 100);
    });

    setTimeout(() => {
        overlay.style.opacity = '0';
        heart.style.transform = 'scale(0)';
        
        setTimeout(() => {
            overlay.remove();
            isActing = false;
        }, 500);
    }, 2000);
}

function setupKeyboardSecrets() {
    let keyBuffer = '';
    const bufferLimit = 15; 

    document.addEventListener('keydown', (e) => {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > bufferLimit) keyBuffer = keyBuffer.slice(-bufferLimit);
        
        Object.keys(SECRET_CODES).forEach(code => {
            if (keyBuffer.includes(code)) {
                activateSecret(SECRET_CODES[code]);
                keyBuffer = ''; 
            }
        });
    });
}

function activateSecret(data) {
    if (data.type === 'video') {
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.innerHTML = `<video class="secret-video" autoplay><source src="${data.src}" type="video/mp4"></video>`;
        document.body.appendChild(overlay);
        const v = overlay.querySelector('video');
        v.volume = 0.6;
        const finish = () => { overlay.remove(); };
        v.onended = finish;
        overlay.onclick = finish;
    }
    else if (data.type === 'image-peek') {
        playSfx('hover');
        const img = document.createElement('div');
        img.innerHTML = '💜';
        img.style.position = 'fixed';
        img.style.bottom = '-100px';
        img.style.right = '50px';
        img.style.fontSize = '5rem';
        img.style.transition = 'bottom 0.5s ease-out';
        img.style.zIndex = '9999';
        
        document.body.appendChild(img);
        setTimeout(() => img.style.bottom = '20px', 50);
        setTimeout(() => { 
            img.style.bottom = '-100px'; 
            setTimeout(() => img.remove(), 1000); 
        }, 3000);
    }
    else if (data.type === 'barrel-roll') {
        playSfx('click');
        document.body.classList.add('barrel-roll');
        setTimeout(() => document.body.classList.remove('barrel-roll'), 2000);
    }
}