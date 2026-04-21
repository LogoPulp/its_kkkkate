import { CONFIG } from './config.js'; 
import { playSfx, bgMusic } from './utils.js'; 

window.playSfx = playSfx;

let donorDataList = [];
let isDonorsLoaded = false;


export function setFloatingDonors(list) {
    donorDataList = list;
    isDonorsLoaded = true;
}


export function setupUI() {
    try {
        setupTiltEffect();
        setupStartupSound(); 
        initCozyParticles();
        setupCryptoCopy();
        setupHudControls(); 
    } catch (err) {
        console.error("UI Init Error:", err);
    }

    runPreloaderSequence();
}

function runPreloaderSequence() {
    const bar      = document.getElementById('preloader-bar');
    const percent  = document.getElementById('preloader-percent');
    const statusEl = document.getElementById('preloader-status');
    const loader   = document.getElementById('preloader');
    const tagline  = document.getElementById('pl-tagline');

    if (!loader) return;

    const phases = [
        { p: 20,  msg: 'ЗАГРУЖАЕМ УЮТ...', tag: 'INITIALIZING VIBES' },
        { p: 45,  msg: 'ГОТОВИМ ЧАЙ...', tag: 'BREWING COZINESS' },
        { p: 70,  msg: 'РАССЫПАЕМ СЕРДЕЧКИ...', tag: 'SPREADING LOVE' },
        { p: 90,  msg: 'ПОЧТИ ГОТОВО...', tag: 'SYNCING STREAM' },
        { p: 100, msg: 'ДОБРО ПОЖАЛОВАТЬ! 💜', tag: 'COZY STREAMER HUB' },
    ];

    let current = 0;

    const tick = () => {
        if (current >= phases.length) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.visibility = 'hidden';
                    loader.classList.add('finished');
                }, 1000);
            }, 800);
            return;
        }
        const { p, msg, tag } = phases[current];
        if (bar)     bar.style.width = `${p}%`;
        if (percent) percent.textContent = `${p}%`;
        if (statusEl) statusEl.textContent = msg;
        if (tagline) {
            tagline.style.opacity = '0';
            setTimeout(() => {
                tagline.textContent = tag;
                tagline.style.opacity = '0.8';
            }, 100);
        }
        current++;

        const delay = 300 + Math.random() * 300;
        setTimeout(tick, delay);
    };

    setTimeout(tick, 500);
}

function setupHudControls() {
    const musicBtn = document.getElementById('hud-music-btn');
    const sfxBtn   = document.getElementById('hud-sfx-btn');

    const updateHud = () => {
        if (musicBtn) {
            const isPlaying = !bgMusic.paused;
            musicBtn.classList.toggle('muted', !isPlaying);
            musicBtn.querySelector('.hud-status').textContent = isPlaying ? 'MUSIC: ON' : 'MUSIC: OFF';
        }
        if (sfxBtn) {
            const isMuted = localStorage.getItem('sfx_muted') === 'true';
            sfxBtn.classList.toggle('muted', isMuted);
            sfxBtn.querySelector('.hud-status').textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
        }
    };

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().catch(()=>{});
                localStorage.setItem('music_playing', 'true');
            } else {
                bgMusic.pause();
                localStorage.setItem('music_playing', 'false');
            }
            updateHud();
        });
    }

    if (sfxBtn) {
        sfxBtn.addEventListener('click', () => {
            const isMuted = localStorage.getItem('sfx_muted') === 'true';
            localStorage.setItem('sfx_muted', !isMuted);
            updateHud();
        });
    }

    // Sync HUD with player state changes
    bgMusic.addEventListener('play',  updateHud);
    bgMusic.addEventListener('pause', updateHud);
    
    updateHud();
}

function setupStartupSound() {
    // Плейсхолдер для стартового звука (мягкий поп)
    const audio = new Audio('assets/startup.mp3');
    audio.volume = 0.1; 

    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.catch(() => {
            const playOnInteraction = () => {
                const loader = document.getElementById('preloader');
                if (loader && loader.classList.contains('finished')) {
                    removeListeners();
                    return;
                }
                audio.play().catch(()=>{});
                removeListeners();
            };
            const removeListeners = () => {
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction);
            document.addEventListener('keydown', playOnInteraction);
        });
    }
}

function setupTiltEffect() {
    const cards = document.querySelectorAll('.tilt-effect');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            
            if (cx === 0 || cy === 0) return;

            const rx = ((y - cy) / cy) * -CONFIG.TILT_FORCE; 
            const ry = ((x - cx) / cx) * CONFIG.TILT_FORCE;
            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

function setupCryptoCopy() {
    const cryptoCards = document.querySelectorAll('.crypto-card');
    const toast = document.getElementById('toast-notification');

    cryptoCards.forEach(card => {
        const address = card.getAttribute('data-address');
        const infoSpan = card.querySelector('.crypto-info span');
        const hintSpan = card.querySelector('.copy-hint');

        const copyAction = (e) => {
            if (!address) return;
            
            navigator.clipboard.writeText(address).then(() => {
                // Toast
                if (toast) {
                    toast.classList.remove('active');
                    void toast.offsetWidth; 
                    toast.classList.add('active');
                    setTimeout(() => toast.classList.remove('active'), 2500);
                }

                // Heart particles
                spawnHeartAt(e.clientX, e.clientY);

                // Visual feedback on card
                card.classList.add('copy-success');
                
                const originalInfo = infoSpan ? infoSpan.textContent : "";
                const originalHint = hintSpan ? hintSpan.textContent : "";

                if (infoSpan) {
                    infoSpan.textContent = "СКОПИРОВАНО! 💜";
                    infoSpan.style.color = "var(--accent)";
                    infoSpan.style.fontWeight = "900";
                }
                
                if (hintSpan) {
                    hintSpan.textContent = "УСПЕШНО!";
                    hintSpan.style.color = "#22c55e";
                }

                // Click animation
                card.style.transform = "scale(0.95) translateY(0)";
                setTimeout(() => {
                    card.style.transform = "";
                }, 100);

                setTimeout(() => {
                    if (infoSpan) {
                        infoSpan.textContent = originalInfo;
                        infoSpan.style.color = "";
                        infoSpan.style.fontWeight = "";
                    }
                    if (hintSpan) {
                        hintSpan.textContent = originalHint;
                        hintSpan.style.color = "";
                    }
                    card.classList.remove('copy-success');
                }, 2000);
            }).catch(err => {
                console.error("Copy failed:", err);
            });
        };

        card.addEventListener('click', copyAction);
    });
}


window.spawnHeartAt = function(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart-animation';
    heart.innerHTML = ['💜', '🤍', '💖', '✨'][Math.floor(Math.random() * 4)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
}

function initCozyParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height + 100;
            this.size = Math.random() * 12 + 4;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = -(Math.random() * 0.8 + 0.3);
            this.opacity = Math.random() * 0.3 + 0.1;
            this.type = Math.random() < 0.2 ? 'heart' : 'orb';
            this.emoji = ['💜', '✨', '🌸'][Math.floor(Math.random() * 3)];
            this.oscillation = Math.random() * Math.PI * 2;
        }
        update(mouseX, mouseY) {
            this.y += this.speedY;
            this.oscillation += 0.02;
            this.x += this.speedX + Math.sin(this.oscillation) * 0.5;

            // Mouse influence
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) / 200;
                this.x += (dx / dist) * force * 2;
                this.y += (dy / dist) * force * 2;
            }

            if (this.y < -50 || this.x < -100 || this.x > canvas.width + 100) {
                this.reset();
                this.y = canvas.height + 50;
            }
        }
        draw() {
            ctx.globalAlpha = this.opacity;
            if (this.type === 'heart') {
                ctx.font = `${this.size}px Arial`;
                ctx.fillText(this.emoji, this.x, this.y);
            } else {
                ctx.fillStyle = '#d4a5ff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    let mouseX = -1000, mouseY = -1000;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update(mouseX, mouseY);
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}