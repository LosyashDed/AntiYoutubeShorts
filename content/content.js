// Configuration
const SHORTS_REGEX = /\/shorts\//;

// State
let isBlockingEnabled = true;

// Initialize
init();

function init() {
    // Load initial settings
    chrome.storage.local.get(['blockShorts'], (result) => {
        isBlockingEnabled = result.blockShorts !== undefined ? result.blockShorts : true;
        updateBlockingState();
    });

    // Listen for messages from Popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'UPDATE_STATE') {
            isBlockingEnabled = request.isBlocked;
            updateBlockingState();
        }
    });

    // Start observing the page for navigation and dynamic content
    startObserver();
}

function updateBlockingState() {
    if (isBlockingEnabled) {
        document.body.classList.add('block-shorts');
        freezeShortsVideo();
    } else {
        document.body.classList.remove('block-shorts');
    }
}

// Scan for Shorts video players and freeze them to simulate "network error/eternal loading"
function freezeShortsVideo() {
    if (!isBlockingEnabled) return;

    // Only run this logic if we are actually on a Shorts page or see a Shorts player
    if (location.pathname.startsWith('/shorts/')) {
        const videos = document.querySelectorAll('ytd-reel-video-renderer video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                video.currentTime = 0; // Keep it at start
            }
            // Also force volume off just in case
            if (!video.muted) {
                video.muted = true;
            }
        });
    }
}

function startObserver() {
    let lastUrl = location.href;

    const observer = new MutationObserver((mutations) => {
        const url = location.href;

        // Check for URL changes if needed
        if (url !== lastUrl) {
            lastUrl = url;
        }

        // CONSTANTLY freeze video if we are on shorts. 
        // We do this on mutation because YouTube might try to autoplay or re-create the video element.
        freezeShortsVideo();
    });

    observer.observe(document, { subtree: true, childList: true });

    // Fallback interval to catch any missed play events
    setInterval(freezeShortsVideo, 500);
}
