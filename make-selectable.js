window.onload = function() {
chrome.storage.local.get("make-text-selectable", (data) => {
    if(data["make-text-selectable"]){
        const allElements = document.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6, a, li');

        allElements.forEach(element => {
            element.style.pointerEvents = 'auto';
            element.style.userSelect = 'text';
        });
    }
});
}



