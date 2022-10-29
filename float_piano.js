export default()=>{const keyNameList=["C",["C#","Db"],"D",["D#","Eb"],"E","F",["F#","Gb"],"G",["G#","Ab"],"A",["A#","Bb"],"B"];const minorKeyNameList=keyNameList.map(name=>typeof name==="string"?name+"m":name.map(n=>n+"m"));const relativeKeyNameList=["Ⅰ","Ⅱb","Ⅱ","Ⅲb","Ⅲ","Ⅳ","Ⅳ#","Ⅴ","Ⅵb","Ⅵ","Ⅶb","Ⅶ"];const elems=Array.from(document.querySelectorAll("span.chord"));const originals=elems.map(elem=>elem.innerHTML);if(!document.getElementById("piano")){const piano=createPiano(getDefaultTonicIndex());piano.id="piano";document.body.append(piano);setSwipe(piano);}function getDefaultTonicIndex(){let tonicIndex=-1;if(document.querySelector("p.key")){const match=document.querySelector("p.key").innerHTML.match(/([A-G][#b]?m?)/)[1];tonicIndex=keyNameList.findIndex(name=>typeof name==="string"?name===match:name.includes(match));if(tonicIndex===-1){tonicIndex=minorKeyNameList.findIndex(name=>typeof name==="string"?name===match:name.includes(match));if(tonicIndex!==-1)tonicIndex=(tonicIndex+3)%12;}}return tonicIndex;}function changeTonicTo(tonicIndex){elems.forEach((elem,index)=>{elem.innerHTML=originals[index].replace(/^[A-G][#b]?|[A-G][#b]?$/g,match=>{elem.style.color="green";const keyIndex=keyNameList.findIndex(name=>typeof name==="string"?name===match:name.includes(match));return relativeKeyNameList[(keyIndex-tonicIndex+12)%12];});});}function reset(){elems.forEach((elem,index)=>{elem.innerHTML=originals[index];elem.style.color="";});}function createPiano(defaultSelectedIndex=-1){let selectedIndex=-1;const piano=document.createElement("div");piano.style=`position:fixed;right:0px;bottom:0px;width:24em;height:9em;max-width:80vmin;max-height:30vmin;box-shadow:0 0 6px#777;display:flex;`;[0,2,4,5,7,9,11].forEach((keyIndex,index)=>{const key=document.createElement("div");key.style=`box-sizing:border-box;flex-grow:1;border:1px solid#333;${index?"border-left:none;":""}background:white;`;key.className="white";key.onclick=()=>{Array.from(piano.children).forEach(key=>{if(key.className==="white")key.style.background="white";else key.style.background="#333";});if(selectedIndex!==keyIndex){key.style.background="green";changeTonicTo(keyIndex);selectedIndex=keyIndex;}else{key.style.background="white";reset();selectedIndex=-1;}};if(keyIndex===defaultSelectedIndex)key.onclick();piano.appendChild(key);});[1,3,6,8,10].forEach((keyIndex,index)=>{const key=document.createElement("div");const pos=(W,w,i,n)=>{const gap=(W-n*w)/(n+1);return gap+(w+gap)*i;};const width=100/12;const left=index<2?pos(100/7*3,width,index,2):100/7*3+pos(100/7*4,width,index-2,3);key.style=`position:absolute;box-sizing:border-box;left:${left}%;width:${width}%;height:calc(100%*0.65);border:1px solid#333;background:#333;`;key.className="black";key.onclick=()=>{Array.from(piano.children).forEach(key=>{if(key.className==="white")key.style.background="white";else key.style.background="#333";});if(selectedIndex!==keyIndex){key.style.background="green";changeTonicTo(keyIndex);selectedIndex=keyIndex;}else{key.style.background="#333";reset();selectedIndex=-1;}};if(keyIndex===defaultSelectedIndex)key.onclick();piano.appendChild(key);});return piano;}function setSwipe(target){target.style.position="fixed";target.style.transform=`translate(${target.getBoundingClientRect().left}px,${target.getBoundingClientRect().top}px)`;target.style.left="0";target.style.top="0";const fps=60;let me;let x,y,x_old,y_old;let tID;const isTouchDevice="ontouchstart"in window;const eName={};if(isTouchDevice){eName.start="touchstart";eName.move="touchmove";eName.end="touchend";eName.leave="touchcancel";}else{eName.start="mousedown";eName.move="mousemove";eName.end="mouseup";eName.leave="mouseleave";}target.addEventListener(eName.start,e=>{window.addEventListener(eName.move,onmove,{passive:false});window.addEventListener(eName.end,onend);window.addEventListener(eName.leave,onend);me=isTouchDevice?e.changedTouches[0]:e;const offsetX=me.clientX-target.getBoundingClientRect().left;const offsetY=me.clientY-target.getBoundingClientRect().top;if(tID)clearInterval(tID);tID=setInterval(()=>{x_old=x;y_old=y;x=clamp(me.clientX-offsetX,0,window.innerWidth-target.offsetWidth);y=clamp(me.clientY-offsetY,0,window.innerHeight-target.offsetHeight);target.style.transform=`translate(${x-target.offsetLeft}px,${y-target.offsetTop}px)`;},1000/fps);});function onmove(e){me=isTouchDevice?e.changedTouches[0]:e;e.preventDefault();}function onend(e){window.removeEventListener(eName.move,onmove);window.removeEventListener(eName.end,onend);window.removeEventListener(eName.leave,onend);let dx=x-x_old;let dy=y-y_old;if(tID)clearInterval(tID);if(dx!==0||dy!==0){tID=setInterval(()=>{let clampedX,clampedY;[x,clampedX]=clamp(x+dx,0,window.innerWidth-target.offsetWidth,true);[y,clampedY]=clamp(y+dy,0,window.innerHeight-target.offsetHeight,true);target.style.transform=`translate(${x-target.offsetLeft}px,${y-target.offsetTop}px)`;dx*=clampedX?-0.98:0.98;dy*=clampedY?-0.98:0.98;if(Math.abs(dx)<0.1&&Math.abs(dy)<0.1)clearInterval(tID);},1000/fps);}}function clamp(pos,min,max,returnClamped=false){if(returnClamped)return pos<min?[min,true]:max<pos?[max,true]:[pos,false];else return pos<min?min:max<pos?max:pos;}}}
