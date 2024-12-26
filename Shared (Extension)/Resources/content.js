// 存储当前的启用状态
let isEnabled = true;

// 检查是否是首页
function isHomePage() {
    return window.location.pathname === '/' || 
           window.location.pathname === '/explore';
}

// 处理feed流显示
function handleFeedVisibility() {
    if (!isHomePage() || !isEnabled) return;
    
    const selectors = [
        '.feed-container',
        '.feeds-container',
        '.note-list',
        '.explore-feed-container',
        '[role="feed"]',
        '.home-feed',
        '.infinite-scroll-component'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.display = 'none';
        });
    });
}

// 显示feed流
function showFeed() {
    const selectors = [
        '.feed-container',
        '.feeds-container',
        '.note-list',
        '.explore-feed-container',
        '[role="feed"]',
        '.home-feed',
        '.infinite-scroll-component'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.display = '';
        });
    });
}

// 监听来自popup的消息
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_FEED_BLOCK') {
        isEnabled = message.enabled;
        if (isEnabled) {
            handleFeedVisibility();
        } else {
            showFeed();
        }
    }
});

// 获取初始状态
browser.storage.local.get('feedBlockEnabled').then(result => {
    isEnabled = result.feedBlockEnabled ?? true;
    if (isEnabled) {
        handleFeedVisibility();
    }
});

// 创建观察器
const observer = new MutationObserver(() => {
    if (isEnabled) {
        handleFeedVisibility();
    }
});

// 配置观察器
const config = {
    childList: true,
    subtree: true,
    attributes: true
};

// 开始观察
document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, config);
});

// 处理URL变化
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (isEnabled) {
            handleFeedVisibility();
        }
    }
}).observe(document, {subtree: true, childList: true});
