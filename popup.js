document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggleSwitch');

    // Load saved state
    chrome.storage.local.get(['enabled'], function (result) {
        // Default to true if not set
        toggleSwitch.checked = result.enabled !== false;
    });

    // Save state on change
    toggleSwitch.addEventListener('change', function () {
        const isEnabled = toggleSwitch.checked;
        chrome.storage.local.set({ enabled: isEnabled }, function () {
            // Send message to content script to update immediately
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleState", enabled: isEnabled });
                }
            });
        });
    });
});
