chrome.action.onClicked.addListener(async () => {
  // 打开/聚焦工具页（options_page）
  const url = chrome.runtime.getURL('pages/index.html');
  const tabs = await chrome.tabs.query({ url });
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url });
  }
});

