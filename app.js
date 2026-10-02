
let discipline="interior";
const $=id=>document.getElementById(id);
let referenceFiles=[];
const ids=["projectName","engine","promptDepth","outputType","room","style","palette","materials","furniture","archOutput","buildingType","archStyle","facade","context","climate","massing","landscape","camera","lighting","ratio","quality","details","preserve","negative"];

function setDiscipline(mode){
  discipline=mode;
  $("modeInterior").classList.toggle("active",mode==="interior");
  $("modeArchitecture").classList.toggle("active",mode==="architecture");
  document.querySelectorAll(".interior-only").forEach(x=>x.style.display=mode==="interior"?(x.classList.contains("formgrid")?"grid":"flex"):"none");
  document.querySelectorAll(".arch-only").forEach(x=>x.style.display=mode==="architecture"?(x.classList.contains("formgrid")?"grid":"flex"):"none");
  $("interiorPresets").style.display=mode==="interior"?"grid":"none";
  $("architecturePresets").style.display=mode==="architecture"?"grid":"none";
  $("disciplineLabel").textContent=mode==="interior"?"INTERIOR":"ARCHITECTURE";
  $("modeStat").textContent=mode==="interior"?"Interior":"Architecture";
  generatePrompt();
}

function tags(){return [...document.querySelectorAll(".tag.active")].map(x=>x.textContent.trim()).join(", ")}
function v(id){return $(id)?.value?.trim()||""}

function generatePrompt(){
  let p="";
  if(v("projectName")) p+=`Project: ${v("projectName")}\n\n`;
  p+=`Prompt depth: ${v("promptDepth")||"Professional"}\nAI engine: ${v("engine")}\n\n`;

  if(referenceFiles.length){
    p+=`Uploaded references: ${referenceFiles.map(f=>f.name).join(", ")}\n`;
    if($("preserveReference")?.checked) p+=`Reference handling: Preserve uploaded geometry, composition and fixed architectural elements where applicable. Do not redesign them unless explicitly requested.\n\n`;
    else p+=`Reference handling: Use the uploaded references as visual guidance while allowing design development.\n\n`;
  }

  if(discipline==="interior"){
    p+=`Create a professional ${v("outputType").toLowerCase()} for a ${v("room").toLowerCase()}.

Interior design direction:
- Style: ${v("style")}
- Color palette: ${v("palette")}
- Materials: ${v("materials")}
- Furniture language: ${v("furniture")}
`;
  }else{
    p+=`Create a professional ${v("archOutput").toLowerCase()} for a ${v("buildingType").toLowerCase()}.

Architectural design direction:
- Architectural style: ${v("archStyle")}
- Façade system: ${v("facade")}
- Site / context: ${v("context")}
- Climate response: ${v("climate")}
- Massing language: ${v("massing")}
- Landscape approach: ${v("landscape")}

Architectural priorities:
Develop a coherent relationship between massing, façade rhythm, structure, openings, shading, climate response, public/private hierarchy, access, pedestrian movement and landscape. Maintain believable construction logic and realistic architectural proportions.
`;
  }

  p+=`\nVisual direction:
- Camera / view: ${v("camera")}
- Lighting: ${v("lighting")}
- Quality: ${v("quality")}
- Output format: ${v("ratio")}
`;
  if(v("details")) p+=`\nProject requirements:\n${v("details")}\n`;
  if(v("preserve")) p+=`\nPreservation constraints:\n${v("preserve")}\n`;

  p+=`\nTechnical controls:\n${tags()}\n`;

  if(v("negative")) p+=`\nAvoid:\n${v("negative")}\n`;

  const depth=v("promptDepth")||"Professional";
  if(depth==="Concise") p+=`\nFinal instruction:
Keep the prompt focused, visually clear and efficient. Preserve supplied geometry and optimize the result for ${v("engine")}.`;
  else if(depth==="Technical") p+=`\nFinal instruction:
Use production-level architectural control: accurate scale, believable structure, material junctions, opening proportions, lighting logic, straight verticals, realistic camera behavior and strict preservation of supplied fixed geometry. Avoid generic decoration and unsupported design invention. Optimize the final result for ${v("engine")}.`;
  else p+=`\nFinal instruction:
Keep geometry controlled, scale believable, materials physically plausible, verticals straight and the design architecturally coherent. Do not invent major fixed elements when a plan, massing model, CAD drawing or reference image is supplied. Optimize the final result for ${v("engine")}.`;

  $("promptOutput").textContent=p;
  $("wordCount").textContent=p.split(/\s+/).filter(Boolean).length;
  $("engineStat").textContent=v("engine").split(" ")[0]||"—";
}


function humanSize(bytes){
  if(bytes<1024) return bytes+" B";
  if(bytes<1024*1024) return (bytes/1024).toFixed(1)+" KB";
  return (bytes/(1024*1024)).toFixed(1)+" MB";
}
function renderReferences(){
  const list=$("uploadList"); if(!list) return;
  list.innerHTML="";
  referenceFiles.forEach((file,i)=>{
    const row=document.createElement("div"); row.className="upload-item";
    const main=document.createElement("div"); main.className="upload-item-main";
    const thumb=document.createElement("div"); thumb.className="upload-thumb";
    if(file.type.startsWith("image/")){ const img=document.createElement("img"); img.src=URL.createObjectURL(file); img.alt=""; thumb.appendChild(img); } else thumb.textContent="PDF";
    const meta=document.createElement("div"); meta.className="upload-meta"; meta.innerHTML=`<b>${file.name.replace(/[<>]/g,"")}</b><small>${humanSize(file.size)}</small>`;
    const rm=document.createElement("button"); rm.type="button"; rm.className="remove-upload"; rm.setAttribute("aria-label","Remove reference"); rm.textContent="×"; rm.onclick=(e)=>{e.stopPropagation();referenceFiles.splice(i,1);renderReferences();generatePrompt();};
    main.append(thumb,meta); row.append(main,rm); list.appendChild(row);
  });
  if($("referenceStat")) $("referenceStat").textContent=referenceFiles.length;
}
function addReferenceFiles(files){
  const allowed=[...files].filter(f=>f.type.startsWith("image/")||f.type==="application/pdf").slice(0,5-referenceFiles.length);
  referenceFiles=[...referenceFiles,...allowed].slice(0,5); renderReferences(); generatePrompt();
}
function setupReferenceUpload(){
  const input=$("referenceFiles"), zone=$("uploadZone"), browse=$("browseFiles"); if(!input||!zone) return;
  const open=()=>input.click(); browse?.addEventListener("click",e=>{e.stopPropagation();open()}); zone.addEventListener("click",open); zone.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
  input.addEventListener("change",()=>{addReferenceFiles(input.files);input.value=""});
  ["dragenter","dragover"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add("dragover")}));
  ["dragleave","drop"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove("dragover")}));
  zone.addEventListener("drop",e=>addReferenceFiles(e.dataTransfer.files));
  $("preserveReference")?.addEventListener("change",generatePrompt);
}
function setupEnginePills(){
  const sync=()=>document.querySelectorAll(".engine-pills button").forEach(b=>b.classList.toggle("active",b.dataset.engine===v("engine")));
  document.querySelectorAll(".engine-pills button").forEach(b=>b.addEventListener("click",()=>{$("engine").value=b.dataset.engine;sync();generatePrompt()}));
  $("engine")?.addEventListener("change",sync); sync();
}

async function copyPrompt(btn){
  try{await navigator.clipboard.writeText($("promptOutput").textContent);let o=btn.textContent;btn.textContent="Copied ✓";setTimeout(()=>btn.textContent=o,1000)}catch(e){alert("Copy manually")}
}
function savePrompt(){
  let items=[];try{items=JSON.parse(localStorage.getItem("structevo_projects")||"[]")}catch(e){}
  items.unshift({name:v("projectName")||"Untitled Project",discipline,prompt:$("promptOutput").textContent,date:new Date().toLocaleDateString()});
  localStorage.setItem("structevo_projects",JSON.stringify(items.slice(0,30)));alert("Saved to Dashboard");
}
function applyPreset(t){
  setDiscipline("interior");
  if(t==="luxury"){ $("outputType").value="Photorealistic 3D Interior";$("style").value="Contemporary Luxury";$("materials").value="Ivory marble, walnut veneer, brushed brass, textured fabric";}
  if(t==="plan"){ $("outputType").value="Furnished Floor Plan";$("camera").value="Strict orthographic top view";}
  if(t==="mood"){ $("outputType").value="Interior Moodboard";}
  if(t==="commercial"){ $("room").value="Travel Agency";$("details").value="Include clear entrance sequence, reception, waiting, workstations, private offices and professional circulation.";}
  if(t==="uni"){ $("outputType").value="University Presentation Board";$("ratio").value="A3 presentation board";}
  if(t==="cad"){ $("outputType").value="Unfurnished CAD Plan";$("camera").value="Strict orthographic top view";}
  generatePrompt();
}
function applyArchPreset(t){
  setDiscipline("architecture");
  if(t==="villa"){ $("archOutput").value="Photorealistic Architectural Exterior";$("buildingType").value="Luxury Villa";$("context").value="Suburban residential context";}
  if(t==="facade"){ $("archOutput").value="Façade Design Study";}
  if(t==="massing"){ $("archOutput").value="Concept Massing Visualization";}
  if(t==="masterplan"){ $("archOutput").value="Masterplan Visualization";$("buildingType").value="Urban Development";$("camera").value="Bird's-eye architectural view";}
  if(t==="tower"){ $("archOutput").value="Photorealistic Architectural Exterior";$("buildingType").value="Mixed-use Tower";$("context").value="Dense metropolitan context";}
  if(t==="site"){ $("archOutput").value="Site Plan Visualization";$("camera").value="Strict orthographic top view";}
  generatePrompt();
}

document.addEventListener("DOMContentLoaded",()=>{
  ids.forEach(id=>$(id)?.addEventListener("input",generatePrompt));
  document.querySelectorAll(".tag").forEach(t=>t.addEventListener("click",()=>{t.classList.toggle("active");generatePrompt()}));
  setupReferenceUpload();
  setupEnginePills();
  setDiscipline("interior");
});
