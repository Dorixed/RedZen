browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
});

// 监听DOM变化
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // 查找并隐藏新加载的feed元素
        const feeds = document.querySelectorAll('.feeds-container, .note-list, .note-item, .explore-feed-container, .explore-feed-items');
        feeds.forEach(feed => {
            feed.style.display = 'none';
        });
    });
});

// 开始观察document的变化
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// 页面加载完成后立即执行一次
document.addEventListener('DOMContentLoaded', () => {
    const feeds = document.querySelectorAll('.feeds-container, .note-list, .note-item, .explore-feed-container, .explore-feed-items');
    feeds.forEach(feed => {
        feed.style.display = 'none';
    });
});
