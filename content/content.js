// Конфигурация
// Configuration
const SHORTS_REGEX = /\/shorts\//;

// Состояние
// State
let isBlockingEnabled = true;

// Инициализация
// Initialization
init();

function init() {
    // Загрузка начальных настроек
    // Load initial settings
    chrome.storage.local.get(['blockShorts'], (result) => {
        isBlockingEnabled = result.blockShorts !== undefined ? result.blockShorts : true;
        updateBlockingState();
    });

    // Слушаем сообщения от Popup
    // Listen for messages from Popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'UPDATE_STATE') {
            isBlockingEnabled = request.isBlocked;
            updateBlockingState();
        }
    });

    // Запускаем наблюдение за страницей для отслеживания навигации и динамического контента
    // Start observing the page to track navigation and dynamic content
    startObserver();
}

function updateBlockingState() {
    if (isBlockingEnabled) {
        // Режим блокировки ВКЛЮЧЕН (по умолчанию):
        // Blocking mode ENABLED (default):
        // Убираем класс 'show-shorts', чтобы сработали CSS-правила html:not(.show-shorts)
        // Remove 'show-shorts' class so that html:not(.show-shorts) CSS rules apply
        if (document.body) document.body.classList.remove('show-shorts');
        document.documentElement.classList.remove('show-shorts');
        freezeShortsVideo();
    } else {
        // Режим блокировки ВЫКЛЮЧЕН:
        // Blocking mode DISABLED:
        // Добавляем класс 'show-shorts', чтобы отменить скрытие
        // Add 'show-shorts' class to cancel hiding
        if (document.body) document.body.classList.add('show-shorts');
        document.documentElement.classList.add('show-shorts');
    }
}

// Добавляем слушатель на загрузку DOM, чтобы убедиться, что body тоже получит класс, если он был null при запуске
// Add listener for DOM load to ensure body also gets the class if it was null at startup
document.addEventListener('DOMContentLoaded', updateBlockingState);

// Сканируем видеоплееры Shorts и замораживаем их, чтобы имитировать "ошибку сети/вечную загрузку"
// Scan Shorts video players and freeze them to mimic "network error/eternal loading"
function freezeShortsVideo() {
    if (!isBlockingEnabled) return;

    // Запускаем эту логику только если мы действительно на странице Shorts или видим плеер Shorts
    // Run this logic only if we are truly on a Shorts page or see a Shorts player
    if (location.pathname.startsWith('/shorts/')) {
        const videos = document.querySelectorAll('ytd-reel-video-renderer video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                video.currentTime = 0; // Держим в начале / Keep at the beginning
            }
            // Также принудительно выключаем звук на случай, если он включится
            // Also forcibly mute sound in case it turns on
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

        // Проверяем изменение URL, если нужно
        // Check for URL change if needed
        if (url !== lastUrl) {
            lastUrl = url;
        }

        // ПОСТОЯННО замораживаем видео, если мы на шортсах. 
        // CONSTANTLY freeze video if we are on shorts.
        // Делаем это при мутации, потому что YouTube может попытаться запустить автоплей или пересоздать элемент видео.
        // Do this on mutation because YouTube might try to start autoplay or recreate the video element.
        freezeShortsVideo();
    });

    observer.observe(document, { subtree: true, childList: true });

    // Резервный интервал для отлова пропущенных событий воспроизведения
    // Backup interval to catch missed playback events
    setInterval(freezeShortsVideo, 500);
}
