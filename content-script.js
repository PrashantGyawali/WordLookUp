console.log('content-script.js')


let mouseStartY=0,mouseEndY=0,mouseStartX=0,mouseEndX=0;
let t=new Date().getTime();

window.addEventListener("mousedown",(e)=>{
    mouseStartY=e.pageY;
    mouseStartX=e.pageX;
    window.addEventListener("mouseup",(e)=>getSelectedWord(e));
});

async function getSelectedWord(mouseEvent){
    let selection=window.getSelection();
    let selectedText=selection.toString().trim().replaceAll("\n"," ").split(" ").reduce((final,e)=>final.concat(e.trim()," "),"").trim();

    if(selectedText.split(" ").length!=1 || selectedText==" " || selectedText=="")return;
    if(document.querySelector(".word-definition-lookup-input") || document.querySelector(".word-definition"))return;
    if(new Date().getTime()-t<400)return;

        let selectionParameter1=selection.anchorNode.parentElement;
        let selectionParameter2=selection.extentNode.parentElement;
        let sP1Y=selectionParameter1.getBoundingClientRect().y+(selectionParameter1.getBoundingClientRect().height)/2+window.scrollY;   
        let sP2Y=selectionParameter2.getBoundingClientRect().y+(selectionParameter2.getBoundingClientRect().height)/2+window.scrollY;

        
        mouseEndY=mouseEvent.pageY;
        mouseEndX=mouseEvent.pageX;
        if(mouseEndY>sP1Y+50||mouseEndY>sP2Y+50)return;
        if(mouseEndY<sP1Y-50||mouseEndY<sP2Y-50)return;
        
        
        let divY=Math.max(sP1Y,sP2Y,mouseStartY,mouseEndY)+window.getComputedStyle(selectionParameter1).getPropertyValue("font-size").replace("px","")*1.5;
        let divX=Math.min(mouseStartX,mouseEndX);

        let option=document.createElement("button");
        option.innerHTML="🔍?";
        option.classList.add("word-definition-lookup-input");
        option.style.top=(mouseEndY-15)+"px";
        option.style.left=(mouseEndX+20)+"px";
        document.body.appendChild(option);

        option.addEventListener("mouseenter",()=>{
            option.innerHTML="<div class='loader'></div>";
            chrome.runtime.sendMessage({selectedText:selectedText},
                (response)=>{
                    option.remove();
                    let newDiv=document.createElement("div");
                    newDiv.classList.add("word-definition");
                    newDiv.innerHTML=response;

                    newDiv.style.top=divY+"px";
                    newDiv.style.left=divX+"px";
                    document.body.appendChild(newDiv);
                    window.addEventListener("mouseup",clearOption);
                    window.addEventListener("mouseup",clearDefintionResults);
            }
            );
        });
        window.addEventListener("mouseup",clearOption);
        window.removeEventListener("mouseup",(e)=>getSelectedWord(e));
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