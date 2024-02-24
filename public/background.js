chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Installed')
});
chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    console.log("chrome", tabs[0].url);
});
