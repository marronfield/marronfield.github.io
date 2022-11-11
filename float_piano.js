export default()=>{const keyNameList=[["B#","C"],["C#","Db"],"D",["D#","Eb"],["E","Fb"],["E#","F"],["F#","Gb"],"G",["G#","Ab"],"A",["A#","Bb"],["B","Cb"]];const relativeKeyNameList=["Ⅰ","Ⅰ#","Ⅱ","Ⅲb","Ⅲ","Ⅳ","Ⅳ#","Ⅴ","Ⅵb","Ⅵ","Ⅶb","Ⅶ"];const relativeCKeyNameList=["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];const elems=Array.from(document.querySelectorAll("span.chord")).filter(elem=>elem.innerHTML.match(/^[^N]*[A-G][#b]?m?/));const originals=elems.map(elem=>elem.innerHTML);if(!document.getElementById("piano")){const[piano,keys]=createPiano();let selectedIndex=-1;let relativeC=false;let lastClickedElem;keys.forEach((key,index)=>{key.onclick=()=>{if(selectedIndex!==-1){keys[selectedIndex].style.backgroundImage="";}if(selectedIndex!==index||!relativeC){if(selectedIndex!==index)selectedIndex=index;else if(!relativeC)relativeC=true;const cnum=relativeC?"008000":"4444ff";key.style.backgroundImage=`linear-gradient(#${cnum}44 0%100%)`;elems.forEach(elem=>{elem.style.color="#"+cnum;});changeTonicTo(index,relativeC);}else{selectedIndex=-1;relativeC=false;resetToOriginal();}if(lastClickedElem)lastClickedElem.onclick();};});elems.forEach((elem,index)=>{elem.onclick=e=>{if(lastClickedElem)lastClickedElem.style.textDecoration="";piano.release();if(e&&elem===lastClickedElem){lastClickedElem=undefined;return;}elem.style.textDecoration="underline";const indexList=chordNameToIndexList(originals[index]);if(!indexList){alert("謎のコード。");return;}if(!relativeC)piano.press(indexList,"#4444ff");else piano.press(indexList.map(index=>(index-selectedIndex+12)%12),"#448044");lastClickedElem=elem;};});document.body.append(piano);setKeySelector(keys);setSwipe(piano);rainbowHidekazu();}else alert("2つ以上は無理です。");function createPiano(){const piano=document.createElement("div");const keys=new Array(12);piano.id="piano";piano.style=`position:fixed;right:0px;bottom:0px;width:24em;height:9em;max-width:80vmin;max-height:30vmin;box-shadow:0 0 6px#777;user-select:none;display:flex;`;[0,2,4,5,7,9,11].forEach((keyIndex,index)=>{const key=document.createElement("div");key.style=`box-sizing:border-box;position:relative;width:0;flex-grow:1;${index===0?"":"border-left:1px solid#333;"}background-color:#fff;display:flex;justify-content:center;`;keys[keyIndex]=key;});[1,3,6,8,10].forEach((keyIndex,index)=>{const key=document.createElement("div");const pos=(W,w,i,n)=>{const gap=(W-n*w)/(n+1);return gap+(w+gap)*i;};const width=100/12;const left=index<2?pos(100/7*3,width,index,2):100/7*3+pos(100/7*4,width,index-2,3);key.style=`box-sizing:border-box;position:absolute;left:${left}%;width:${width}%;height:calc(100%*0.65);z-index:1;box-shadow:0 0 6px#777;background-color:#333;display:flex;justify-content:center;`;keys[keyIndex]=key;});keys.forEach((key,index)=>{const icon=createIcon();const rainbowAnim=icon.animate([{background:"#f44"},{background:"#4f4"},{background:"#44f"},{background:"#f44"}],{duration:3000,iterations:Infinity});rainbowAnim.cancel();key.setIcon=(isRoot,color,rainbow)=>{if(isRoot)icon.textContent="R";else icon.textContent="";if(rainbow)rainbowAnim.play();else icon.style.background=color;key.appendChild(icon);};key.removeIcon=()=>{rainbowAnim.cancel();if(key.contains(icon))key.removeChild(icon);};piano.appendChild(key);});piano.press=(indexList,color)=>{const relativeIndexList=indexList.map(index=>(index-indexList[0]+12)%12);const containsSugi=[0,2,6,10].every(index=>relativeIndexList.includes(index));indexList.forEach((index,i)=>{keys[index].setIcon(i===0,color,containsSugi&&[0,2,6,10].includes(relativeIndexList[i]));});};piano.release=()=>{keys.forEach(key=>{key.removeIcon();});};return[piano,keys];function createIcon(){const div=document.createElement("div");div.style=`width:1.8em;height:1.8em;border-radius:50%;margin:5px;flex-shrink:0;align-self:end;color:#fff;font:0.75em sans-serif;display:flex;justify-content:center;align-items:center;vertical-align:bottom;`;return div;}}function changeTonicTo(tonicIndex,relativeC){elems.forEach((elem,index)=>{elem.innerHTML=originals[index].replace(/[A-G][#b]?/g,match=>{const keyIndex=keyNameList.findIndex(name=>typeof name==="string"?name===match:name.includes(match));return relativeC?relativeCKeyNameList[(keyIndex-tonicIndex+12)%12]:relativeKeyNameList[(keyIndex-tonicIndex+12)%12];});});}function resetToOriginal(){elems.forEach((elem,index)=>{elem.innerHTML=originals[index];elem.style.color="";});}function chordNameToIndexList(chordName){const match=chordName.trim().replace(/^\((.*)\)$/,"$1").trim().match(new RegExp(`^([A-G][#b]?)?([^/]*)(?:\\/([A-G][#b]?))?$`));if(!match)return null;const[,root1,quality,root2]=match;const root1Index=keyNameList.findIndex(name=>typeof name==="string"?name===root1:name.includes(root1));const root2Index=keyNameList.findIndex(name=>typeof name==="string"?name===root2:name.includes(root2));let indexList=qualityToIndexList(quality);if(indexList&&root1Index!==-1){indexList=indexList.map(index=>(index+root1Index)%12);if(root2Index!==-1)indexList=[root2Index,...indexList.filter(index=>index!==root2Index)];return indexList;}else if(root2Index!==-1)return[root2Index];else return null;function qualityToIndexList(quality){let indexList=[0,4,7];const templates={"dim7":[0,3,6,9],"m":[0,3,7],"aug":[0,4,8],"dim":[0,3,6],};const additionals={"6":[9],"7":[10],"M7":[11],"add9":[2],"9":[10,2],"69":[9,2],"M9":[11,2],"11":[10,2,5],"M11":[11,2,5],};const commands={"sus2":indexList=>{replace(indexList,4,2);},"sus4":indexList=>{replace(indexList,4,5);},"-5":indexList=>{replace(indexList,7,6);},"omit3":indexList=>{del(indexList,5);},};const tensions=(()=>{const tmp={"-9,b9":1,"9":2,"+9,#9":3,"11":5,"+11,#11":6,"-13,b13":8,"13":9,};const output={};Object.entries(tmp).forEach(([_key,value])=>{_key.split(",").forEach(key=>{output[key]=value;});});return output;})();const match=quality.match(new RegExp("^"+`(${Object.keys(templates).join("|")})?`+`(${Object.keys(additionals).join("|")})?`+`(${Object.keys(commands).join("|")})?`+"(?:\\(([+\\-#b]?\\d+)\\))?"+"$"));if(match){if(match[1])indexList=templates[match[1]];if(match[2])add(indexList,...additionals[match[2]]);if(match[3])commands[match[3]](indexList);if(match[4]&&match[4]in tensions)add(indexList,tensions[match[4]]);return indexList;}else return null;function add(indexList,...indexes){indexes.forEach(index=>{if(!indexList.includes(index))indexList.push(index);});}function del(indexList,index){const i=indexList.indexOf(index);if(i!==-1)indexList.splice(i,1);}function replace(indexList,oldIndex,newIndex){const i=indexList.indexOf(oldIndex);if(i!==-1)indexList[i]=newIndex;}}}function setKeySelector(keys){const minorKeyNameList=keyNameList.map(name=>typeof name==="string"?name+"m":name.map(n=>n+"m"));const allKeyNameList=keyNameList.map((name,index)=>[name,minorKeyNameList[(index+9)%12]].flat());document.querySelectorAll("p.key").forEach(elem=>{const match=elem.innerHTML.match(/[A-G][#b]?m?/)[0];const tonicIndex=allKeyNameList.findIndex(name=>typeof name==="string"?name===match:name.includes(match));if(tonicIndex!==-1){elem.style.cursor="pointer";elem.onclick=keys[tonicIndex].onclick;}});}function setSwipe(target){const fps=60;const isTouchDevice="ontouchstart"in window;const eName={};if(isTouchDevice){eName.start="touchstart";eName.move="touchmove";eName.end="touchend";eName.leave="touchcancel";}else{eName.start="mousedown";eName.move="mousemove";eName.end="mouseup";eName.leave="mouseleave";}let me;let x=target.getBoundingClientRect().left;let y=target.getBoundingClientRect().top;let x_old,y_old;let tID;target.style.position="fixed";target.style.transform=`translate(${x}px,${y}px)`;target.style.left="0";target.style.top="0";window.onresize=()=>{x=clamp(x,0,window.innerWidth-target.offsetWidth);y=clamp(y,0,window.innerHeight-target.offsetHeight);target.style.transform=`translate(${x}px,${y}px)`;};target.addEventListener(eName.start,e=>{window.addEventListener(eName.move,onmove,{passive:false});window.addEventListener(eName.end,onend);window.addEventListener(eName.leave,onend);me=isTouchDevice?e.changedTouches[0]:e;const offsetX=me.clientX-x;const offsetY=me.clientY-y;if(tID)clearInterval(tID);tID=setInterval(()=>{x_old=x;y_old=y;x=clamp(me.clientX-offsetX,0,window.innerWidth-target.offsetWidth);y=clamp(me.clientY-offsetY,0,window.innerHeight-target.offsetHeight);target.style.transform=`translate(${x}px,${y}px)`;},1000/fps);});function onmove(e){me=isTouchDevice?e.changedTouches[0]:e;e.preventDefault();}function onend(e){window.removeEventListener(eName.move,onmove);window.removeEventListener(eName.end,onend);window.removeEventListener(eName.leave,onend);let dx=x-x_old;let dy=y-y_old;if(tID)clearInterval(tID);if(dx!==0||dy!==0){tID=setInterval(()=>{let clampedX,clampedY;[x,clampedX]=clamp(x+dx,0,window.innerWidth-target.offsetWidth,true);[y,clampedY]=clamp(y+dy,0,window.innerHeight-target.offsetHeight,true);target.style.transform=`translate(${x}px,${y}px)`;dx*=clampedX?-0.98:0.98;dy*=clampedY?-0.98:0.98;if(Math.abs(dx)<0.1&&Math.abs(dy)<0.1)clearInterval(tID);},1000/fps);}}function clamp(pos,min,max,returnClamped=false){if(returnClamped)return pos<min?[min,true]:max<pos?[max,true]:[pos,false];else return pos<min?min:max<pos?max:pos;}}function rainbowHidekazu(){const st=document.querySelector(".subtitle");st.innerHTML=st.innerHTML.replace(/田中[　]*秀和/g,"<span class=\"hidekazu\">$&</span>");document.querySelectorAll(".hidekazu").forEach(elem=>{elem.animate([{color:"#f00"},{color:"#0f0"},{color:"#00f"},{color:"#f00"}],{duration:3000,iterations:Infinity});});}}
