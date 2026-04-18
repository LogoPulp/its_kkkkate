import { setupUI } from './modules/ui.js';
import { initSoundTriggers, copyToClipboard } from './modules/utils.js';
import { checkTwitchStatus, initClipsGallery } from './modules/twitch.js';
import { initSecrets } from './modules/secrets.js';
import { initDonorsBackground } from './modules/donors.js';
import { initCozyPlayer } from './modules/player.js';
import { updateGoalBar } from './modules/goal.js';

window.copyToClipboard = copyToClipboard;

document.addEventListener('DOMContentLoaded', () => {
    console.log(`%c its_kkkkate %c COZY HUB ONLINE \n`, 
        'background: #d4a5ff; color: #000; padding: 4px; font-weight: bold; border-radius: 4px;', 
        'color: #d4a5ff;'
    );

    setupUI();
    initSoundTriggers();
    initCozyPlayer();
    checkTwitchStatus();
    initClipsGallery();
    initSecrets();
    initDonorsBackground();
    updateGoalBar();
});

