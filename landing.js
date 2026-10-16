(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s){return [].slice.call(document.querySelectorAll(s))};
  var modal=$("#modal"), card=$("#card"), mode="signin", busy=false, lastFocus;

  /* ripple on every button */
  document.addEventListener("click",function(e){
    var b=e.target.closest(".btn"); if(!b) return;
    var r=b.getBoundingClientRect(), s=Math.max(r.width,r.height)*2, d=document.createElement("span");
    d.className="rip"; d.style.cssText="width:"+s+"px;height:"+s+"px;left:"+(e.clientX-r.left-s/2)+"px;top:"+(e.clientY-r.top-s/2)+"px";
    b.appendChild(d); setTimeout(function(){d.remove()},650);
  });

  /* toast */
  function toast(t,m){var d=document.createElement("div");d.className="toast";d.innerHTML="<b></b><span></span>";d.firstChild.textContent=t;d.lastChild.textContent=m;$("#toasts").appendChild(d);setTimeout(function(){d.remove()},3500)}

  /* modal */
  function setMode(m,silent){
    mode=m; var up=m==="signup";
    card.classList.toggle("signup",up);
    var t=$("#mt"),s=$("#ms");
    t.textContent=up?"Create your account":"Welcome back";
    s.textContent=up?"Join to report and track issues in your area.":"Sign in to report an issue or manage your ward.";
    $("#fg").style.display=up?"none":"";
    $("#swt").textContent=up?"Already have an account?":"New to Community Issue Reporter?";
    $("#swl").textContent=up?"Sign in":"Create an account";
    $("#sb").textContent=up?"Create account":"Sign in";
    $("#pw").setAttribute("autocomplete",up?"new-password":"current-password");
    if(!silent){[t,s,$("#sb")].forEach(function(el){el.classList.remove("swap");void el.offsetWidth;el.classList.add("swap")})}
    alertMsg("");
  }
  function open(m){lastFocus=document.activeElement;setMode(m,true);if(cfgMsg)alertMsg(cfgMsg);modal.classList.add("open");setTimeout(function(){$("#em").focus()},500)}
  function close(){modal.classList.remove("open");busy=false;reset();if(lastFocus)lastFocus.focus()}
  $$("[data-open]").forEach(function(b){b.addEventListener("click",function(){open(b.dataset.open)})});
  modal.addEventListener("click",function(e){if(e.target===modal||e.target.hasAttribute("data-close"))close()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&modal.classList.contains("open"))close()});
  $("#swl").addEventListener("click",function(e){e.preventDefault();setMode(mode==="signin"?"signup":"signin")});
  $("#eye").addEventListener("click",function(){var p=$("#pw"),h=p.type==="password";p.type=h?"text":"password";this.textContent=h?"Hide":"Show"});

  function alertMsg(m){var a=$("#al");a.classList.remove("show");if(m){a.textContent=m;void a.offsetWidth;a.classList.add("show")}}
  function shake(){card.classList.remove("shake");void card.offsetWidth;card.classList.add("shake")}
  function reset(){var b=$("#sb");b.disabled=false;b.classList.remove("ok");b.textContent=mode==="signup"?"Create account":"Sign in";var g=$("#gb");g.disabled=false}

  /* Auth: delegates to the repo's CF helpers (app.js + config.js) */
  var hasCF=!!window.CF, cfgMsg="";
  function auth(kind,n,e,p){
    if(!hasCF)return new Promise(function(r){setTimeout(function(){r({role:"citizen"})},1500)});
    if(kind==="google")return CF.signInGoogle();
    if(kind==="signup")return CF.signUpEmail(n,e,p);
    return CF.signInEmail(e,p);
  }
  function success(s){
    var b=$("#sb");b.classList.add("ok");b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg> Success';
    var staff=s&&s.role==="staff";
    toast("Signed in",staff?"Opening the municipal console\u2026":"Opening your dashboard\u2026");
    setTimeout(function(){if(hasCF&&CF.navigate)CF.navigate(staff?"admin.html":"dashboard.html");else close()},1100);
  }
  function fail(err){
    busy=false;reset();
    var msg=hasCF?((err&&err.status)?CF.errText(err):CF.authMessage(err)):(err&&err.message);
    if(msg){shake();alertMsg(msg)}
  }

  $("#form").addEventListener("submit",function(e){
    e.preventDefault(); if(busy)return;
    var em=$("#em").value.trim(),pw=$("#pw").value,okE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em),okP=pw.length>=6;
    $("#fe").classList.toggle("bad",!okE);$("#fp").classList.toggle("bad",!okP);
    if(!okE||!okP){alertMsg("Please fix the highlighted fields and try again.");shake();return}
    alertMsg("");busy=true;
    var b=$("#sb");b.disabled=true;b.innerHTML='<span class="sp"></span> '+(mode==="signup"?"Creating account…":"Signing in…");
    auth(mode,$("#nm").value.trim(),em,pw).then(success).catch(fail);
  });
  $("#gb").addEventListener("click",function(){
    if(busy)return;busy=true;this.disabled=true;
    auth("google").then(success).catch(fail);
  });
  $("#fgl").addEventListener("click",function(e){
    e.preventDefault();var em=$("#em").value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){$("#fe").classList.add("bad");alertMsg("Enter your email above, then click Forgot password again.");shake();return}
    alertMsg("");
    (hasCF&&CF.resetPassword?CF.resetPassword(em):Promise.resolve())
      .then(function(){toast("Check your inbox","If an account exists, a reset link is on its way.")})
      .catch(function(err){alertMsg(hasCF?CF.authMessage(err):"Could not send the reset email.")});
  });
  ["em","pw"].forEach(function(id){$("#"+id).addEventListener("input",function(){this.closest(".f").classList.remove("bad")})});

  /* scroll reveal */
  var how=$("#how"),io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){how.classList.add("in-view");io.disconnect()}})},{threshold:.25});
  io.observe(how);

  /* hero tilt */
  var art=$("#art");
  if(matchMedia("(hover:hover)").matches&&!matchMedia("(prefers-reduced-motion:reduce)").matches){
    document.addEventListener("mousemove",function(e){
      var x=(e.clientX/innerWidth-.5)*2,y=(e.clientY/innerHeight-.5)*2;
      if(art.getAnimations().every(function(a){return a.playState==="finished"||a.playState==="idle"}))art.style.transform="perspective(1000px) rotateY("+x*4+"deg) rotateX("+(-y*4)+"deg)";
    });
  }

  /* theme */
  var tt=$("#tt");
  tt.textContent=document.documentElement.getAttribute("data-theme")==="dark"?"🌞":"🌙";
  tt.addEventListener("click",function(){
    var l=document.documentElement.getAttribute("data-theme")==="dark",n=l?"light":"dark";
    document.documentElement.setAttribute("data-theme",n);tt.textContent=l?"🌙":"🌞";
    try{localStorage.setItem("theme",n)}catch(e){}
  });

  /* Firebase: preload SDK, warn if unconfigured, skip the form if already signed in */
  if(hasCF){
    if(CF.init)CF.init().catch(function(){});
    if(CF.firebaseConfigured&&!CF.firebaseConfigured()){cfgMsg="Firebase is not configured yet. Fill in config.js with your project's web config."}
    else if(CF.loadSession){CF.loadSession().then(function(s){if(s)success(s)}).catch(function(){})}
  }
})();
