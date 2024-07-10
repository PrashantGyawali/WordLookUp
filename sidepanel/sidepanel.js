document.getElementById("make-selectable").addEventListener("change",()=>{
    if(document.getElementById("make-selectable").checked){
        chrome.runtime.sendMessage({message:"make-text-selectable"});
    }
    else{
        chrome.runtime.sendMessage({message:"remove-make-text-selectable"});
    }
});

chrome.storage.local.get("make-text-selectable",(data)=>{
    if(data["make-text-selectable"]){
        document.getElementById("make-selectable").checked=true;
    }
    else{
        document.getElementById("make-selectable").checked=false;
    }
});


document.getElementById("show-search-icon").addEventListener("change",()=>{
    if(document.getElementById("show-search-icon").checked){
        chrome.runtime.sendMessage({message:"show-search-icon"});
    }
    else{
        chrome.runtime.sendMessage({message:"remove-show-search-icon"});
    }
});

chrome.storage.local.get("show-search-icon",(data)=>{
    if(data["show-search-icon"]){
        document.getElementById("show-search-icon").checked=true;
    }
    else{
        document.getElementById("show-search-icon").checked=false;
    }
});


chrome.storage.local.get("recent-words",(data)=>{
            if(data["recent-words"])
            {
                let t="";
                data["recent-words"].forEach((e)=>{
                    t+=jsonToHtml(e);                   
                });
                
                document.getElementById("recent-words").innerHTML=t;
            }
            else{
                document.getElementById("recent-words").innerHTML="No recent words";
            }
});

function jsonToHtml(json)
{
    console.log(json);
    let word=json[0].word;
    let superPhonetic="";

    if("phonetic" in json[0])
    {
        superPhonetic=json[0].phonetic;
    }
    else if("phonetics" in json[0] && json[0].phonetics.length>0 && ("text" in json[0].phonetics[0]))
    {
        superPhonetic=json[0].phonetics[0].text;
    }
    let superPronunciation=json[0]?.phonetics[0]?.audio;

    let meanings=json[0].meanings;

    let filteredMeanings=meanings.map((e)=>{
        let partOfSpeech=e.partOfSpeech;
        let definitions=e.definitions.map((e)=>{
            if(!e["definition"])return "";

            else{
                if(e["definition"].charAt(0)==",")
                {
                    e=e.slice(1,-1);
                }
                else if(e["definition"].charAt(0)==" ")
                {
                    e=e.slice(1,-1);
                }
                return e["definition"];
            }
        });


        let synonyms=[];
        if(e.synonyms.length>0 && e.synonyms[0]!="")
        {
            synonyms=e.synonyms.map((e)=>e.charAt(0).toUpperCase()+e.slice(1));
        }
        else{
            synonyms=e.definitions.map((e)=>e.synonyms);
        }

        let antonyms=[];
        if(e.antonyms.length>0 && e.antonyms[0]!="")
        {
            antonyms=e.antonyms.map((e)=>e.charAt(0).toUpperCase()+e.slice(1));
        }
        else{
            antonyms=e.definitions.map((e)=>e.antonyms);
        }

        
        let example=e.definitions.map((e)=>{if("example" in e){return e.example}}).filter((e)=>{if(e)return e;});

        return {partOfSpeech,definitions,antonyms,synonyms,example};
    });
console.log(filteredMeanings);

    let final=`<details><summary>${word}</summary>`
    if(superPhonetic!="")
    {
        final+=`<div>${superPhonetic}</div>`;
    }
    if(superPronunciation)
    {
        final+=`<audio controls><source src="${superPronunciation}" type="audio/mpeg"></audio>`;
    }
    final+=`<ol>`;

    filteredMeanings.map((e)=>{
        final+=`<li><strong>${e.partOfSpeech}</strong>:`

        e.definitions.forEach(p => {
            final+=`<span>${p}&emsp;&emsp;</span>`
        });
        final+=`<br>`;

        if(e.example.length>0 && e.example[0]!="")
        {
            console.log(e.example);
            final+=`<div><strong>Examples:</strong> ${e.example.map((p)=>p)}</div>`;
        }
        if(e.synonyms.length>0 && e.synonyms[0]!="")
        {
            final+=`<div><strong>Synonyms:</strong> ${e.synonyms.map((p)=>p)}</div>`;
        }
        if(e.antonyms.length>0 && e.antonyms[0]!="")
        {
            final+=`<div><strong>Antonyms:</strong> ${e.antonyms.map((p)=>p)}</div>`;
        }
        final+=`<br>`;
        final+=`</li>`;
    })
    final+=`</ol>
    </details>`;

    return final;
}