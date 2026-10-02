
const $ = id => document.getElementById(id);

function saveLocal(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function loadLocal(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch(e){ return fallback } }

function copyText(text, btn){
  navigator.clipboard.writeText(text).then(()=>{
    if(btn){ const old=btn.textContent; btn.textContent="Copied ✓"; setTimeout(()=>btn.textContent=old,1100); }
  }).catch(()=>alert("Copy the prompt manually."));
}

function initStudio(){
  if(!$("promptOutput")) return;
  const ids=["projectName","engine","outputType","projectType","room","style","mood","palette","materials","furniture","decor","camera","lighting","time","ratio","quality","background","details","preserve","negative"];
  ids.forEach(id => $(id)?.addEventListener("input", generatePrompt));
  document.querySelectorAll(".tag").forEach(t=>t.addEventListener("click",()=>{t.classList.toggle("active");generatePrompt()}));

  window.generatePrompt = function(){
    const v=id=>$(id)?.value?.trim()||"";
    const out=v("outputType"), room=v("room"), style=v("style");
    let opener;
    if(out.includes("CAD")) opener=`Create a clean professional ${out.toLowerCase()} for a ${room.toLowerCase()}.`;
    else if(out.includes("Floor Plan")) opener=`Create a high-quality ${out.toLowerCase()} for a ${room.toLowerCase()}, with practical zoning, believable furniture scale and clear circulation.`;
    else if(out.includes("Moodboard")||out.includes("Material Board")||out.includes("Concept Board")) opener=`Create a refined ${out.toLowerCase()} for a ${room.toLowerCase()} in a ${style} direction.`;
    else if(out.includes("Presentation Board")) opener=`Create a professional university interior-design presentation board for a ${room.toLowerCase()}, with strong visual hierarchy and accurate architectural communication.`;
    else opener=`Create a high-end ${out.toLowerCase()} of a ${room.toLowerCase()} designed in a ${style} style.`;

    const active=[...document.querySelectorAll(".tag.active")].map(x=>x.textContent.trim()).join(", ");
    let p=(v("projectName")?`Project: ${v("projectName")}\n\n`:"")+opener+`\n\nCore design direction:
- Project type: ${v("projectType")}
- Style: ${style}
- Mood: ${v("mood")}
- Color palette: ${v("palette")}
- Materials: ${v("materials")}
- Furniture language: ${v("furniture")}
- Decor level: ${v("decor")}

Visual direction:
- Camera / view: ${v("camera")}
- Lighting: ${v("lighting")}
- Time of day: ${v("time")}
- Render quality: ${v("quality")}
- Background / context: ${v("background")}
- Output format: ${v("ratio")}
`;
    if(v("details")) p+=`\nProject requirements:\n${v("details")}\n`;
    if(v("preserve")) p+=`\nPreservation constraints:\n${v("preserve")}\n`;
    p+=`\nTechnical quality controls:\n${active || "Accurate scale, clean composition, realistic materials and controlled geometry."}\n`;
    if(v("negative")) p+=`\nAvoid:\n${v("negative")}\n`;
    p+=`\nFinal instruction:
Keep proportions believable, geometry controlled, furniture properly scaled, materials physically plausible, circulation clear and architectural details coherent. Do not alter fixed building elements unless specifically requested. Optimize the final prompt for ${v("engine")}.`;

    $("promptOutput").textContent=p;
    $("wordCount").textContent=p.split(/\s+/).filter(Boolean).length;
    $("engineStat").textContent=v("engine").split(" ")[0]||"—";
    $("outputStat").textContent=out.split(" ").slice(0,2).join(" ")||"—";
  }

  window.applyPreset = function(type){
    if(type==="luxury"){ $("outputType").value="Photorealistic 3D Interior"; $("style").value="Contemporary Luxury"; $("palette").value="Ivory, warm beige, walnut and muted olive"; $("materials").value="Ivory marble, walnut veneer, brushed brass, textured fabric"; $("camera").value="Eye-level, 28 mm architectural lens"; }
    if(type==="plan"){ $("outputType").value="Furnished Floor Plan"; $("camera").value="Strict 90-degree orthographic top view"; $("details").value="Use practical zoning, realistic furniture proportions, readable circulation and clear door/window openings."; }
    if(type==="cad"){ $("outputType").value="Unfurnished CAD Plan"; $("camera").value="Strict 90-degree orthographic top view"; $("preserve").value="Do not change the original footprint, walls, columns, doors, windows, openings, staircase geometry or circulation."; $("negative").value="No perspective distortion, no decorative rendering, no invented walls or openings."; }
    if(type==="mood"){ $("outputType").value="Interior Moodboard"; $("background").value="Clean white background"; $("details").value="Show coordinated material swatches, furniture references, lighting fixtures, fabrics, wood/stone finishes and the overall design palette."; }
    if(type==="uni"){ $("outputType").value="University Presentation Board"; $("quality").value="Technical architectural presentation"; $("details").value="Create a polished academic submission with clear hierarchy, accurate design logic, realistic materials and professional organization."; }
    if(type==="commercial"){ $("projectType").value="Commercial"; $("room").value="Travel Agency"; $("details").value="Include entrance sequence, reception, waiting, workstation zones, private offices and clear customer circulation."; }
    generatePrompt();
  }

  window.savePrompt = function(){
    const p=$("promptOutput").textContent;
    const projects=loadLocal("ips_projects",[]);
    projects.unshift({name:$("projectName").value||"Untitled Prompt", type:$("outputType").value, room:$("room").value, prompt:p, date:new Date().toLocaleDateString()});
    saveLocal("ips_projects",projects.slice(0,20));
    alert("Saved to Dashboard");
  }

  generatePrompt();
}

function initExplore(){
  if(!document.querySelector("[data-prompt-card]")) return;
  const search=$("exploreSearch");
  const filters=[...document.querySelectorAll(".filter")];
  function apply(){
    const q=(search?.value||"").toLowerCase();
    const active=document.querySelector(".filter.active")?.dataset.filter||"all";
    document.querySelectorAll("[data-prompt-card]").forEach(card=>{
      const okText=card.textContent.toLowerCase().includes(q);
      const okFilter=active==="all"||card.dataset.category===active;
      card.style.display=(okText&&okFilter)?"flex":"none";
    });
  }
  search?.addEventListener("input",apply);
  filters.forEach(f=>f.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));f.classList.add("active");apply()}));
  document.querySelectorAll("[data-use-prompt]").forEach(btn=>btn.addEventListener("click",()=>{
    const data=btn.closest("[data-prompt-card]").dataset;
    localStorage.setItem("ips_explore_preset",JSON.stringify(data));
    location.href="studio.html";
  }));
}

function initDashboard(){
  if(!$("projectsList")) return;
  const projects=loadLocal("ips_projects",[]);
  $("savedCount").textContent=projects.length;
  $("projectCount").textContent=new Set(projects.map(p=>p.name)).size;
  $("promptCount").textContent=projects.length;
  $("favCount").textContent=loadLocal("ips_favorites",[]).length;
  const list=$("projectsList");
  if(!projects.length){ list.innerHTML='<div class="empty">No saved projects yet. Create a prompt in Prompt Studio and press “Save”.</div>'; return; }
  list.innerHTML=projects.slice(0,8).map((p,i)=>`<div class="project-row"><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.room)} · ${escapeHtml(p.type)} · ${escapeHtml(p.date)}</small></div><span class="pill">Saved</span></div>`).join("");
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }

document.addEventListener("DOMContentLoaded",()=>{ initStudio(); initExplore(); initDashboard(); });
