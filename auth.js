(function(){
  const USER_KEY='structevo_user';
  const ACCOUNT_KEY='structevo_demo_account';
  const getUser=()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch(e){return null}};
  const getAccount=()=>{try{return JSON.parse(localStorage.getItem(ACCOUNT_KEY)||'null')}catch(e){return null}};
  const setUser=(u)=>localStorage.setItem(USER_KEY,JSON.stringify(u));
  const setAccount=(u)=>localStorage.setItem(ACCOUNT_KEY,JSON.stringify(u));
  const logout=()=>{localStorage.removeItem(USER_KEY);location.href='index.html'};

  function renderNav(){
    const user=getUser();
    document.querySelectorAll('.auth-login').forEach(a=>{
      if(user){a.textContent='Account';a.href='account.html';}
      else {a.textContent='Log in';a.href='login.html';}
    });
    document.querySelectorAll('.auth-cta').forEach(a=>{
      if(user){a.textContent='Dashboard';a.href='dashboard.html';}
      else {a.textContent='Start Free';a.href='signup.html';}
    });
  }

  function message(el,text,type='error'){
    if(!el)return;el.textContent=text;el.className='auth-message '+type;el.hidden=false;
  }

  function setupSignup(){
    const form=document.getElementById('signupForm'); if(!form)return;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const name=document.getElementById('signupName').value.trim();
      const email=document.getElementById('signupEmail').value.trim().toLowerCase();
      const password=document.getElementById('signupPassword').value;
      const confirm=document.getElementById('signupConfirm').value;
      const msg=document.getElementById('authMessage');
      if(!name||!email||!password){message(msg,'Complete all required fields.');return;}
      if(password.length<8){message(msg,'Use at least 8 characters for your password.');return;}
      if(password!==confirm){message(msg,'Passwords do not match.');return;}
      const user={name,email,plan:'Free',createdAt:new Date().toISOString()};
      setAccount(user);setUser(user);location.href='dashboard.html';
    });
  }

  function setupLogin(){
    const form=document.getElementById('loginForm'); if(!form)return;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const email=document.getElementById('loginEmail').value.trim().toLowerCase();
      const password=document.getElementById('loginPassword').value;
      const msg=document.getElementById('authMessage');
      const account=getAccount();
      if(!email||!password){message(msg,'Enter your email and password.');return;}
      if(!account||account.email!==email){message(msg,'No demo account was found for this email. Create an account first.');return;}
      setUser(account);location.href='dashboard.html';
    });
  }

  function setupAccount(){
    if(!document.getElementById('accountPage'))return;
    const user=getUser();
    if(!user){location.href='login.html';return;}
    document.querySelectorAll('[data-user-name]').forEach(x=>x.textContent=user.name||'Designer');
    document.querySelectorAll('[data-user-email]').forEach(x=>x.textContent=user.email||'');
    document.querySelectorAll('[data-user-plan]').forEach(x=>x.textContent=user.plan||'Free');
    document.getElementById('logoutBtn')?.addEventListener('click',logout);
  }

  window.StructevoAuth={getUser,getAccount,logout};
  document.addEventListener('DOMContentLoaded',()=>{renderNav();setupSignup();setupLogin();setupAccount();});
})();
