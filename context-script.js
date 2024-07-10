(async function getSelectedWord(){

        let selection=window.getSelection();
        let range       = selection.getRangeAt(0);
        let selectionDimensions = range.getClientRects();
        
        let left,right,bottom;

        if(selectionDimensions && selectionDimensions[0]){
            left=selectionDimensions[0].left;
            right=selectionDimensions[0].right;
            bottom=selectionDimensions[0].bottom;
        }
        else{
            left=selectionDimensions.left;
            right=selectionDimensions.right;
            bottom=selectionDimensions.bottom;
        }

        let selectedText=selection.toString().trim().replaceAll("\n"," ").split(" ").reduce((final,e)=>final.concat(e.trim()," "),"").trim();
    
        if(selectedText.split(" ").length!=1 || selectedText==" " || selectedText=="")return;

            let option=document.createElement("button");
            option.classList.add("word-definition-lookup-input");
            option.style.top=(bottom+10+window.scrollY)+"px";
            option.style.left=(right+20+window.scrollX)+"px";
            option.innerHTML="<div class='loader'></div>";
            document.body.appendChild(option);
            
            chrome.runtime.sendMessage({selectedText:selectedText},
                (response)=>{
                        document.querySelectorAll(".word-definition-lookup-input").forEach(e=>e.remove());
                        let newDiv=document.createElement("div");
                        newDiv.classList.add("word-definition");
                        newDiv.innerHTML=response;
    
                        newDiv.style.top=(parseInt(bottom+window.scrollY)+10)+"px";
                        newDiv.style.left=(((parseInt(left)+parseInt(right))/2+window.scrollX))+"px";
                        newDiv.style.transform="translate(-50%,0)";
                        document.body.appendChild(newDiv);
                        window.addEventListener("mouseup",clearOption);
                        window.addEventListener("mouseup",clearDefintionResults);
                }
                );

            window.addEventListener("mouseup",clearOption);
    })();
    
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