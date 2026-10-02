(() => {
  const $ = id => document.getElementById(id);
  let mode = "interior";
  let lastImage = "";
  let generationCount = Number(localStorage.getItem("structevo_image_count") || 0);
  const sessionImages = [];

  const safe = (v) => (v || "").trim();
  const setMessage = (text, type="") => {
    const el = $("generatorMessage"); if (!el) return;
    el.textContent = text; el.className = "auth-message" + (type ? " " + type : "");
  };
  const setLoading = (loading) => {
    const btn = $("generateImage"); if (!btn) return;
    btn.disabled = loading; btn.textContent = loading ? "Generating…" : "Generate Image";
    $("generatorStatus").textContent = loading ? "GENERATING" : "READY";
    $("imageStage")?.classList.toggle("is-loading", loading);
  };
  function buildPrompt(){
    const brief = safe($("genBrief").value) || (mode === "interior" ? "A refined professional interior design concept" : "A refined professional architectural exterior concept");
    const constraints = [$("genNoText").checked ? "No text, labels, logos or watermarks." : "", $("genNoPeople").checked ? "No people." : "", $("genStraight").checked ? "Keep vertical lines straight and architectural perspective controlled." : ""].filter(Boolean).join(" ");
    const prompt = `Create a professional ${mode === "interior" ? "interior design visualization" : "architectural visualization"} for the following project.\n\nProject brief:\n${brief}\n\nDesign direction:\n- Style: ${$("genStyle").value}\n- Materials: ${$("genMaterials").value}\n- Lighting: ${$("genLighting").value}\n- Camera: ${$("genCamera").value}\n\nProfessional controls:\nUse believable scale, physically plausible materials, coherent construction logic, balanced composition, realistic global illumination, refined detailing and presentation-ready image quality. ${constraints}\n\nFinal instruction:\nCreate a polished, high-end result suitable for an interior design or architecture presentation. Do not invent contradictory geometry or visually impossible construction.`;
    $("genPrompt").value = prompt;
    return prompt;
  }
  function syncMeta(){
    $("generationMode").textContent = mode === "interior" ? "Interior" : "Architecture";
    const ratio = $("genRatio").value;
    $("generationRatio").textContent = ratio === "portrait" ? "3:4" : ratio === "square" ? "1:1" : "16:9";
    $("generationCount").textContent = generationCount;
  }
  function renderImage(dataUrl, prompt){
    lastImage = dataUrl;
    const stage = $("imageStage"); stage.className = "image-stage"; stage.innerHTML = `<img src="${dataUrl}" alt="Structevo AI generated design">`;
    $("imageActions").hidden = false;
    sessionImages.unshift({dataUrl,prompt,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})});
    if(sessionImages.length > 8) sessionImages.pop();
    const box = $("generationHistory"); box.innerHTML = sessionImages.map((x,i)=>`<button class="generation-thumb" type="button" data-history-index="${i}"><img src="${x.dataUrl}" alt="Generated design ${i+1}"><span>${x.time}</span></button>`).join("");
    box.querySelectorAll("[data-history-index]").forEach(b=>b.addEventListener("click",()=>{ const item=sessionImages[Number(b.dataset.historyIndex)]; if(item){ lastImage=item.dataUrl; stage.innerHTML=`<img src="${item.dataUrl}" alt="Structevo AI generated design">`; $("genPrompt").value=item.prompt; } }));
  }
  async function getSupabaseToken(){
    const cfg = window.STRUCTEVO_AUTH_CONFIG || {};
    if(!cfg.supabaseUrl || !cfg.supabasePublishableKey || !window.supabase?.createClient) return null;
    const client = window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
    const {data} = await client.auth.getSession();
    return data?.session?.access_token || null;
  }
  async function generate(){
    let prompt = safe($("genPrompt").value); if(!prompt) prompt = buildPrompt();
    if(prompt.length < 20) return setMessage("Add a little more detail to your design brief.","error");
    setMessage(""); setLoading(true);
    try{
      const token = await getSupabaseToken();
      const headers = {"Content-Type":"application/json"}; if(token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/generate-image",{method:"POST",headers,body:JSON.stringify({prompt,ratio:$("genRatio").value,quality:$("genQuality").value,mode})});
      const payload = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(payload.error || "Image generation is not activated yet.");
      if(!payload.image) throw new Error("No image was returned.");
      generationCount += 1; localStorage.setItem("structevo_image_count", String(generationCount)); syncMeta(); renderImage(payload.image,prompt); setMessage("Image generated successfully.","success");
    }catch(err){ setMessage(err.message || "Could not generate image.","error"); }
    finally{ setLoading(false); }
  }
  document.querySelectorAll("[data-gen-mode]").forEach(btn=>btn.addEventListener("click",()=>{ mode=btn.dataset.genMode; document.querySelectorAll("[data-gen-mode]").forEach(x=>x.classList.toggle("active",x===btn)); syncMeta(); buildPrompt(); }));
  ["genBrief","genStyle","genMaterials","genLighting","genCamera","genNoText","genNoPeople","genStraight"].forEach(id=>$(id)?.addEventListener("input",buildPrompt));
  $("genRatio")?.addEventListener("change",syncMeta);
  $("composePrompt")?.addEventListener("click",()=>{buildPrompt();setMessage("Professional prompt composed.","success")});
  $("generateImage")?.addEventListener("click",generate);
  $("generateVariation")?.addEventListener("click",generate);
  $("downloadImage")?.addEventListener("click",()=>{ if(!lastImage)return; const a=document.createElement("a");a.href=lastImage;a.download=`structevo-ai-${Date.now()}.png`;a.click(); });
  $("saveImageProject")?.addEventListener("click",()=>{ if(!lastImage)return; const items=JSON.parse(localStorage.getItem("structevo_generated_projects")||"[]");items.unshift({name:safe($("genProject").value)||"AI Design",mode,prompt:safe($("genPrompt").value),date:new Date().toLocaleDateString()});localStorage.setItem("structevo_generated_projects",JSON.stringify(items.slice(0,30)));setMessage("Saved to your Structevo project history.","success"); });
  const transferred = sessionStorage.getItem("structevo_generate_prompt"); if(transferred){ $("genPrompt").value=transferred; sessionStorage.removeItem("structevo_generate_prompt"); }
  syncMeta(); if(!$("genPrompt").value) buildPrompt();
})();
