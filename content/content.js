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
        checkAndRedirect();
    } else {
        document.body.classList.remove('block-shorts');
    }
}

function checkAndRedirect() {
    if (!isBlockingEnabled) return;

    if (SHORTS_REGEX.test(window.location.href)) {
        const videoId = window.location.pathname.split('/').pop();
        if (videoId) {
            const newUrl = window.location.protocol + '//' + window.location.host + '/watch?v=' + videoId;
            window.location.replace(newUrl);
        }
    }
}

function startObserver() {
    // Observe DOM for changes (YouTube is SPA)
    // We use a MutationObserver to detect navigation or page updates.
    // Checking on every mutation is expensive, so we throttle or check specifics.
    // However, for URL redirection, we primarily need to know when URL changes.

    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            checkAndRedirect();
        }

        // Also re-apply checks if needed, but CSS handles visibility mostly.
        // Redirection is the main JS responsibility during nav.
    });

    observer.observe(document, { subtree: true, childList: true });

    // Fallback: Check constantly on interval just in case Observer misses a speedy history update (rare but possible)
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            checkAndRedirect();
        }
    }, 1000);
}
