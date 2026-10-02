
let discipline="interior";
const $=id=>document.getElementById(id);
const ids=["projectName","engine","outputType","room","style","palette","materials","furniture","archOutput","buildingType","archStyle","facade","context","climate","massing","landscape","camera","lighting","ratio","quality","details","preserve","negative"];

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

  p+=`\nFinal instruction:
Keep geometry controlled, scale believable, materials physically plausible, verticals straight and the design architecturally coherent. Do not invent major fixed elements when a plan, massing model, CAD drawing or reference image is supplied. Optimize the final result for ${v("engine")}.`;

  $("promptOutput").textContent=p;
  $("wordCount").textContent=p.split(/\s+/).filter(Boolean).length;
  $("engineStat").textContent=v("engine").split(" ")[0]||"—";
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
  setDiscipline("interior");
});
