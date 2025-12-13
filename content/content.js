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
        checkAndBlock();
    } else {
        document.body.classList.remove('block-shorts');
        document.body.classList.remove('shorts-page-blocked');
    }
}

function checkAndBlock() {
    if (!isBlockingEnabled) return;

    if (SHORTS_REGEX.test(window.location.href)) {
        // Instead of redirecting, we simply block the view to simulate "eternal loading"
        document.body.classList.add('shorts-page-blocked');
    } else {
        document.body.classList.remove('shorts-page-blocked');
    }
}

function startObserver() {
    // Observe DOM for changes (YouTube is SPA)
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            checkAndBlock();
        }
        // Also ensure the class is there if we are on a shorts page (in case YouTube re-renders body)
        if (SHORTS_REGEX.test(url) && isBlockingEnabled && !document.body.classList.contains('shorts-page-blocked')) {
            document.body.classList.add('shorts-page-blocked');
        }
    });

    observer.observe(document, { subtree: true, childList: true });

    // Initial check
    checkAndBlock();
}
