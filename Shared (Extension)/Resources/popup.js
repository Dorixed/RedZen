// 存储开关状态的键名
const STORAGE_KEY = 'feedBlockEnabled';

// 获取开关元素
const toggleSwitch = document.getElementById('toggleFeed');

// 初始化开关状态
browser.storage.local.get(STORAGE_KEY).then(result => {
    // 默认为开启状态（true）
    const enabled = result[STORAGE_KEY] ?? true;
    toggleSwitch.checked = enabled;
    
    // 立即发送当前状态到 content script
    updateContentScript(enabled);
});

// 监听开关变化
toggleSwitch.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    
    // 保存状态
    browser.storage.local.set({ [STORAGE_KEY]: enabled });
    
    // 更新内容脚本
    updateContentScript(enabled);
});

// 更新内容脚本的函数
function updateContentScript(enabled) {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, { 
            type: 'TOGGLE_FEED_BLOCK',
            enabled: enabled 
        });
    });
}
