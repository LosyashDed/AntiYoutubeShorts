// Конфигурация
const SHORTS_REGEX = /\/shorts\//;

// Состояние
let isBlockingEnabled = true;

// Инициализация
init();

function init() {
    // Загрузка начальных настроек
    chrome.storage.local.get(['blockShorts'], (result) => {
        isBlockingEnabled = result.blockShorts !== undefined ? result.blockShorts : true;
        updateBlockingState();
    });

    // Слушаем сообщения от Popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'UPDATE_STATE') {
            isBlockingEnabled = request.isBlocked;
            updateBlockingState();
        }
    });

    // Запускаем наблюдение за страницей для отслеживания навигации и динамического контента
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

// Сканируем видеоплееры Shorts и замораживаем их, чтобы имитировать "ошибку сети/вечную загрузку"
function freezeShortsVideo() {
    if (!isBlockingEnabled) return;

    // Запускаем эту логику только если мы действительно на странице Shorts или видим плеер Shorts
    if (location.pathname.startsWith('/shorts/')) {
        const videos = document.querySelectorAll('ytd-reel-video-renderer video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                video.currentTime = 0; // Держим в начале
            }
            // Также принудительно выключаем звук на случай, если он включится
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
        if (url !== lastUrl) {
            lastUrl = url;
        }

        // ПОСТОЯННО замораживаем видео, если мы на шортсах. 
        // Делаем это при мутации, потому что YouTube может попытаться запустить автоплей или пересоздать элемент видео.
        freezeShortsVideo();
    });

    observer.observe(document, { subtree: true, childList: true });

    // Резервный интервал для отлова пропущенных событий воспроизведения
    setInterval(freezeShortsVideo, 500);
}
