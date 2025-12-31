/**
 * Ganadi Runner - Custom Implementation
 * Copyright (c) 2025 June Shim
 * Licensed under CC BY-NC 4.0 (Creative Commons Attribution-NonCommercial 4.0 International)
 */

// Background service worker for T-Rex Runner extension
// Intercepts offline pages and redirects to the game

// Track redirected tabs to avoid infinite loops
const redirectedTabs = new Set();

// Listen for network errors and redirect to game
chrome.webNavigation.onErrorOccurred.addListener((details) => {
  // Only handle main frame errors
  if (details.frameId !== 0) {
    return;
  }

  // Check if it's a network error (offline page)
  const networkErrors = [
    'net::ERR_INTERNET_DISCONNECTED',
    'net::ERR_NAME_NOT_RESOLVED',
    'net::ERR_CONNECTION_REFUSED',
    'net::ERR_NETWORK_CHANGED',
    'net::ERR_CONNECTION_TIMED_OUT',
    'net::ERR_CONNECTION_RESET'
  ];

  if (networkErrors.includes(details.error)) {
    // Avoid redirecting if we already redirected this tab
    if (redirectedTabs.has(details.tabId)) {
      return;
    }

    // Get the game page URL
    const gameUrl = chrome.runtime.getURL('game/index.html');
    
    // Mark this tab as redirected
    redirectedTabs.add(details.tabId);
    
    // Update the tab to show the game instead
    chrome.tabs.update(details.tabId, {
      url: gameUrl
    }, () => {
      // Clear the redirect flag after a delay
      setTimeout(() => {
        redirectedTabs.delete(details.tabId);
      }, 1000);
    });
  }
});

// Also handle chrome-error:// protocol pages
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) {
    return;
  }

  if (details.url && details.url.startsWith('chrome-error://chromewebdata/')) {
    // Avoid redirecting if we already redirected this tab
    if (redirectedTabs.has(details.tabId)) {
      return;
    }

    const gameUrl = chrome.runtime.getURL('game/index.html');
    
    // Mark this tab as redirected
    redirectedTabs.add(details.tabId);
    
    chrome.tabs.update(details.tabId, {
      url: gameUrl
    }, () => {
      // Clear the redirect flag after a delay
      setTimeout(() => {
        redirectedTabs.delete(details.tabId);
      }, 1000);
    });
  }
}, {
  url: [{ urlPrefix: 'chrome-error://' }]
});

// Clean up redirected tabs when they're closed
chrome.tabs.onRemoved.addListener((tabId) => {
  redirectedTabs.delete(tabId);
});

