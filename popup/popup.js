document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shortsToggle');
  const statusText = document.getElementById('statusText');

  // Загружаем сохраненное состояние
  // Load saved state
  chrome.storage.local.get(['blockShorts'], (result) => {
    // По умолчанию true, если не задано
    // Default to true if not set
    const isBlocked = result.blockShorts !== undefined ? result.blockShorts : true;
    toggle.checked = isBlocked;
    updateStatusText(isBlocked);
  });

  // Обработка изменений
  // Handle changes
  toggle.addEventListener('change', () => {
    const isBlocked = toggle.checked;
    chrome.storage.local.set({ blockShorts: isBlocked }, () => {
      updateStatusText(isBlocked);
      // Уведомляем активную вкладку для мгновенного обновления без перезагрузки
      // Notify active tab for instant update without reload
      // Ищем вкладки, соответствующие youtube
      // Find tabs matching youtube
      chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_STATE', isBlocked: isBlocked });
        });
      });
    });
  });

  function updateStatusText(isBlocked) {
    statusText.textContent = isBlocked ? 'Blocking On' : 'Blocking Off';
    statusText.style.color = isBlocked ? '#fff' : '#aaa';
  }
});
