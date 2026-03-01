(function () {
    'use strict';

    let isExtensionEnabled = true;
    const CLASS_ENABLED = 'chatgpt-reveal-enabled';

    function updateState() {
        if (isExtensionEnabled) {
            document.documentElement.classList.add(CLASS_ENABLED);
        } else {
            document.documentElement.classList.remove(CLASS_ENABLED);
        }
    }

    chrome.storage.local.get(['enabled'], (result) => {
        isExtensionEnabled = result.enabled !== false;
        updateState();
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "toggleState") {
            isExtensionEnabled = request.enabled;
            updateState();
        }
    });

    document.addEventListener('click', (e) => {
        if (!isExtensionEnabled) return;

        if (e.target.closest('#zengpt-export-pdf-btn')) return;

        const msg = e.target.closest('[data-message-author-role="assistant"]');
        if (!msg) return;

        const isRevealed = msg.classList.contains('zengpt-revealed');

        if (!isRevealed) {
            msg.classList.add('zengpt-revealed');
        } else {
            const rect = msg.getBoundingClientRect();
            const clickY = e.clientY - rect.top;

            if (clickY >= 0 && clickY <= 38) {
                msg.classList.remove('zengpt-revealed');
            }
        }
    });

    function injectExportPdfButton() {
        if (document.getElementById('zengpt-export-pdf-btn')) return;

        const pdfBtn = document.createElement('button');
        pdfBtn.id = 'zengpt-export-pdf-btn';
        pdfBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> <span>Export PDF</span>';
        pdfBtn.title = 'Export current chat as PDF';

        pdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            document.querySelectorAll('[data-message-author-role="assistant"]').forEach(msg => {
                msg.classList.add('zengpt-revealed');
            });

            setTimeout(() => {
                window.print();
            }, 100);
        });

        document.body.appendChild(pdfBtn);
    }

    if (document.body) {
        injectExportPdfButton();
    } else {
        document.addEventListener('DOMContentLoaded', injectExportPdfButton);
        setTimeout(injectExportPdfButton, 1000);
    }

})();
