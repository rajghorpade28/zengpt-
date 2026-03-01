// content.js
// 100% Zero-Polling, Zero-DOM-Mutation architecture for INSTANT chat loading.

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

    // Load state
    chrome.storage.local.get(['enabled'], (result) => {
        isExtensionEnabled = result.enabled !== false;
        updateState();
    });

    // Handle popup toggles
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "toggleState") {
            isExtensionEnabled = request.enabled;
            updateState();
        }
    });

    // Event Delegation: We listen globally so ZERO scanning is required.
    // CSS ::before handles the visual button cleanly without JS appending anything!
    document.addEventListener('click', (e) => {
        if (!isExtensionEnabled) return;

        // Ensure we don't interfere with the PDF export button
        if (e.target.closest('#zengpt-export-pdf-btn')) return;

        const msg = e.target.closest('[data-message-author-role="assistant"]');
        if (!msg) return;

        const isRevealed = msg.classList.contains('zengpt-revealed');

        if (!isRevealed) {
            msg.classList.add('zengpt-revealed');
        } else {
            // If revealed, clicking the top ~35 pixels acts as clicking "Hide Answer"
            const rect = msg.getBoundingClientRect();
            const clickY = e.clientY - rect.top;

            if (clickY >= 0 && clickY <= 38) {
                msg.classList.remove('zengpt-revealed');
            }
        }
    });

    // Inject PDF Button ONCE directly into the body avoiding React DOM overwrites
    function injectExportPdfButton() {
        if (document.getElementById('zengpt-export-pdf-btn')) return;

        const pdfBtn = document.createElement('button');
        pdfBtn.id = 'zengpt-export-pdf-btn';
        pdfBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> <span>Export PDF</span>';
        pdfBtn.title = 'Export current chat as PDF';

        pdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Reveal everything perfectly before printing
            document.querySelectorAll('[data-message-author-role="assistant"]').forEach(msg => {
                msg.classList.add('zengpt-revealed');
            });

            // Give layout a tiny split second to render the expanded text before printing
            setTimeout(() => {
                window.print();
            }, 100);
        });

        document.body.appendChild(pdfBtn);
    }

    // Try injecting instantly, or wait for body
    if (document.body) {
        injectExportPdfButton();
    } else {
        document.addEventListener('DOMContentLoaded', injectExportPdfButton);
        setTimeout(injectExportPdfButton, 1000);
    }

})();
