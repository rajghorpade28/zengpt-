// content.js
// Optimized for speed and performance.

(function () {
    'use strict';

    // Configuration
    const SELECTOR_ASSISTANT_MSG = '[data-message-author-role="assistant"]';
    const SELECTOR_CONTENT_WRAPPER = '.markdown, .prose';
    const CLASS_REVEALED = 'revealed-content';
    const CLASS_ENABLED = 'chatgpt-reveal-enabled';
    const BTN_CLASS = 'chatgpt-reveal-extension-btn';
    const BTN_CONTAINER_CLASS = 'chatgpt-reveal-extension-container';

    // Enable state (default true)
    let isExtensionEnabled = true;

    // --- State Management ---

    function updateState() {
        if (isExtensionEnabled) {
            document.documentElement.classList.add(CLASS_ENABLED);
        } else {
            document.documentElement.classList.remove(CLASS_ENABLED);
        }
    }

    function loadState() {
        chrome.storage.local.get(['enabled'], (result) => {
            isExtensionEnabled = result.enabled !== false;
            updateState();
        });
    }

    // --- DOM Processing ---

    function createRevealButton() {
        const btnContainer = document.createElement('div');
        btnContainer.className = BTN_CONTAINER_CLASS;

        const btn = document.createElement('button');
        btn.className = BTN_CLASS;
        btn.textContent = 'Reveal Answer';
        btn.type = 'button';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            // Dynamic path to content (handles React re-mounts)
            const container = e.target.closest('.' + BTN_CONTAINER_CLASS);
            if (!container) return;
            const contentNode = container.parentNode?.querySelector(SELECTOR_CONTENT_WRAPPER);
            if (!contentNode) return;

            const isRevealed = contentNode.classList.toggle(CLASS_REVEALED);
            btn.textContent = isRevealed ? 'Hide Answer' : 'Reveal Answer';
        });

        btnContainer.appendChild(btn);
        return btnContainer;
    }

    function processMessage(messageNode) {
        // Optimization: Use dataset to prevent re-processing same node
        if (messageNode.getAttribute('data-reveal-processed')) return;

        const contentNode = messageNode.querySelector(SELECTOR_CONTENT_WRAPPER);
        if (!contentNode) return;

        // Final check for existing button (redundancy check)
        if (contentNode.parentNode.querySelector('.' + BTN_CLASS)) {
            messageNode.setAttribute('data-reveal-processed', 'true');
            return;
        }

        const btnContainer = createRevealButton();
        contentNode.parentNode.insertBefore(btnContainer, contentNode);
        messageNode.setAttribute('data-reveal-processed', 'true');
    }

    // --- Efficient Mutation Observer ---

    const observer = new MutationObserver((mutations) => {
        // Fast path: Check only added nodes
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 1. Direct match (the added node IS a message)
                        if (node.matches(SELECTOR_ASSISTANT_MSG)) {
                            processMessage(node);
                        }
                        // 2. Contains messages (e.g. initial load or large container added)
                        // Use querySelectorAll only if it's a container that *might* have messages
                        // to avoid scanning every small span/div.
                        // However, ChatGPT structure is usually flat list of messages in a container.
                        else if (node.firstElementChild && (node.querySelector(SELECTOR_ASSISTANT_MSG))) {
                            const nested = node.querySelectorAll(SELECTOR_ASSISTANT_MSG);
                            for (const msg of nested) processMessage(msg);
                        }
                        // 3. Dynamic content update case (rare but possible):
                        // If the content wrapper itself is added to an *existing* message container.
                        else if (node.matches(SELECTOR_CONTENT_WRAPPER)) {
                            const parentMsg = node.closest(SELECTOR_ASSISTANT_MSG);
                            if (parentMsg) processMessage(parentMsg);
                        }
                    }
                }
            }
        }
    });

    // --- Initialization ---

    function injectExportPdfButton() {
        if (document.getElementById('zengpt-export-pdf-btn')) return;

        const pdfBtn = document.createElement('button');
        pdfBtn.id = 'zengpt-export-pdf-btn';
        pdfBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
        pdfBtn.title = 'Export current chat as PDF';

        pdfBtn.addEventListener('click', () => {
            // Reveal all hidden answers before printing
            const hiddenContents = document.querySelectorAll(SELECTOR_CONTENT_WRAPPER + ':not(.' + CLASS_REVEALED + ')');
            hiddenContents.forEach(node => {
                node.classList.add(CLASS_REVEALED);
                const btn = node.parentNode?.querySelector('.' + BTN_CLASS);
                if (btn) btn.textContent = 'Hide Answer';
            });

            // Trigger browser print dialog (which allows saving as PDF)
            window.print();
        });

        document.body.appendChild(pdfBtn);
    }

    function init() {
        // 1. Load preference immediately
        loadState();

        // 2. Start observer early (on documentElement if body not ready, but usually on body)
        // Since run_at is document_start, document.body might be null.
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            // Initial scan
            document.querySelectorAll(SELECTOR_ASSISTANT_MSG).forEach(processMessage);
            injectExportPdfButton();
        } else {
            // Wait for body to be available
            const initObserver = new MutationObserver(() => {
                if (document.body) {
                    initObserver.disconnect();
                    observer.observe(document.body, { childList: true, subtree: true });
                    document.querySelectorAll(SELECTOR_ASSISTANT_MSG).forEach(processMessage);
                    injectExportPdfButton();
                }
            });
            initObserver.observe(document.documentElement, { childList: true });
        }
    }

    // Listen for popup messages
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "toggleState") {
            isExtensionEnabled = request.enabled;
            updateState();
        }
    });

    init();

})();
