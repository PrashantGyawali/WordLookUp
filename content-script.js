console.log('content-script.js')


let mouseStartY=0,mouseEndY=0,mouseStartX=0,mouseEndX=0;
var t=new Date().getTime();

window.addEventListener("mousedown",(e)=>{
    mouseStartY=e.pageY;
    mouseStartX=e.pageX;
    chrome.storage.local.get("show-search-icon",(data)=>{
        console.log(data);
        if( !data["show-search-icon"] || data["show-search-icon"]==false )
        {
            window.removeEventListener("mouseup",getSelectedWord);
            return; 
        }
        else{
            console.log("show-search-icon");
            window.addEventListener("mouseup",getSelectedWord);
        }});
});

async function getSelectedWord(){

    let selection=window.getSelection();

    let selectedText=selection.toString().trim().replaceAll("\n"," ").split(" ").reduce((final,e)=>final.concat(e.trim()," "),"").trim();
    
    if(selectedText.split(" ").length!=1 || selectedText==" " || selectedText=="")return;
    if(document.querySelector(".word-definition-lookup-input") || document.querySelector(".word-definition"))return;


    let range       = selection.getRangeAt(0);
    let selectionDimensions = range.getClientRects();
    
    let left,right,bottom,top;

    if(selectionDimensions && selectionDimensions[0]){
        left=selectionDimensions[0].left;
        right=selectionDimensions[0].right;
        bottom=selectionDimensions[0].bottom;
        top=selectionDimensions[0].top;
    }
    else{
        left=selectionDimensions.left;
        right=selectionDimensions.right;
        bottom=selectionDimensions.bottom;
        top=selectionDimensions.top;
    }
    
    
    let option=document.createElement("button");
    option.innerHTML="🔍?";
    option.classList.add("word-definition-lookup-input");
    option.style.top=((top+bottom)/2 +window.scrollY)+"px";
    option.style.left=(right+20+window.scrollX)+"px";
    document.body.appendChild(option);

        option.addEventListener("mouseenter",()=>{
            option.innerHTML="<div class='loader'></div>";
            chrome.runtime.sendMessage({selectedText:selectedText},
                (response)=>{
                    option.remove();
                    let newDiv=document.createElement("div");
                    newDiv.classList.add("word-definition");
                    newDiv.innerHTML=response;

                    newDiv.style.top=(bottom+20+window.scrollY)+"px";
                    newDiv.style.left=((right+left)/2+window.scrollX)+"px";
                    newDiv.style.transform="translate(-50%,0%)";
                    document.body.appendChild(newDiv);
                    window.addEventListener("mouseup",clearOption);
                    window.addEventListener("mouseup",clearDefintionResults);
            }
            );
        });
        window.addEventListener("mouseup",clearOption);
        window.removeEventListener("mouseup",getSelectedWord);
}

function clearDefintionResults(){
    let definitions=document.querySelectorAll(".word-definition");
    definitions.forEach(e=>e.remove());
    window.removeEventListener("mousedown",clearDefintionResults);
    t=new Date().getTime();
}

function clearOption(){
    let option=document.querySelector(".word-definition-lookup-input");
    option?.remove();
    window.removeEventListener("mouseup",clearOption);
}