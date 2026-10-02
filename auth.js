(() => {
  const cfg = window.STRUCTEVO_AUTH_CONFIG || {};
  const configured = Boolean(cfg.supabaseUrl && cfg.supabasePublishableKey && window.supabase?.createClient);
  const LOCAL_USER_KEY = "structevo_user";
  const LOCAL_ACCOUNT_KEY = "structevo_account";
  const getLocalUser = () => { try { return JSON.parse(localStorage.getItem(LOCAL_USER_KEY)||"null"); } catch(e){ return null; } };
  const client = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  const $ = (id) => document.getElementById(id);
  const setMessage = (text, type = "") => {
    const el = $("authMessage");
    if (!el) return;
    el.textContent = text;
    el.className = "auth-message" + (type ? " " + type : "");
  };
  const setLoading = (form, loading, text) => {
    const btn = form?.querySelector(".auth-submit");
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = loading;
    btn.textContent = loading ? text : btn.dataset.label;
  };
  const authUnavailable = () => {
    setMessage("Account service is ready in the website files but still needs the Structevo Supabase project keys before it can create real accounts.", "warning");
  };

  async function applySessionUI() {
    let user = null; let localUser = null;
    if (client) {
      const { data } = await client.auth.getSession();
      user = data?.session?.user || null;
    } else { localUser = getLocalUser(); }
    const signedIn = Boolean(user || localUser);
    document.querySelectorAll(".auth-guest").forEach(el => el.hidden = signedIn);
    document.querySelectorAll(".auth-user").forEach(el => el.hidden = !signedIn);
    const fullName = user?.user_metadata?.full_name || localUser?.name || user?.email?.split("@")[0] || "Designer";
    const email = user?.email || localUser?.email || "";
    const plan = (user?.user_metadata?.plan || localUser?.plan || "free").toString().toUpperCase();
    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = fullName);
    if ($("accountName")) $("accountName").textContent = signedIn ? fullName : "Sign in required";
    if ($("accountEmail")) $("accountEmail").textContent = signedIn ? email : "Log in to access your workspace.";
    if ($("accountPlan")) $("accountPlan").textContent = plan;
  }

  document.querySelectorAll("[data-logout]").forEach(btn => btn.addEventListener("click", async () => {
    if (client) await client.auth.signOut();
    localStorage.removeItem(LOCAL_USER_KEY); localStorage.removeItem(LOCAL_ACCOUNT_KEY);
    location.href = "index.html";
  }));

  const loginForm = $("loginForm");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(loginForm, true, "Logging in…");
    setMessage("");
    if (!client) {
      const saved = (()=>{ try{return JSON.parse(localStorage.getItem(LOCAL_ACCOUNT_KEY)||"null")}catch(e){return null} })();
      const email=$("loginEmail").value.trim().toLowerCase();
      const password=$("loginPassword").value;
      setLoading(loginForm,false);
      if(!saved || saved.email?.toLowerCase()!==email || saved.password!==password) return setMessage("Incorrect email or password.","error");
      localStorage.setItem(LOCAL_USER_KEY,JSON.stringify({name:saved.name,email:saved.email,plan:saved.plan||"Free",role:saved.role||"Designer"}));
      return location.href="dashboard.html";
    }
    const { error } = await client.auth.signInWithPassword({ email: $("loginEmail").value.trim(), password: $("loginPassword").value });
    setLoading(loginForm, false);
    if (error) return setMessage(error.message, "error");
    location.href = "dashboard.html";
  });

  const params = new URLSearchParams(location.search);
  const requestedPlan = ["free","pro","studio"].includes(params.get("plan")) ? params.get("plan") : "free";
  if ($("selectedPlan")) $("selectedPlan").textContent = requestedPlan.toUpperCase();

  const signupForm = $("signupForm");
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(signupForm, true, "Creating account…");
    setMessage("");
    const email = $("signupEmail").value.trim();
    const name = $("signupName").value.trim();
    const role = $("signupRole").value;
    const password = $("signupPassword").value;
    if (!client) {
      const account={name,email,password,role,plan:requestedPlan.charAt(0).toUpperCase()+requestedPlan.slice(1),createdAt:new Date().toISOString()};
      localStorage.setItem(LOCAL_ACCOUNT_KEY,JSON.stringify(account));
      localStorage.setItem(LOCAL_USER_KEY,JSON.stringify({name,email,role,plan:account.plan}));
      setLoading(signupForm,false);
      return location.href="dashboard.html";
    }
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { data: { full_name:name, role, plan:requestedPlan }, emailRedirectTo: `${location.origin}/dashboard.html` }
    });
    setLoading(signupForm, false);
    if (error) return setMessage(error.message, "error");
    if (data?.session) location.href = "dashboard.html";
    else { setMessage("Account created. Check your email to confirm your address, then log in.", "success"); signupForm.reset(); }
  });

  if (client) {
    client.auth.onAuthStateChange(() => applySessionUI());
  }
  applySessionUI();
})();