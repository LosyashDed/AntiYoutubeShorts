document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shortsToggle');
  const statusText = document.getElementById('statusText');

  // Load saved state
  chrome.storage.local.get(['blockShorts'], (result) => {
    // Default to true if not set
    const isBlocked = result.blockShorts !== undefined ? result.blockShorts : true;
    toggle.checked = isBlocked;
    updateStatusText(isBlocked);
  });

  // Handle changes
  toggle.addEventListener('change', () => {
    const isBlocked = toggle.checked;
    chrome.storage.local.set({ blockShorts: isBlocked }, () => {
      updateStatusText(isBlocked);
      // Notify active tab to update immediately without reload
      // We query tabs that match youtube
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
