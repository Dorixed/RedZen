// 检查是否是首页
function isHomePage() {
    return window.location.pathname === '/' || 
           window.location.pathname === '/explore';
}

// 处理feed流显示
function handleFeedVisibility() {
    if (isHomePage()) {
        // 添加调试日志
        console.log('当前页面是首页，准备隐藏feed流');
        
        // 小红书的主要feed流容器
        const selectors = [
            '.feed-container',              // 主feed流容器
            '.feeds-container',             // feed列表容器
            '.note-list',                   // 笔记列表
            '.explore-feed-container',      // 发现页feed容器
            '[role="feed"]',                // 带feed角色的元素
            '.home-feed',                   // 首页feed
            '.infinite-scroll-component'     // 无限滚动容器
        ];
        
        // 查找所有可能的feed元素
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`找到 ${selector} 元素:`, elements.length);
            elements.forEach(el => {
                el.style.display = 'none';
                console.log('隐藏元素:', el);
            });
        });
    }
}

// 创建一个 MutationObserver 实例
const observer = new MutationObserver((mutations) => {
    handleFeedVisibility();
});

// 配置 observer
const config = {
    childList: true,
    subtree: true,
    attributes: true
};

// 开始观察
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始观察DOM变化');
    handleFeedVisibility();
    observer.observe(document.body, config);
});

// 为了处理SPA路由变化
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        console.log('URL changed to:', url);
        handleFeedVisibility();
    }
}).observe(document, {subtree: true, childList: true});
