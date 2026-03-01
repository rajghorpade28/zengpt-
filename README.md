# 🧘‍♂️ ZenGPT

> **Minimize distractions. Read on your own terms. Find your focus.**

Ever felt a bit overwhelmed or instantly distracted when ChatGPT fires back a massive wall of text before you're even ready to read it? 

**ZenGPT** is a minimalist, no-nonsense Chrome extension that automatically hides ChatGPT's responses by default. It replaces the immediate textual noise with a clean, satisfying "Reveal Answer" button, so *you* control when to consume the information. It's essentially a zen mode for your AI chats. 🌿

---

## ✨ Features
- 🙈 **Auto-hide magic:** Keeps the chat interface clean by hiding assistant responses instantly.
- 🔘 **Click-to-reveal:** Adds a smooth, unobtrusive button to show the text only when you're actually ready to focus on it.
- 🌊 **Streaming support:** Fully supports ChatGPT's live text streaming without breaking the layout or the hiding mechanism.
- 🗣️ **Preserves prompts:** Leaves your own messages alone so you never lose context of what you asked.
- 📄 **Export to PDF:** Need to save the conversation for later? Just click the stylish "Export to PDF" floating button in the bottom right corner. It automatically reveals all hidden content and formats the chat beautifully for offline reading without all the UI clutter.
- 🪶 **Feather-light & Private:** Super lightweight, requires minimal permissions, and absolutely no tracking or data collection. It just gets the job done locally on your machine.
- ⚙️ **Easy toggle:** Comes with a clean popup menu to easily toggle the auto-hiding feature on or off globally.

---

## 🚀 How to install & use it locally

Installing it takes less than a minute:

1. 🌐 Open Chrome and type `chrome://extensions/` in your URL bar.
2. 🛠️ Toggle on **Developer mode** in the top-right corner of the page.
3. 📂 Click the **Load unpacked** button (usually on the top-left).
4. 📁 Browse to and select this entire `-zengpt-` folder.
5. 🎉 That's it! Open [ChatGPT](https://chatgpt.com), ask it a question, and enjoy the peace and quiet.

---

## 🛠️ Under the Hood (For Developers)

The extension works by observing the DOM and injecting a CSS-based blur/hide overlay on ChatGPT's output containers (usually `.markdown` or `.prose` classes). 

**If it breaks:** 
ChatGPT updates its layout fairly often. If the extension stops hiding messages, OpenAI probably changed their class names or DOM structure. Feel free to open an issue or submit a pull request if `.markdown` or `.prose` (referenced in `content.js` and `styles.css`) gets updated.

---

*Stay focused. Stay Zen.* 🍵
