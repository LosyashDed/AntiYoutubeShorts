document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shortsToggle');
  const statusText = document.getElementById('statusText');

  // Загружаем сохраненное состояние
  chrome.storage.local.get(['blockShorts'], (result) => {
    // По умолчанию true, если не задано
    const isBlocked = result.blockShorts !== undefined ? result.blockShorts : true;
    toggle.checked = isBlocked;
    updateStatusText(isBlocked);
  });

  // Обработка изменений
  toggle.addEventListener('change', () => {
    const isBlocked = toggle.checked;
    chrome.storage.local.set({ blockShorts: isBlocked }, () => {
      updateStatusText(isBlocked);
      // Уведомляем активную вкладку для мгновенного обновления без перезагрузки
      // Ищем вкладки, соответствующие youtube
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
