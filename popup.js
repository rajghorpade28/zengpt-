document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggleSwitch');

    chrome.storage.local.get(['enabled'], function (result) {
        toggleSwitch.checked = result.enabled !== false;
    });

    toggleSwitch.addEventListener('change', function () {
        const isEnabled = toggleSwitch.checked;
        chrome.storage.local.set({ enabled: isEnabled }, function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleState", enabled: isEnabled });
                }
            });
        });
    });
});
