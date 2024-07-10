chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});


chrome.contextMenus.create({
    id: "wordlookup",
    title: "Look up",
    contexts: ['all']
    });

    
    chrome.contextMenus.onClicked.addListener((item, tab) => {
        
        chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["context-script.js"]
    });
    });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let searchWord=message.selectedText?.replaceAll("\n"," ").replaceAll("\t"," ").split(" ")[0].trim().toLowerCase();
    if(!searchWord)return;
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+searchWord)
    .then(response=>response.json())
    .then(data=>
    {
        if(data.title=="No Definitions Found"||!Array.isArray(data))
        {
            sendResponse("No Definitions Found");
        }
        else{
            chrome.storage.local.get("recent-words",(olddata)=>{
                if(olddata["recent-words"])
                {
                    if(olddata["recent-words"].length>9)
                    {
                        olddata["recent-words"]=[...olddata["recent-words"].slice(0,9)];
                    }
                    let newData=[data,...olddata["recent-words"]];
                    chrome.storage.local.set({"recent-words":newData});
                }
                else{
                    chrome.storage.local.set({"recent-words":[data]});
                }
            });
            sendResponse(data[0]?.meanings[0]?.definitions[0]?.definition);
        }
    })
    return true;
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "make-text-selectable") {

            chrome.storage.local.set({ "make-text-selectable": true });

                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    if (tabs.length > 0) {
                    chrome.tabs.reload(tabs[0].id);
                    }
                });
        }
        if(request.message==="remove-make-text-selectable"){
            chrome.storage.local.set({ "make-text-selectable": false });

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
                }
            });
        }

        if (request.message === "show-search-icon") {
            chrome.storage.local.set({ "show-search-icon": true });
        }
        if (request.message === "remove-show-search-icon") {
            chrome.storage.local.set({ "show-search-icon": false });
        }
    }
);


