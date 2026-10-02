
let discipline="interior";
const $=id=>document.getElementById(id);
const studioIds=["projectName","engine","outputType","room","style","palette","materials","furniture","archOutput","buildingType","archStyle","facade","context","climate","massing","landscape","camera","lighting","ratio","quality","details","preserve","negative"];

function getUser(){try{return JSON.parse(localStorage.getItem("structevo_user")||"null")}catch(e){return null}}
function saveUser(u){localStorage.setItem("structevo_user",JSON.stringify(u))}
function getPlan(){return localStorage.getItem("structevo_plan")||"Free"}
function setPlan(p){localStorage.setItem("structevo_plan",p)}

function renderNav(){
  const box=$("navAuth"); if(!box)return;
  const u=getUser();
  if(u){
    const initials=(u.name||u.email||"U").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
    box.innerHTML=`<a class="btn soft" href="dashboard.html">Dashboard</a><a class="avatar" href="account.html">${initials}</a>`;
  }
}
function signupUser(e){e.preventDefault();const u={name:$("signupName").value,email:$("signupEmail").value,role:$("signupRole").value};saveUser(u);if(!localStorage.getItem("structevo_plan"))setPlan("Free");location.href="dashboard.html"}
function loginUser(e){e.preventDefault();saveUser({name:$("loginEmail").value.split("@")[0],email:$("loginEmail").value,role:"Interior + Architecture"});if(!localStorage.getItem("structevo_plan"))setPlan("Free");location.href="dashboard.html"}
function demoGoogleLogin(){saveUser({name:"Demo User",email:"demo@structevo.ai",role:"Interior + Architecture"});if(!localStorage.getItem("structevo_plan"))setPlan("Free");location.href="dashboard.html"}
function logoutUser(){localStorage.removeItem("structevo_user");location.href="index.html"}
function selectPlan(plan){setPlan(plan);const u=getUser();location.href=u?"account.html":"signup.html"}
function setBilling(mode){
  $("monthlyToggle")?.classList.toggle("active",mode==="monthly");$("yearlyToggle")?.classList.toggle("active",mode==="yearly");
  document.querySelectorAll(".amount[data-monthly]").forEach(el=>{const v=mode==="monthly"?el.dataset.monthly:el.dataset.yearly;el.innerHTML=`${v} <span>/ month${mode==="yearly"?" · billed yearly":""}</span>`})
}

function loadDashboard(){
  if(!$("dashboardProjects"))return;
  const u=getUser(); if(u)$("dashboardHello").textContent=`Welcome back, ${u.name.split(" ")[0]}.`;
  let projects=[];try{projects=JSON.parse(localStorage.getItem("structevo_projects")||"[]")}catch(e){}
  $("dashProjects").textContent=new Set(projects.map(p=>p.name)).size;
  $("dashPrompts").textContent=projects.length;
  $("dashInterior").textContent=projects.filter(p=>p.discipline==="interior").length;
  $("dashArchitecture").textContent=projects.filter(p=>p.discipline==="architecture").length;
  $("currentPlan").textContent=getPlan();
  $("planCopy").textContent=getPlan()==="Free"?"5 saved projects and basic Interior + Architecture access.":"Advanced controls, unlimited projects and Pro workflow access.";
  const box=$("dashboardProjects");
  box.innerHTML=projects.length?projects.slice(0,8).map(p=>`<div class="project-row"><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.discipline)} · ${escapeHtml(p.date)}</small></div><span class="pill">${escapeHtml(p.discipline)}</span></div>`).join(""):'<div style="padding:28px;border:1px dashed #c8bfb3;border-radius:14px;text-align:center;color:#716b63;font-size:9px">No saved projects yet. Create your first prompt in the Studio.</div>';
}
function loadAccount(){
  if(!$("accountName"))return;const u=getUser()||{name:"Guest",email:"—",role:"Interior + Architecture"};const plan=getPlan();
  $("accountName").textContent=u.name;$("accountEmail").textContent=u.email;$("accountRole").textContent=u.role||"Interior + Architecture";$("accountPlan").textContent=`${plan} Plan`;
  $("accountPlanText").textContent=plan==="Free"?"Basic access with up to 5 saved projects.":"Advanced controls, unlimited projects and premium workflow access.";
}

function setDiscipline(mode){
  discipline=mode;
  $("modeInterior")?.classList.toggle("active",mode==="interior");$("modeArchitecture")?.classList.toggle("active",mode==="architecture");
  document.querySelectorAll(".interior-only").forEach(x=>x.style.display=mode==="interior"?(x.classList.contains("formgrid")?"grid":"flex"):"none");
  document.querySelectorAll(".arch-only").forEach(x=>x.style.display=mode==="architecture"?(x.classList.contains("formgrid")?"grid":"flex"):"none");
  if($("interiorPresets"))$("interiorPresets").style.display=mode==="interior"?"grid":"none";
  if($("architecturePresets"))$("architecturePresets").style.display=mode==="architecture"?"grid":"none";
  if($("disciplineLabel"))$("disciplineLabel").textContent=mode==="interior"?"INTERIOR":"ARCHITECTURE";
  if($("modeStat"))$("modeStat").textContent=mode==="interior"?"Interior":"Architecture";
  generatePrompt();
}
function v(id){return $(id)?.value?.trim()||""}
function tags(){return [...document.querySelectorAll(".tag.active")].map(x=>x.textContent.trim()).join(", ")}
function generatePrompt(){
  if(!$("promptOutput"))return;
  let p=""; if(v("projectName"))p+=`Project: ${v("projectName")}\n\n`;
  if(discipline==="interior")p+=`Create a professional ${v("outputType").toLowerCase()} for a ${v("room").toLowerCase()}.\n\nInterior design direction:\n- Style: ${v("style")}\n- Color palette: ${v("palette")}\n- Materials: ${v("materials")}\n- Furniture language: ${v("furniture")}\n`;
  else p+=`Create a professional ${v("archOutput").toLowerCase()} for a ${v("buildingType").toLowerCase()}.\n\nArchitectural design direction:\n- Architectural style: ${v("archStyle")}\n- Façade system: ${v("facade")}\n- Site / context: ${v("context")}\n- Climate response: ${v("climate")}\n- Massing language: ${v("massing")}\n- Landscape approach: ${v("landscape")}\n\nArchitectural priorities:\nDevelop a coherent relationship between massing, façade rhythm, structure, openings, shading, climate response, access, pedestrian movement and landscape. Maintain believable construction logic and realistic architectural proportions.\n`;
  p+=`\nVisual direction:\n- Camera / view: ${v("camera")}\n- Lighting: ${v("lighting")}\n- Quality: ${v("quality")}\n- Output format: ${v("ratio")}\n`;
  if(v("details"))p+=`\nProject requirements:\n${v("details")}\n`; if(v("preserve"))p+=`\nPreservation constraints:\n${v("preserve")}\n`; p+=`\nTechnical controls:\n${tags()}\n`; if(v("negative"))p+=`\nAvoid:\n${v("negative")}\n`;
  p+=`\nFinal instruction:\nKeep geometry controlled, scale believable, materials physically plausible, verticals straight and the design architecturally coherent. Do not invent major fixed elements when a plan, massing model, CAD drawing or reference image is supplied. Optimize the final result for ${v("engine")}.`;
  $("promptOutput").textContent=p;$("wordCount").textContent=p.split(/\s+/).filter(Boolean).length;$("engineStat").textContent=v("engine").split(" ")[0]||"—";
}
async function copyPrompt(btn){try{await navigator.clipboard.writeText($("promptOutput").textContent);const o=btn.textContent;btn.textContent="Copied ✓";setTimeout(()=>btn.textContent=o,900)}catch(e){}}
function savePrompt(){
  let arr=[];try{arr=JSON.parse(localStorage.getItem("structevo_projects")||"[]")}catch(e){}
  if(getPlan()==="Free"&&arr.length>=5){alert("Free plan includes up to 5 saved projects. Upgrade to Pro for unlimited projects.");return}
  arr.unshift({name:v("projectName")||"Untitled Project",discipline,prompt:$("promptOutput").textContent,date:new Date().toLocaleDateString()});localStorage.setItem("structevo_projects",JSON.stringify(arr.slice(0,50)));alert("Saved to Dashboard");
}
function applyPreset(t){setDiscipline("interior");if(t==="luxury"){ $("outputType").value="Photorealistic 3D Interior";$("style").value="Contemporary Luxury"}if(t==="plan"){ $("outputType").value="Furnished Floor Plan";$("camera").value="Strict orthographic top view"}if(t==="mood")$("outputType").value="Interior Moodboard";if(t==="commercial")$("room").value="Travel Agency";if(t==="uni"){ $("outputType").value="University Presentation Board";$("ratio").value="A3 presentation board"}if(t==="cad"){ $("outputType").value="Unfurnished CAD Plan";$("camera").value="Strict orthographic top view"}generatePrompt()}
function applyArchPreset(t){setDiscipline("architecture");if(t==="villa"){ $("archOutput").value="Photorealistic Architectural Exterior";$("buildingType").value="Luxury Villa"}if(t==="facade")$("archOutput").value="Façade Design Study";if(t==="massing")$("archOutput").value="Concept Massing Visualization";if(t==="masterplan"){ $("archOutput").value="Masterplan Visualization";$("buildingType").value="Urban Development";$("camera").value="Bird's-eye architectural view"}if(t==="tower")$("buildingType").value="Mixed-use Tower";if(t==="site"){ $("archOutput").value="Site Plan Visualization";$("camera").value="Strict orthographic top view"}generatePrompt()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}

document.addEventListener("DOMContentLoaded",()=>{renderNav();loadDashboard();loadAccount();studioIds.forEach(id=>$(id)?.addEventListener("input",generatePrompt));document.querySelectorAll(".tag").forEach(t=>t.addEventListener("click",()=>{t.classList.toggle("active");generatePrompt()}));if($("promptOutput"))setDiscipline("interior");});
