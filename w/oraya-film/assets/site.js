(function(){
  var C = window.ORAYA_CONFIG || {};
  var qs = new URLSearchParams(location.search);
  var store = { get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}}, set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}} };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ---------- contact + links from config ---------- */
  var mail = C.contactEmail || 'frankie@orayalabs.ai';
  ['footMail','calMail'].forEach(function(id){var a=document.getElementById(id); if(a){a.href='mailto:'+mail; a.textContent=mail;}});
  document.querySelectorAll('.privMail').forEach(function(a){a.href='mailto:'+mail; a.textContent=mail;});

  /* ---------- attribution capture ---------- */
  var ATTR_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid','ttclid','for'];
  ATTR_KEYS.forEach(function(k){ var v=qs.get(k); if(v) store.set('oraya_'+k, v); });
  function attr(){ var o={}; ATTR_KEYS.forEach(function(k){ var v=qs.get(k)||store.get('oraya_'+k); if(v) o[k]=v; }); if(document.referrer) o.referrer=document.referrer; return o; }

  /* ---------- analytics (loads only when IDs are set) ---------- */
  window.dataLayer = window.dataLayer || [];
  if (C.gtmId){ (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',C.gtmId); }
  if (C.ga4Id){ var g=document.createElement('script'); g.async=true; g.src='https://www.googletagmanager.com/gtag/js?id='+C.ga4Id; document.head.appendChild(g); window.gtag=function(){dataLayer.push(arguments)}; gtag('js',new Date()); gtag('config',C.ga4Id); }
  if (C.metaPixelId){ !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init',C.metaPixelId); fbq('track','PageView'); }
  function track(evt, params){
    params = params || {};
    try{ dataLayer.push(Object.assign({event:evt}, params)); }catch(e){}
    try{ if(window.gtag) gtag('event', evt, params); }catch(e){}
    try{ if(window.fbq){ if(evt==='lead_submitted') fbq('track','Lead',params); else if(evt==='booking_complete') fbq('track','Schedule',params); else fbq('trackCustom',evt,params); } }catch(e){}
  }
  document.addEventListener('click', function(e){ var a=e.target.closest('[data-cta]'); if(a) track('cta_click',{location:a.getAttribute('data-cta')}); });

  /* ---------- niche personalization (?for=insurance etc.) ---------- */
  var NICHES = {
    'default':      {callout:'Business Owners:',          industry:'',                 script:'home'},
    'insurance':    {callout:'Insurance Agency Owners:',  industry:'Insurance agency', script:'insurance'},
    'agents':       {callout:'Insurance Agents:',         industry:'Insurance agency', script:'insurance'},
    'dealers':      {callout:'Dealership Operators:',     industry:'Auto dealership',  script:'auto'},
    'auto':         {callout:'Dealership Operators:',     industry:'Auto dealership',  script:'auto'},
    'home-services':{callout:'Home Service Owners:',      industry:'Home services',    script:'home'},
    'real-estate':  {callout:'Real Estate Teams:',        industry:'Real estate',      script:'realestate'},
    'law':          {callout:'Law Firm Owners:',          industry:'Law firm',         script:'law'}
  };
  var nicheKey = (qs.get('for') || store.get('oraya_for') || 'default').toLowerCase();
  var N = NICHES[nicheKey] || NICHES['default'];
  document.getElementById('callout').textContent = N.callout;
  if (N.industry){ document.getElementById('fIndustry').value = N.industry; }

  /* ---------- example call (VSL slot) ---------- */
  var SCRIPTS = {
    home:{biz:'Summit Heating & Air', when:'6:42 PM · After hours', result:'Booked · Tomorrow 9:00 AM · Text sent', lines:[
      ['ai','Hi, you’ve reached Summit Heating and Air. I’m Ava, the AI assistant, and this call may be recorded. How can I help?'],
      ['c','Our AC stopped blowing cold. Can someone come out tomorrow?'],
      ['ai','I can help with that. Is the unit running at all, or is it completely off?'],
      ['c','It’s running. Just warm air.'],
      ['ai','Got it. I have a technician open tomorrow at 9 AM or 1 PM. Which works better?'],
      ['c','Nine works.'],
      ['ai','You’re booked for 9 AM. I’ll text you a confirmation with your technician’s name now.']]},
    insurance:{biz:'Harbor Life & Annuity', when:'7:15 PM · After hours', result:'Booked · Licensed agent · Tomorrow 4:00 PM', lines:[
      ['ai','Hi, this is Ava, the AI assistant for Harbor Life. This call may be recorded. Are you calling about the quote you requested?'],
      ['c','Yeah, I filled out the form for term life.'],
      ['ai','Thanks for reaching out. A licensed agent will walk you through your options. Is tomorrow at 10 AM or 4 PM better?'],
      ['c','Four is better.'],
      ['ai','Done. You’re set with a licensed agent tomorrow at 4 PM. I’ll text you the details now.']]},
    auto:{biz:'Bayview Motors Service', when:'Saturday · 11:48 AM', result:'Booked · Monday 8:00 AM · Advisor notified', lines:[
      ['ai','Thanks for calling Bayview Motors service. I’m Ava, the AI assistant, and this call may be recorded. How can I help?'],
      ['c','I need an oil change, and my check engine light is on.'],
      ['ai','I can book both. What’s the year and model?'],
      ['c','2021 Camry.'],
      ['ai','I have Monday at 8 AM or Tuesday at 2 PM with an advisor. Which works?'],
      ['c','Monday at eight.'],
      ['ai','You’re booked for Monday at 8 AM. Your confirmation is on its way by text.']]},
    realestate:{biz:'Crestline Realty', when:'8:05 PM · After hours', result:'Showing booked · Saturday 11:00 AM', lines:[
      ['ai','Thanks for calling Crestline Realty. I’m Ava, the AI assistant, and this call may be recorded. Are you calling about one of our listings?'],
      ['c','Yes, the house on Maple Street. Is it still available?'],
      ['ai','It is. I can set up a showing with one of our agents. Is Thursday at 5 PM or Saturday at 11 AM better?'],
      ['c','Saturday.'],
      ['ai','You’re set for Saturday at 11 AM. I’ll text you the address and your agent’s name.']]},
    law:{biz:'Reed & Cole Law', when:'9:20 PM · After hours', result:'Consultation booked · Tomorrow 11:00 AM', lines:[
      ['ai','Thanks for calling Reed and Cole. I’m Ava, the firm’s AI intake assistant, and this call may be recorded. What can we help you with?'],
      ['c','I was in a car accident last week.'],
      ['ai','I’m sorry that happened. I can’t give legal advice, but I can book you a consultation with an attorney. Is tomorrow at 11 AM or 3 PM better?'],
      ['c','Eleven.'],
      ['ai','You’re booked for 11 AM tomorrow. I’ll text you a confirmation now.']]}
  };
  var S = SCRIPTS[N.script] || SCRIPTS.home;
  var vsl = document.getElementById('vsl');

  if (C.vslUrl){
    var isMp4 = /\.mp4(\?|$)/i.test(C.vslUrl);
    vsl.innerHTML = isMp4 ? '<video class="vsl-media" src="'+C.vslUrl+'" controls playsinline preload="metadata"></video>'
                          : '<iframe class="vsl-media" src="'+C.vslUrl+'" title="Oraya video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
  } else {
    var tr=document.getElementById('transcript'), wave=document.getElementById('wave'), state=document.getElementById('vslState'), res=document.getElementById('vslResult'), timerEl=document.getElementById('vslTimer');
    document.getElementById('vslBiz').textContent = S.biz;
    document.getElementById('vslWhen').textContent = S.when;
    for (var i=0;i<14;i++){ wave.appendChild(document.createElement('span')); }
    var bars = wave.children, run=0, timers=[], waveInt=null, clockInt=null, started=false;
    function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
    function wavy(on){ clearInterval(waveInt); if(!on||reduce){ for(var b=0;b<bars.length;b++) bars[b].style.height='30%'; return; } waveInt=setInterval(function(){ for(var b=0;b<bars.length;b++) bars[b].style.height=(20+Math.random()*80)+'%'; },120); }
    function clock(){ var s=0; clearInterval(clockInt); timerEl.textContent='00:00'; clockInt=setInterval(function(){ s++; timerEl.textContent=('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2); },1000); }
    function add(who,text,done){
      var m=document.createElement('div'); m.className='msg '+(who==='ai'?'ai':'caller-msg');
      var lab=document.createElement('small'); lab.textContent= who==='ai' ? 'Oraya AI' : 'Caller';
      var body=document.createElement('span'); m.appendChild(lab); m.appendChild(body); tr.appendChild(m);
      if (who==='ai' && !reduce){
        var k=0; wavy(true);
        (function type(){ body.textContent=text.slice(0,k); tr.scrollTop=tr.scrollHeight; if(k<text.length){ k+=2; timers.push(setTimeout(type,22)); } else { wavy(false); done(); } })();
      } else { body.textContent=text; tr.scrollTop=tr.scrollHeight; done(); }
    }
    function play(){
      run++; var my=run; timers.forEach(clearTimeout); timers=[]; tr.innerHTML=''; res.classList.remove('show');
      state.textContent='Incoming call'; clock();
      var idx=0;
      later(function(){ state.textContent='Answered by Oraya'; next(); }, 900);
      function next(){
        if (my!==run) return;
        if (idx>=S.lines.length){ clearInterval(clockInt); wavy(false); state.textContent='Call complete'; res.textContent=S.result; res.classList.add('show'); return; }
        var L=S.lines[idx++];
        later(function(){ add(L[0],L[1],function(){ later(next, (L[0]==='ai'?650:450)); }); }, (L[0]==='ai'?350:700));
      }
    }
    document.getElementById('replay').addEventListener('click', function(){ track('demo_replay'); play(); });
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es,o){ es.forEach(function(e){ if(e.isIntersecting && !started){ started=true; play(); o.disconnect(); } }); },{threshold:.35}).observe(vsl);
    } else { play(); }
  }

  /* ---------- install weeks ---------- */
  (function(){
    var wrap=document.getElementById('weekCards'), cfg=C.installWeeks||{}, n=cfg.count||4, full=cfg.full||[];
    var d=new Date(); d.setHours(0,0,0,0); var add=(8-d.getDay())%7; if(add===0) add=7; d.setDate(d.getDate()+add);
    for (var i=0;i<n;i++){
      var m=new Date(d); m.setDate(d.getDate()+i*7);
      var iso=m.getFullYear()+'-'+('0'+(m.getMonth()+1)).slice(-2)+'-'+('0'+m.getDate()).slice(-2);
      var isFull=full.indexOf(iso)>-1;
      var el=document.createElement('div'); el.className='wk '+(isFull?'full':'open');
      el.innerHTML='<div class="d">'+m.toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</div><div class="w">Install week</div><span class="st">'+(isFull?'Full':'Open')+'</span>';
      wrap.appendChild(el);
    }
  })();

  /* ---------- form + Cal.com ---------- */
  var form=document.getElementById('leadForm'), formStarted=false;
  form.addEventListener('focusin', function(){ if(!formStarted){ formStarted=true; track('form_start'); } });
  function setErr(id,msg){ var f=document.getElementById(id).closest('.f'); f.classList.toggle('bad',!!msg); f.querySelector('.err').textContent=msg||''; }
  function validate(){
    var ok=true, v=function(id){return document.getElementById(id).value.trim();};
    [['fName','Enter your name.'],['fCompany','Enter your business name.'],['fIndustry','Pick your industry.'],['fVolume','Pick a range.']].forEach(function(p){ if(!v(p[0])){ setErr(p[0],p[1]); ok=false; } else setErr(p[0]); });
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('fEmail'))){ setErr('fEmail','Enter a valid email address.'); ok=false; } else setErr('fEmail');
    if(v('fPhone').replace(/\D/g,'').length<10){ setErr('fPhone','Enter a 10-digit phone number.'); ok=false; } else setErr('fPhone');
    return ok;
  }
  function send(payload){
    return; /* mirror: no lead webhook */
    if(!C.webhookUrl) return;
    var body=JSON.stringify(payload);
    fetch(C.webhookUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true})
      .catch(function(){ fetch(C.webhookUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:body,keepalive:true}).catch(function(){}); });
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate()){ var b=form.querySelector('.bad input, .bad select'); if(b) b.focus(); return; }
    var val=function(id){return document.getElementById(id).value.trim();};
    var consent=document.getElementById('fConsent').checked;
    var payload={
      name:val('fName'), company:val('fCompany'), email:val('fEmail'), phone:val('fPhone'),
      industry:val('fIndustry'), volume:val('fVolume'), leak:val('fLeak')||'Not sure yet',
      consent:consent, consent_text: consent ? document.getElementById('consentText').textContent : null,
      consent_at: consent ? new Date().toISOString() : null,
      niche:nicheKey, page:location.href.split('#')[0], user_agent:navigator.userAgent, submitted_at:new Date().toISOString(),
      attribution:attr()
    };
    send(payload);
    track('lead_submitted',{industry:payload.industry, volume:payload.volume});
    openCal(payload);
  });

  function openCal(p){
    document.getElementById('step1').style.display='none';
    document.getElementById('cal-wrap').style.display='block';
    var first=p.name.split(' ')[0];
    document.getElementById('thanksLine').textContent='Thanks, '+first+'. Choose a slot for your free 30-minute audit.';
    var notes='Business: '+p.company+' | Industry: '+p.industry+' | Leads and calls per month: '+p.volume+' | Biggest leak: '+p.leak+' | Phone: '+p.phone;
    var a=p.attribution||{};
    var link=C.calLink||'oraya/30min';
    var direct='https://cal.com/'+link+'?name='+encodeURIComponent(p.name)+'&email='+encodeURIComponent(p.email)+'&notes='+encodeURIComponent(notes);
    document.getElementById('calDirect').href=direct;
    document.getElementById('formCard').scrollIntoView({behavior: reduce?'auto':'smooth', block:'start'});
    track('booking_view'); document.getElementById('calFallback').style.display='block'; document.getElementById('cal-inline').innerHTML='<p class="form-legal">Preview mirror: the live booking calendar opens on the real site.</p>'; return; /* mirror: no cal.com embed */
    (function (C2, A, L) { var p2=function(a,ar){a.q.push(ar);}; var d=C2.document; C2.Cal=C2.Cal||function(){ var cal=C2.Cal; var ar=arguments; if(!cal.loaded){ cal.ns={}; cal.q=cal.q||[]; var sc=d.createElement('script'); sc.src=A; sc.onerror=function(){ var fb=document.getElementById('calFallback'); if(fb) fb.style.display='block'; }; d.head.appendChild(sc); cal.loaded=true; } if(ar[0]===L){ var api=function(){p2(api,arguments);}; var namespace=ar[1]; api.q=api.q||[]; if(typeof namespace==='string'){ cal.ns[namespace]=cal.ns[namespace]||api; p2(cal.ns[namespace],ar); p2(cal,['initNamespace',namespace]); } else p2(cal,ar); return; } p2(cal,ar); }; })(window,'https://app.cal.com/embed/embed.js','init');
    Cal('init','audit',{origin:'https://cal.com'});
    var cfg={name:p.name, email:p.email, notes:notes, theme:'dark'};
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){ if(a[k]) cfg['metadata['+k+']']=a[k]; });
    cfg['metadata[niche]']=nicheKey;
    Cal.ns.audit('inline',{elementOrSelector:'#cal-inline', calLink:link, layout:'month_view', config:cfg});
    Cal.ns.audit('ui',{theme:'dark', hideEventTypeDetails:false, layout:'month_view', cssVarsPerTheme:{dark:{'cal-brand':'#a78bfa'},light:{'cal-brand':'#7c3aed'}}});
    var done=function(){ track('booking_complete',{industry:p.industry}); };
    Cal.ns.audit('on',{action:'bookingSuccessful', callback:done});
    Cal.ns.audit('on',{action:'bookingSuccessfulV2', callback:done});
    setTimeout(function(){ if(!document.querySelector('#cal-inline iframe')) document.getElementById('calFallback').style.display='block'; }, 9000);
  }

  /* ---------- privacy dialog ---------- */
  var dlg=document.getElementById('privacy');
  document.querySelectorAll('[data-open="privacy"]').forEach(function(b){ b.addEventListener('click', function(){ if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open',''); }); });
  dlg.querySelector('[data-close]').addEventListener('click', function(){ dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
  dlg.addEventListener('click', function(e){ if(e.target===dlg) dlg.close(); });

  /* ---------- sticky mobile CTA ---------- */
  var sticky=document.getElementById('sticky'), heroEl=document.getElementById('top'), bookEl=document.getElementById('book'), finalEl=document.getElementById('final');
  var heroOut=false, bookIn=false, finalIn=false;
  function upd(){ sticky.classList.toggle('show', heroOut && !bookIn && !finalIn); }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.target===heroEl) heroOut=!e.isIntersecting; if(e.target===bookEl) bookIn=e.isIntersecting; if(e.target===finalEl) finalIn=e.isIntersecting; }); upd(); },{threshold:0, rootMargin:'-120px 0px 0px 0px'}).observe(heroEl);
    var io2=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.target===bookEl) bookIn=e.isIntersecting; if(e.target===finalEl) finalIn=e.isIntersecting; }); upd(); },{threshold:.1});
    io2.observe(bookEl); io2.observe(finalEl);
  }
  /* tuck the sticky button away while scrolling down, bring it back on pause or scroll up */
  var lastY=window.scrollY, tuckT=0;
  window.addEventListener('scroll', function(){
    var y=window.scrollY, d=y-lastY; lastY=y;
    if(d>2){ sticky.classList.add('tuck'); clearTimeout(tuckT); tuckT=setTimeout(function(){ sticky.classList.remove('tuck'); }, 650); }
    else if(d<-2){ sticky.classList.remove('tuck'); }
  }, {passive:true});

  /* swipe rails: page dots follow the snapped slide */
  document.querySelectorAll('[data-rail]').forEach(function(rail){
    var dots=rail.nextElementSibling && rail.nextElementSibling.classList.contains('dots') ? rail.nextElementSibling.children : null;
    if(!dots) return;
    function mark(){ var w=rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width+12 : 1; var i=Math.round(rail.scrollLeft/w); for(var k=0;k<dots.length;k++) dots[k].classList.toggle('on', k===Math.min(dots.length-1,i)); }
    rail.addEventListener('scroll', function(){ requestAnimationFrame(mark); }, {passive:true}); mark();
  });
})();
