const STORAGE_KEY = 'feedBlockEnabled';
const STYLE_ID = 'redzen-feed-block-style';
const FEED_ROOT_ATTR = 'data-redzen-feed-root';

let isEnabled = true;
let syncTimer = null;
let lastUrl = location.href;

const FALLBACK_FEED_SELECTORS = [
    '.feed-container',
    '.feeds-container',
    '.note-list',
    '.explore-feed-container',
    '[role="feed"]',
    '.home-feed',
    '.infinite-scroll-component',
    '[class*="feed"]',
    '[class*="Feed"]',
    '[class*="waterfall"]',
    '[class*="Waterfall"]',
    '[class*="note-list"]'
];

function normalizePathname(pathname) {
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }

    return pathname;
}

function isHomePage() {
    const pathname = normalizePathname(window.location.pathname);
    return pathname === '/' || pathname === '/explore';
}

function getStyleElement() {
    return document.getElementById(STYLE_ID);
}

function ensureFeedStyle() {
    if (getStyleElement()) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        [${FEED_ROOT_ATTR}="true"],
        .feed-container,
        .feeds-container,
        .note-list,
        .explore-feed-container,
        [role="feed"],
        .home-feed,
        .infinite-scroll-component {
            display: none !important;
        }
    `;

    (document.head || document.documentElement).appendChild(style);
}

function removeFeedStyle() {
    getStyleElement()?.remove();
}

function clearMarkedFeedRoots() {
    document.querySelectorAll(`[${FEED_ROOT_ATTR}="true"]`).forEach((element) => {
        element.removeAttribute(FEED_ROOT_ATTR);
    });
}

function markFeedRoot(element) {
    if (!element || element === document.body || element === document.documentElement) {
        return;
    }

    element.setAttribute(FEED_ROOT_ATTR, 'true');
}

function markFallbackFeedRoots() {
    FALLBACK_FEED_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach(markFeedRoot);
    });
}

function isLikelyNoteLink(link) {
    const href = link.getAttribute('href') || '';

    if (!href.includes('/explore/')) {
        return false;
    }

    return href !== '/explore/' && href !== '/explore';
}

function markHeuristicFeedRoots() {
    const noteLinks = Array.from(document.querySelectorAll('a[href*="/explore/"]'))
        .filter(isLikelyNoteLink)
        .slice(0, 80);

    if (noteLinks.length < 6) {
        return;
    }

    const ancestorCounts = new Map();

    noteLinks.forEach((link) => {
        let current = link.parentElement;
        let depth = 0;

        while (current && depth < 7) {
            if (['DIV', 'SECTION', 'MAIN', 'UL'].includes(current.tagName)) {
                ancestorCounts.set(current, (ancestorCounts.get(current) || 0) + 1);
            }

            current = current.parentElement;
            depth += 1;
        }
    });

    const candidates = Array.from(ancestorCounts.entries())
        .filter(([element, count]) => {
            if (count < 6) {
                return false;
            }

            const noteCount = element.querySelectorAll('a[href*="/explore/"]').length;
            const imageCount = element.querySelectorAll('img').length;

            return noteCount >= 6 && imageCount >= 4;
        })
        .sort((left, right) => left[1] - right[1]);

    const selected = [];

    candidates.forEach(([element]) => {
        const overlapsExisting = selected.some((selectedElement) => {
            return selectedElement.contains(element) || element.contains(selectedElement);
        });

        if (!overlapsExisting) {
            selected.push(element);
        }
    });

    selected.slice(0, 3).forEach(markFeedRoot);
}

function syncFeedBlock() {
    const shouldBlock = isEnabled && isHomePage();

    if (!shouldBlock) {
        removeFeedStyle();
        clearMarkedFeedRoots();
        return;
    }

    ensureFeedStyle();
    clearMarkedFeedRoots();
    markFallbackFeedRoots();
    markHeuristicFeedRoots();
}

function scheduleSync() {
    if (syncTimer !== null) {
        clearTimeout(syncTimer);
    }

    syncTimer = window.setTimeout(() => {
        syncTimer = null;
        syncFeedBlock();
    }, 50);
}

browser.runtime.onMessage.addListener((message) => {
    if (message.type !== 'TOGGLE_FEED_BLOCK') {
        return;
    }

    isEnabled = message.enabled;
    scheduleSync();
});

browser.storage.local.get(STORAGE_KEY).then((result) => {
    isEnabled = result[STORAGE_KEY] ?? true;
    scheduleSync();
});

const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
    }

    scheduleSync();
});

function startObserving() {
    if (!document.body) {
        return;
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        startObserving();
        scheduleSync();
    }, { once: true });
} else {
    startObserving();
    scheduleSync();
}

window.addEventListener('popstate', scheduleSync);
window.addEventListener('hashchange', scheduleSync);
