import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{_ as t,c as n,f as r,i,l as a,m as o,n as s,r as c,s as l,t as u,u as d}from"./postprocessing-CDWo1M6v.js";import{s as f,t as p}from"./r3f-BzHmD1qk.js";import{$ as m,A as h,B as g,Ct as _,E as v,F as y,I as b,J as x,N as S,O as C,P as w,Q as T,S as E,St as D,U as O,V as k,Z as ee,a as A,b as j,c as te,ct as M,d as N,ft as ne,gt as re,ht as P,i as ie,j as F,k as I,lt as ae,m as L,o as R,p as z,q as oe,s as B,ut as se,w as V,x as ce,xt as H}from"./three-BnNSZouK.js";import{n as le,r as ue}from"./index-DPRBi1KT.js";import{n as U,r as W,t as de}from"./SplitText-fg9FcGYf.js";import{t as fe}from"./heroNav-Bd2Rmfeq.js";var G=e(t(),1),pe=`1.3.23`;function me(e,t,n){return Math.max(e,Math.min(t,n))}function he(e,t,n){return(1-n)*e+n*t}function ge(e,t,n,r){return he(e,t,1-Math.exp(-n*r))}function _e(e,t){return(e%t+t)%t}var ve=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(e){if(!this.isRunning)return;let t=!1;if(this.duration&&this.easing){this.currentTime+=e;let n=me(0,this.currentTime/this.duration,1);t=n>=1;let r=t?1:this.easing(n);this.value=this.from+(this.to-this.from)*r}else this.lerp?(this.value=ge(this.value,this.to,this.lerp*60,e),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,t=!0)):(this.value=this.to,t=!0);t&&this.stop(),this.onUpdate?.(this.value,t)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n,duration:r,easing:i,onStart:a,onUpdate:o}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=r,this.easing=i,this.currentTime=0,this.isRunning=!0,a?.(),this.onUpdate=o}};function ye(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>{n=void 0,e.apply(this,r)},t)}}var be=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(e,t,{autoResize:n=!0,debounce:r=250}={}){this.wrapper=e,this.content=t,n&&(this.debouncedResize=ye(this.resize,r),this.wrapper instanceof Window?window.addEventListener(`resize`,this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener(`resize`,this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},xe=class{events={};emit(e,...t){let n=this.events[e]||[];for(let e=0,r=n.length;e<r;e++)n[e]?.(...t)}on(e,t){return this.events[e]?this.events[e].push(t):this.events[e]=[t],()=>{this.events[e]=this.events[e]?.filter(e=>t!==e)}}off(e,t){this.events[e]=this.events[e]?.filter(e=>t!==e)}destroy(){this.events={}}},Se=100/6,Ce={passive:!1};function we(e,t){return e===1?Se:e===2?t:1}var Te=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new xe;constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){this.element=e,this.options=t,window.addEventListener(`resize`,this.onWindowResize),this.onWindowResize(),this.element.addEventListener(`wheel`,this.onWheel,Ce),this.element.addEventListener(`touchstart`,this.onTouchStart,Ce),this.element.addEventListener(`touchmove`,this.onTouchMove,Ce),this.element.addEventListener(`touchend`,this.onTouchEnd,Ce)}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener(`resize`,this.onWindowResize),this.element.removeEventListener(`wheel`,this.onWheel,Ce),this.element.removeEventListener(`touchstart`,this.onTouchStart,Ce),this.element.removeEventListener(`touchmove`,this.onTouchMove,Ce),this.element.removeEventListener(`touchend`,this.onTouchEnd,Ce)}onTouchStart=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit(`scroll`,{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,r=-(t-this.touchStart.x)*this.options.touchMultiplier,i=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:r,y:i},this.emitter.emit(`scroll`,{deltaX:r,deltaY:i,event:e})};onTouchEnd=e=>{this.emitter.emit(`scroll`,{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:n,deltaMode:r}=e,i=we(r,this.window.width),a=we(r,this.window.height);t*=i,n*=a,t*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit(`scroll`,{deltaX:t,deltaY:n,event:e})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},Ee=e=>Math.min(1,1.001-2**(-10*e)),De=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new ve;emitter=new xe;dimensions;virtualScroll;constructor({wrapper:e=window,content:t=document.documentElement,eventsTarget:n=e,smoothWheel:r=!0,syncTouch:i=!1,syncTouchLerp:a=.075,touchInertiaExponent:o=1.7,duration:s,easing:c,lerp:l=.1,infinite:u=!1,orientation:d=`vertical`,gestureOrientation:f=d===`horizontal`?`both`:`vertical`,touchMultiplier:p=1,wheelMultiplier:m=1,autoResize:h=!0,prevent:g,virtualScroll:_,overscroll:v=!0,autoRaf:y=!1,anchors:b=!1,autoToggle:x=!1,allowNestedScroll:S=!1,__experimental__naiveDimensions:C=!1,naiveDimensions:w=C,stopInertiaOnNavigate:T=!1}={}){window.lenisVersion=pe,window.lenis||(window.lenis={}),window.lenis.version=pe,d===`horizontal`&&(window.lenis.horizontal=!0),i===!0&&(window.lenis.touch=!0),(!e||e===document.documentElement)&&(e=window),typeof s==`number`&&typeof c!=`function`?c=Ee:typeof c==`function`&&typeof s!=`number`&&(s=1),this.options={wrapper:e,content:t,eventsTarget:n,smoothWheel:r,syncTouch:i,syncTouchLerp:a,touchInertiaExponent:o,duration:s,easing:c,lerp:l,infinite:u,gestureOrientation:f,orientation:d,touchMultiplier:p,wheelMultiplier:m,autoResize:h,prevent:g,virtualScroll:_,overscroll:v,autoRaf:y,anchors:b,autoToggle:x,allowNestedScroll:S,naiveDimensions:w,stopInertiaOnNavigate:T},this.dimensions=new be(e,t,{autoResize:h}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.addEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener(`click`,this.onClick),this.options.wrapper.addEventListener(`pointerdown`,this.onPointerDown),this.virtualScroll=new Te(n,{touchMultiplier:p,wheelMultiplier:m}),this.virtualScroll.on(`scroll`,this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener(`transitionend`,this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.removeEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener(`pointerdown`,this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener(`click`,this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}onScrollEnd=e=>{e instanceof CustomEvent||(this.isScrolling===`smooth`||this.isScrolling===!1)&&e.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent(`scrollend`,{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){let e=this.isHorizontal?`overflow-x`:`overflow-y`;return getComputedStyle(this.rootElement)[e]}checkOverflow(){[`hidden`,`clip`].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=e=>{e.propertyName?.includes(`overflow`)&&e.target===this.rootElement&&this.checkOverflow()};setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:`instant`}):this.options.wrapper.scrollTo({top:e,behavior:`instant`})}onClick=e=>{let t=e.composedPath().filter(e=>e instanceof HTMLAnchorElement&&e.href).map(e=>new URL(e.href)),n=new URL(window.location.href);if(this.options.anchors){let e=t.find(e=>n.host===e.host&&n.pathname===e.pathname&&e.hash);if(e){let t=typeof this.options.anchors==`object`&&this.options.anchors?this.options.anchors:void 0,n=`#${e.hash.split(`#`)[1]}`;this.scrollTo(n,t);return}}if(this.options.stopInertiaOnNavigate&&t.some(e=>n.host===e.host&&n.pathname!==e.pathname)){this.reset();return}};onPointerDown=e=>{e.button===1&&this.reset()};onVirtualScroll=e=>{if(typeof this.options.virtualScroll==`function`&&this.options.virtualScroll(e)===!1)return;let{deltaX:t,deltaY:n,event:r}=e;if(this.emitter.emit(`virtual-scroll`,{deltaX:t,deltaY:n,event:r}),r.ctrlKey||r.lenisStopPropagation)return;let i=r.type.includes(`touch`),a=r.type.includes(`wheel`);this.isTouching=r.type===`touchstart`||r.type===`touchmove`;let o=t===0&&n===0;if(this.options.syncTouch&&i&&r.type===`touchstart`&&o&&!this.isStopped&&!this.isLocked){this.reset();return}let s=this.options.gestureOrientation===`vertical`&&n===0||this.options.gestureOrientation===`horizontal`&&t===0;if(o||s)return;let c=r.composedPath();c=c.slice(0,c.indexOf(this.rootElement));let l=this.options.prevent,u=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`;if(c.find(e=>e instanceof HTMLElement&&(typeof l==`function`&&l?.(e)||e.hasAttribute?.(`data-lenis-prevent`)||u===`vertical`&&e.hasAttribute?.(`data-lenis-prevent-vertical`)||u===`horizontal`&&e.hasAttribute?.(`data-lenis-prevent-horizontal`)||i&&e.hasAttribute?.(`data-lenis-prevent-touch`)||a&&e.hasAttribute?.(`data-lenis-prevent-wheel`)||this.options.allowNestedScroll&&this.hasNestedScroll(e,{deltaX:t,deltaY:n}))))return;if(this.isStopped||this.isLocked){r.cancelable&&r.preventDefault();return}if(!(this.options.syncTouch&&i||this.options.smoothWheel&&a)){this.isScrolling=`native`,this.animate.stop(),r.lenisStopPropagation=!0;return}let d=n;this.options.gestureOrientation===`both`?d=Math.abs(n)>Math.abs(t)?n:t:this.options.gestureOrientation===`horizontal`&&(d=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(r.lenisStopPropagation=!0),r.cancelable&&r.preventDefault();let f=i&&this.options.syncTouch,p=i&&r.type===`touchend`;p&&(d=Math.sign(d)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+d,{programmatic:!1,...f?{lerp:p?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit(`scroll`,this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling===`native`){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling=`native`),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty(`overflow`);return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty(`overflow`,`clip`);return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(e,{offset:t=0,immediate:n=!1,lock:r=!1,programmatic:i=!0,lerp:a=i?this.options.lerp:void 0,duration:o=i?this.options.duration:void 0,easing:s=i?this.options.easing:void 0,onStart:c,onComplete:l,force:u=!1,userData:d}={}){if((this.isStopped||this.isLocked)&&!u)return;let f=e,p=t;if(typeof f==`string`&&[`top`,`left`,`start`,`#`].includes(f))f=0;else if(typeof f==`string`&&[`bottom`,`right`,`end`].includes(f))f=this.limit;else{let e=null;if(typeof f==`string`?(e=document.querySelector(f),e||(f===`#top`?f=0:console.warn(`Lenis: Target not found`,f))):f instanceof HTMLElement&&f?.nodeType&&(e=f),e){if(this.options.wrapper!==window){let e=this.rootElement.getBoundingClientRect();p-=this.isHorizontal?e.left:e.top}let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=this.isHorizontal?Number.parseFloat(n.scrollMarginLeft):Number.parseFloat(n.scrollMarginTop),i=getComputedStyle(this.rootElement),a=this.isHorizontal?Number.parseFloat(i.scrollPaddingLeft):Number.parseFloat(i.scrollPaddingTop);f=(this.isHorizontal?t.left:t.top)+this.animatedScroll-(Number.isNaN(r)?0:r)-(Number.isNaN(a)?0:a)}}if(typeof f==`number`){if(f+=p,this.options.infinite){if(i){this.targetScroll=this.animatedScroll=this.scroll;let e=f-this.animatedScroll;e>this.limit/2?f-=this.limit:e<-this.limit/2&&(f+=this.limit)}}else f=me(0,f,this.limit);if(f===this.targetScroll){c?.(this),l?.(this);return}if(this.userData=d??{},n){this.animatedScroll=this.targetScroll=f,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),l?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}i||(this.targetScroll=f),typeof o==`number`&&typeof s!=`function`?s=Ee:typeof s==`function`&&typeof o!=`number`&&(o=1),this.animate.fromTo(this.animatedScroll,f,{duration:o,easing:s,lerp:a,onStart:()=>{r&&(this.isLocked=!0),this.isScrolling=`smooth`,c?.(this)},onUpdate:(e,t)=>{this.isScrolling=`smooth`,this.lastVelocity=this.velocity,this.velocity=e-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=e,this.setScroll(this.scroll),i&&(this.targetScroll=e),t||this.emit(),t&&(this.reset(),this.emit(),l?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(e,{deltaX:t,deltaY:n}){let r=Date.now();e._lenis||={};let i=e._lenis,a,o,s,c,l,u,d,f,p,m;if(r-(i.time??0)>2e3){i.time=Date.now();let t=window.getComputedStyle(e);if(i.computedStyle=t,a=[`auto`,`overlay`,`scroll`].includes(t.overflowX),o=[`auto`,`overlay`,`scroll`].includes(t.overflowY),l=[`auto`].includes(t.overscrollBehaviorX),u=[`auto`].includes(t.overscrollBehaviorY),i.hasOverflowX=a,i.hasOverflowY=o,!(a||o))return!1;d=e.scrollWidth,f=e.scrollHeight,p=e.clientWidth,m=e.clientHeight,s=d>p,c=f>m,i.isScrollableX=s,i.isScrollableY=c,i.scrollWidth=d,i.scrollHeight=f,i.clientWidth=p,i.clientHeight=m,i.hasOverscrollBehaviorX=l,i.hasOverscrollBehaviorY=u}else s=i.isScrollableX,c=i.isScrollableY,a=i.hasOverflowX,o=i.hasOverflowY,d=i.scrollWidth,f=i.scrollHeight,p=i.clientWidth,m=i.clientHeight,l=i.hasOverscrollBehaviorX,u=i.hasOverscrollBehaviorY;if(!(a&&s||o&&c))return!1;let h=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`,g,_,v,y,b,x;if(h===`horizontal`)g=Math.round(e.scrollLeft),_=d-p,v=t,y=a,b=s,x=l;else if(h===`vertical`)g=Math.round(e.scrollTop),_=f-m,v=n,y=o,b=c,x=u;else return!1;return!x&&(g>=_||g<=0)?!0:(v>0?g<_:g>0)&&y&&b}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?`x`:`y`]}get isHorizontal(){return this.options.orientation===`horizontal`}get actualScroll(){let e=this.options.wrapper;return this.isHorizontal?e.scrollX??e.scrollLeft:e.scrollY??e.scrollTop}get scroll(){return this.options.infinite?_e(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return this.isScrolling===`smooth`}get className(){let e=`lenis`;return this.options.autoToggle&&(e+=` lenis-autoToggle`),this.isStopped&&(e+=` lenis-stopped`),this.isLocked&&(e+=` lenis-locked`),this.isScrolling&&(e+=` lenis-scrolling`),this.isScrolling===`smooth`&&(e+=` lenis-smooth`),e}updateClassName(){this.cleanUpClassName(),this.className.split(` `).forEach(e=>{this.rootElement.classList.add(e)})}cleanUpClassName(){for(let e of Array.from(this.rootElement.classList))(e===`lenis`||e.startsWith(`lenis-`))&&this.rootElement.classList.remove(e)}},K={threshold:{kicker:`you are entering the lattice`,title:[`ONE MACHINE.`,`EVERY WORKFLOW.`],sub:`This is where AI stops being a demo. Voice, agents, orchestration, memory, growth, and the ops layer that keeps it all alive after launch. Keep scrolling to fly in.`,boot:[`opening uplink to hanflux`,`six divisions online`,`evals passing, humans on the loop`,`scroll to fly in`],cue:`jack in`},hud:{threshold:`uplink`,loop:`build loop`,buildLog:`build log`,stack:`the stack`,metrics:`proof`,engage:`ways in`},capabilities:[{id:`voice`,no:`01`,tag:`voice division`,title:`AI Voice Agents`,blurb:`Picks up before the second ring, in any language, and books the job while your competitor’s phone is still ringing. Speed-to-lead is a solved problem here.`,bullets:[`Inbound + outbound at any volume`,`Books, routes and recaps into your CRM`,`Sub-second turn-taking, barge-in, transfer to human`],a:`#27F2C0`,b:`#0c5c5a`},{id:`foundry`,no:`02`,tag:`agent foundry`,title:`Custom Agents & Skills`,blurb:`Claude agents shaped to your exact workflow: they read your tools over MCP, plan multi-step work, and check their own output against a rubric before you ever see it.`,bullets:[`Bespoke skills, versioned like code`,`MCP integrations: your stack becomes their toolbox`,`Sub-agent teams: research, drafting, QA in parallel`],a:`#7C5CFF`,b:`#241a4d`},{id:`orchestration`,no:`03`,tag:`orchestration`,title:`Workflow Automation`,blurb:`An n8n nervous system wiring your entire stack into one graph: triggers, branching, retries with backoff, and a human checkpoint before anything irreversible fires.`,bullets:[`500+ app connectors`,`Self-healing: error triggers + automatic retries`,`Human-in-the-loop gates on expensive actions`],a:`#4EA8FF`,b:`#0c2b4d`},{id:`memory`,no:`04`,tag:`memory vault`,title:`RAG & Knowledge Systems`,blurb:`Your documents, tickets and tribal knowledge become an answer engine where every response traces to a real source. Permission-aware, current, never a guess.`,bullets:[`Vector index + long context over your corpus`,`Access control mirrored from your permissions`,`Citations on every answer`],a:`#FFB36B`,b:`#4d2c0c`},{id:`growth`,no:`05`,tag:`growth engine`,title:`Revenue Systems`,blurb:`Outbound that researches, personalises and books while you sleep. Inbound where no call, chat or form ever goes unanswered. Pipeline without headcount.`,bullets:[`Account research → sequence → booked meeting`,`Reply detection and intelligent routing`,`Every lead logged, scored, followed up`],a:`#FF3D7F`,b:`#4d1029`},{id:`ops`,no:`06`,tag:`lattice ops, our flagship`,title:`AI Reliability Ops`,blurb:`The layer nobody else sells: we run your AI after it ships. Evals, monitoring, drift detection, cost tuning, model migrations. SRE for your agents, as a product.`,bullets:[`Continuous evals against your rubric`,`Live dashboards: latency, cost, resolution rate`,`Model migrations when a better/cheaper one lands`],a:`#9AE6FF`,b:`#12384d`}],loop:{kicker:`how a system gets built`,title:`We don’t demo. We deploy, prove, and keep it alive.`,steps:[{no:`01`,title:`Map`,body:`A short recon of your real workflows. Most aren’t worth automating. We score the few that are, with ROI math attached.`},{no:`02`,title:`Build`,body:`A working system on your real data in weeks. The same people who scope it build it. No bait-and-switch.`},{no:`03`,title:`Prove`,body:`An eval harness scores every output against your rubric. It ships when the numbers clear the bar, not when the demo looks good.`},{no:`04`,title:`Run`,body:`Monitoring, drift alerts, cost tuning and upgrades. The system compounds instead of quietly rotting.`}]},buildLog:{kicker:`tail -f build.log`,title:`Not a menu. A running log of what gets wired.`,sub:`Pull any line. We scope it this week.`,entries:[{tag:`claude`,title:`Agent SDK builds`,body:`Multi-step agents that plan, call tools, check their own work against a rubric, and retry before you ever see the output.`},{tag:`n8n`,title:`AI Agent nodes`,body:`Claude's reasoning wired straight into n8n's graph, so a workflow stops just triggering and starts deciding.`},{tag:`claude`,title:`Custom Skills`,body:`Packaged expertise Claude loads on demand: your playbooks, your tone, your edge cases, versioned like code.`},{tag:`n8n`,title:`Self-healing workflows`,body:`Error triggers, retries with backoff, and a human-in-the-loop checkpoint before anything expensive or irreversible fires.`},{tag:`claude`,title:`MCP integrations`,body:`Your CRM, calendar and ticketing system exposed as tools Claude can call directly. No fragile screen-scraping.`},{tag:`both`,title:`Realtime voice loop`,body:`Sub-second STT → Claude → TTS, wired straight into telephony. The agent picks up before the second ring.`},{tag:`claude`,title:`Eval harnesses`,body:`Golden sets, rubric scoring and regression gates: the ship/no-ship instrument every AI build should come with, and almost none do.`},{tag:`n8n`,title:`500+ connectors`,body:`Every app in your stack wired into one graph: CRM, calendar, Slack, Stripe, your own internal APIs.`},{tag:`both`,title:`Model migrations`,body:`When a better or cheaper model lands, we re-run your evals, migrate the prompts, and cut costs without breaking behaviour.`},{tag:`claude`,title:`Computer-use QA`,body:`An agent that drives a real browser like a user would, files the bug, and attaches the repro.`},{tag:`both`,title:`RAG over your knowledge`,body:`Vector-indexed docs plus long context, so every answer traces back to a real source. Never a guess.`},{tag:`claude`,title:`Sub-agent orchestration`,body:`One orchestrator and a bench of specialists for research, drafting and QA, run in parallel and merged into a single answer.`}]},stack:{kicker:`the stack we wield`,title:`Best-in-class parts, welded into one machine.`,groups:[{label:`Intelligence`,items:[`Claude (first-choice)`,`GPT / Gemini`,`Open-weights`,`Custom Skills`,`MCP`]},{label:`Automation`,items:[`n8n`,`Webhooks`,`Schedulers`,`Queues`,`Zapier bridge`]},{label:`Voice`,items:[`Realtime STT/TTS`,`Telephony (SIP)`,`Barge-in`,`Multilingual`]},{label:`Memory`,items:[`Vector DB / RAG`,`Postgres`,`Knowledge bases`]},{label:`Proof`,items:[`Eval harnesses`,`Live dashboards`,`Tracing & logs`]},{label:`Surfaces`,items:[`Web`,`WhatsApp`,`Email`,`Slack`,`CRM`]}]},metrics:[{v:`24/7`,l:`always-on agents`},{v:`<1s`,l:`voice response latency`},{v:`500+`,l:`app connectors on tap`},{v:`2×`,l:`ship rate of external builds vs in-house (MIT)`}],engage:{kicker:`ways in`,title:`Three doors. Fixed fees. No mystery.`,sub:`MIT found 95% of enterprise AI pilots never touch the P&L, and that externally built systems reach production twice as often. Closing that gap is our entire business, so every phase is fixed-fee, and part of it can ride on the KPI we commit to.`,tiers:[{no:`01`,name:`Signal Audit`,window:`2 weeks`,price:`from $3,000`,body:`We map your workflows, find the few automations actually worth building, and hand you a scored roadmap with ROI math. Yours to keep. Build it with anyone.`},{no:`02`,name:`First Agent Live`,window:`3 to 6 weeks`,price:`from $10,000`,body:`One workflow (voice, agent or automation) wired end to end on your real data, with an eval harness proving it works before anyone relies on it.`},{no:`03`,name:`The Autonomous Layer`,window:`6 to 12 weeks`,price:`from $30,000`,body:`Voice, agents, orchestration and memory deployed across the org, with training so your team owns what we built.`}],retainer:{name:`LATTICE OPS`,price:`from $1,500/mo`,body:`The service that never sleeps: monitoring, evals, drift alerts, cost tuning, model migrations, and a new automation shipped every month.`},book:{line:`Not sure which door is yours?`,sub:`Fifteen minutes on a call and you leave knowing which one, and what it costs.`}},trust:{kicker:`the fine print, up front`,items:[{title:`Your data trains nothing`,body:`Never used to train anyone’s models. In the contract, in writing.`},{title:`Model-agnostic`,body:`Claude, GPT, Gemini or open weights: the best model per job. You are never locked in.`},{title:`Humans on the loop`,body:`Checkpoints before anything expensive or irreversible fires.`},{title:`Audit-ready`,body:`Logged decisions, scoped access, least-privilege keys on every build.`}]},cta:{kicker:`end of line`,title:[`Get your AI`,`into production.`],body:`Tell us the work you keep doing by hand. We’ll wire the voice, the agents and the automations that make it run itself. Then we’ll keep them alive.`,email:`hanfluxai@gmail.com`,button:`Get your AI into production`}},q={galleryProgress:0,inAct2:0,pointerX:0,pointerY:0,active:-1,portalProgress:0,track:0,descent:0,chapter:0,divisionColor:`#27f2c0`,hudLabel:`uplink`},J={SP:64,D:18,STATIONS:12,FLOOR_Y:-10,Z_START:70,get Z_END(){return-(this.STATIONS*this.SP+170)},SIDE_X:8},Oe=e=>-e*J.SP,Y={uTime:{value:0},uFlow:{value:0},uAccent:{value:new N(`#27f2c0`)},uFogColor:{value:new N(`#010805`)},uFogDensity:{value:.0105},uVel:{value:0},uTrack:{value:0},uDpr:{value:1},uRes:{value:new H(1,1)}},X={track:0,vel:0,time:0,reduced:!1,aspect:16/9};function ke(e,t=1.4){let n=Math.abs(X.track-e)/t;return n>=1?0:1-n*n*(3-2*n)}var Ae=(e,t=2.6)=>Math.abs(X.track-e)<t,je=(e,t=2)=>new N(e).multiplyScalar(t),Z=`
varying float vFogDepth;
`,Q=`
uniform float uFogDensity;
uniform vec3 uFogColor;
varying float vFogDepth;
float fogVis(){
  float f = uFogDensity * vFogDepth;
  return exp(-f * f);
}
`,Me=`
float hash11(float n){ return fract(sin(n) * 43758.5453123); }
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
`,Ne=`ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝｦ0123456789Z:<>=+*`,Pe=null,Fe=0;function Ie(){if(Fe++,Pe)return Pe;let e=document.createElement(`canvas`);e.width=512,e.height=512;let t=e.getContext(`2d`);t.fillStyle=`#000`,t.fillRect(0,0,512,512),t.fillStyle=`#fff`,t.textAlign=`center`,t.textBaseline=`middle`,t.font=`600 ${64*.78}px "Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","MS Gothic","Noto Sans JP","Noto Sans CJK JP",monospace`;let n=Array.from(Ne);for(let e=0;e<64;e++){let r=n[e%n.length],i=e%8*64+64/2,a=Math.floor(e/8)*64+64/2;t.save(),t.translate(i,a),/[0-9Z:<>=+*]/.test(r)||t.scale(-1,1),t.fillText(r,0,64*.04),t.restore()}let r=new B(e);return r.minFilter=b,r.magFilter=y,r.generateMipmaps=!0,r.anisotropy=4,Pe=r,r}function Le(){Fe=Math.max(0,Fe-1),Fe===0&&Pe&&(Pe.dispose(),Pe=null)}function Re(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var $=o(),ze=`
attribute vec3 aBase;   // column bottom-centre (world)
attribute vec4 aData;   // x cells, y cell size, z speed (cells/s), w phase 0..1
attribute float aSeed;
varying vec2 vUv;
varying float vCells;
varying float vSpeed;
varying float vPhase;
varying float vSeed;
varying float vNear;
${Z}
void main(){
  vUv = uv;
  vCells = aData.x;
  vSpeed = aData.z;
  vPhase = aData.w;
  vSeed = aSeed;
  // cylindrical billboard: rotate about Y to face the eye
  vec3 toCam = cameraPosition - aBase;
  vec2 flat2 = normalize(vec2(toCam.x, toCam.z) + vec2(1e-5, 0.0));
  vec3 right = vec3(flat2.y, 0.0, -flat2.x);
  float w = aData.y;
  float h = aData.x * aData.y;
  vec3 world = aBase + right * position.x * w + vec3(0.0, (position.y + 0.5) * h, 0.0);
  vec4 mv = viewMatrix * vec4(world, 1.0);
  vFogDepth = -mv.z;
  // dissolve columns the eye is about to pass through
  vNear = smoothstep(2.5, 9.0, length(toCam));
  gl_Position = projectionMatrix * mv;
}
`,Be=`
uniform sampler2D uAtlas;
uniform float uTime;
uniform float uFlow;
uniform float uVel;
uniform vec3 uAccent;
uniform float uIntensity;
varying vec2 vUv;
varying float vCells;
varying float vSpeed;
varying float vPhase;
varying float vSeed;
varying float vNear;
${Q}
${Me}
void main(){
  float cy = vUv.y * vCells;
  float cell = floor(cy);
  float fromTop = vCells - 1.0 - cell;
  vec2 cuv = vec2(vUv.x, fract(cy));

  // glyph per cell, re-rolled at a per-cell rate
  float rate = 0.5 + hash11(vSeed * 7.13 + cell * 1.91) * 3.5;
  float tick = floor(uTime * rate + hash11(cell + vSeed * 3.1) * 10.0);
  float g = floor(hash11(vSeed * 13.7 + cell * 1.37 + tick * 0.61) * 64.0);
  vec2 atl = (vec2(mod(g, 8.0), 7.0 - floor(g / 8.0)) + cuv) / 8.0;
  float m = texture2D(uAtlas, atl).r;

  // two falling heads per column; uFlow is integrated, so fast scroll accelerates the fall
  float len = 7.0 + hash11(vSeed * 3.3) * 16.0;
  float span = vCells + len;
  float t = uFlow * vSpeed;
  float h1 = mod(t + vPhase * span, span);
  float h2 = mod(t * 0.71 + (vPhase + 0.5) * span, span);
  float d1 = h1 - fromTop;
  float d2 = h2 - fromTop;
  float tr1 = (d1 >= 0.0 && d1 < len) ? 1.0 - d1 / len : 0.0;
  float tr2 = (d2 >= 0.0 && d2 < len) ? (1.0 - d2 / len) * 0.75 : 0.0;
  float trail = max(tr1, tr2);
  float head = max(step(0.0, d1) * step(d1, 1.0), step(0.0, d2) * step(d2, 1.0) * 0.8);

  float b = pow(trail, 1.8) * 0.75 + 0.004;
  vec3 phosphor = mix(uAccent, vec3(0.16, 1.0, 0.62), 0.35);
  vec3 col = phosphor * b + vec3(0.75, 1.0, 0.9) * head * 1.6;
  col *= m * uIntensity * (1.0 + uVel * 0.35);
  col *= fogVis() * vNear;
  // soft column edges so quads never read as rectangles
  col *= smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
  gl_FragColor = vec4(col, 1.0);
}
`;function Ve({tier:e}){let{geo:t,mat:n}=(0,G.useMemo)(()=>{let t=Re(24301),n=e===`mobile`?650:1500,r=new Float32Array(n*3),i=new Float32Array(n*4),a=new Float32Array(n),o=J.Z_START,s=J.Z_END;for(let e=0;e<n;e++){let n=t()<.14,c,l,u=o+(s-o)*t(),d;if(n)c=(t()*2-1)*6,d=.42+t()*.3,l=30+t()*26;else{let e=t()<.5?-1:1,n=4.5+t()**1.6*80;c=e*n,d=.4+n/85*1.3+t()*.25,l=6+t()*(18+n*.6)}let f=Math.round(14+t()*32),p=f*d,m=l-p;n&&(m=Math.max(m,7)),r[e*3]=c,r[e*3+1]=m,r[e*3+2]=u,i[e*4]=n?Math.max(6,Math.floor((l-m)/d)):f,i[e*4+1]=d,i[e*4+2]=5+t()*13,i[e*4+3]=t(),a[e]=t()*1e3}let c=new ee(1,1),l=new h;return l.index=c.index,l.setAttribute(`position`,c.getAttribute(`position`)),l.setAttribute(`uv`,c.getAttribute(`uv`)),l.setAttribute(`aBase`,new I(r,3)),l.setAttribute(`aData`,new I(i,4)),l.setAttribute(`aSeed`,new I(a,1)),l.instanceCount=n,c.dispose(),{geo:l,mat:new M({uniforms:{...Y,uAtlas:{value:Ie()},uIntensity:{value:1}},vertexShader:ze,fragmentShader:Be,transparent:!0,depthWrite:!1,blending:2,fog:!1,toneMapped:!1})}},[e]);return(0,G.useEffect)(()=>()=>{t.dispose(),n.dispose(),Le()},[t,n]),(0,$.jsx)(`mesh`,{geometry:t,material:n,frustumCulled:!1,renderOrder:1})}var He=`
attribute float aT;
attribute float aSeed;
varying float vT;
varying float vSeed;
${Z}
void main(){
  vT = aT;
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Ue=`
uniform float uTime;
uniform vec3 uAccent;
varying float vT;
varying float vSeed;
${Q}
void main(){
  float speed = 0.18 + fract(vSeed * 7.31) * 0.5;
  float dir = fract(vSeed * 3.7) > 0.5 ? 1.0 : -1.0;
  float p = fract(uTime * speed * dir + vSeed * 11.0);
  float d = abs(vT - p);
  float packet = smoothstep(0.07, 0.0, d);
  // how far this fragment sits BEHIND the packet along its direction of travel
  float behind = dir > 0.0 ? p - vT : vT - p;
  float trail = behind > 0.0 ? smoothstep(0.32, 0.0, behind) : 0.0;
  vec3 magenta = vec3(1.0, 0.16, 0.6);
  vec3 base = mix(uAccent, magenta, step(0.82, fract(vSeed * 1.93)));
  vec3 col = base * (0.014 + trail * 0.22) + vec3(0.85, 1.0, 0.95) * packet * 1.4;
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,We=`
attribute float aSize;
attribute float aSeed;
uniform float uDpr;
uniform float uTime;
varying float vSeed;
varying float vTw;
${Z}
void main(){
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  vTw = 0.55 + 0.45 * sin(uTime * (0.8 + fract(aSeed * 5.1) * 2.2) + aSeed * 40.0);
  gl_PointSize = clamp(aSize * uDpr * (260.0 / max(-mv.z, 0.1)), 1.0, 46.0);
  gl_Position = projectionMatrix * mv;
}
`,Ge=`
uniform vec3 uAccent;
varying float vSeed;
varying float vTw;
${Q}
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float core = smoothstep(0.16, 0.0, r);
  float halo = smoothstep(0.5, 0.0, r) * 0.18;
  vec3 col = mix(uAccent, vec3(0.3, 0.95, 1.0), step(0.7, fract(vSeed * 2.7)));
  col = col * (halo + core * 1.6) * vTw + vec3(1.0) * core * 0.5 * vTw;
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`;function Ke({tier:e}){let{edgeGeo:t,nodeGeo:n,edgeMat:r,nodeMat:i}=(0,G.useMemo)(()=>{let t=Re(659918),n=e===`mobile`?480:1100,r=[],i=J.Z_START,a=J.Z_END;for(let e=0;e<n;e++){let e=i+(a-i)*t(),n=t()*Math.PI*2,o=6+t()**.75*48,s=Math.cos(n)*o,c=Math.sin(n)*o*.62+5;c<J.FLOOR_Y+1.5&&(c=J.FLOOR_Y+1.5+t()*6),r.push({x:s,y:c,z:e})}r.sort((e,t)=>e.z-t.z);let o=[],s=new Set;for(let e=0;e<n;e++){let t=[];for(let i=Math.max(0,e-36);i<Math.min(n,e+36);i++){if(i===e)continue;let n=r[e].x-r[i].x,a=r[e].y-r[i].y,o=r[e].z-r[i].z,s=Math.sqrt(n*n+a*a+o*o);s>17||t.push({j:i,d:s})}t.sort((e,t)=>e.d-t.d);for(let n=0;n<Math.min(2,t.length);n++){let r=Math.min(e,t[n].j),i=Math.max(e,t[n].j),a=r*65536+i;s.has(a)||(s.add(a),o.push([r,i]))}}let c=o.length,l=new Float32Array(c*6),u=new Float32Array(c*2),d=new Float32Array(c*2);o.forEach(([e,n],i)=>{let a=r[e],o=r[n];l.set([a.x,a.y,a.z,o.x,o.y,o.z],i*6),u[i*2]=0,u[i*2+1]=1;let s=t()*100;d[i*2]=s,d[i*2+1]=s});let f=new R;f.setAttribute(`position`,new A(l,3)),f.setAttribute(`aT`,new A(u,1)),f.setAttribute(`aSeed`,new A(d,1));let p=new Float32Array(n*3),m=new Float32Array(n),h=new Float32Array(n);r.forEach((e,n)=>{p.set([e.x,e.y,e.z],n*3),m[n]=t()<.08?2.4+t()*1.4:.7+t()*.9,h[n]=t()*100});let g=new R;g.setAttribute(`position`,new A(p,3)),g.setAttribute(`aSize`,new A(m,1)),g.setAttribute(`aSeed`,new A(h,1));let _={transparent:!0,depthWrite:!1,blending:2,fog:!1,toneMapped:!1};return{edgeGeo:f,nodeGeo:g,edgeMat:new M({uniforms:{...Y},vertexShader:He,fragmentShader:Ue,..._}),nodeMat:new M({uniforms:{...Y},vertexShader:We,fragmentShader:Ge,..._})}},[e]);return(0,G.useEffect)(()=>()=>{t.dispose(),n.dispose(),r.dispose(),i.dispose()},[t,n,r,i]),(0,$.jsxs)($.Fragment,{children:[(0,$.jsx)(`lineSegments`,{geometry:t,material:r,frustumCulled:!1,renderOrder:2}),(0,$.jsx)(`points`,{geometry:n,material:i,frustumCulled:!1,renderOrder:3})]})}var qe=`
varying vec3 vWorld;
${Z}
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vec4 mv = viewMatrix * w;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Je=`
uniform float uTime;
uniform float uFlow;
uniform vec3 uAccent;
uniform float uSP;
uniform float uSideX;
varying vec3 vWorld;
${Q}
float gridLine(vec2 p, float scale, float width){
  vec2 g = p / scale;
  vec2 d = abs(fract(g - 0.5) - 0.5) / fwidth(g);
  return 1.0 - min(min(d.x, d.y) / width, 1.0);
}
void main(){
  vec2 p = vWorld.xz;
  float far = smoothstep(140.0, 25.0, vFogDepth);
  float minor = gridLine(p, 2.0, 1.0) * far;
  float major = gridLine(p, 10.0, 1.3);

  // scan pulses rolling away from the eye, down the corridor
  float wave = fract((p.y + uTime * 24.0) / 96.0);
  float pulse = exp(-pow((wave - 0.5) * 16.0, 2.0));

  // twin data-highway lanes streaming under the flight path
  float lane = smoothstep(0.32, 0.0, abs(abs(p.x) - 3.4));
  float dash = step(0.6, fract(p.y * 0.16 + uFlow * 1.4 + step(0.0, p.x) * 0.5));

  vec3 cyan = vec3(0.25, 0.92, 1.0);
  vec3 mag = vec3(1.0, 0.18, 0.62);
  vec3 lineCol = mix(uAccent, mix(cyan, mag, smoothstep(12.0, 70.0, abs(p.x))), 0.4);

  vec3 col = vec3(0.0004, 0.0025, 0.0016);
  col += lineCol * (minor * 0.045 + major * 0.2) * (0.4 + pulse * 1.8);
  col += uAccent * lane * (0.04 + dash * 0.7);

  // landing ring beneath each division construct (stations 1..6)
  float k = floor(-p.y / uSP + 0.5);
  if (k >= 1.0 && k <= 6.0) {
    vec2 q = vec2(p.x - uSideX, p.y + k * uSP);
    float rr = length(q);
    float ring = exp(-pow((rr - 7.0) * 2.2, 2.0)) + exp(-pow((rr - 7.8) * 6.0, 2.0)) * 0.6;
    float tick = step(0.5, fract(atan(q.y, q.x) * 9.5493 + uTime * 0.3));
    col += uAccent * ring * (0.35 + tick * 0.35) + uAccent * exp(-rr * 0.35) * 0.06;
  }

  col = mix(uFogColor, col, fogVis());
  gl_FragColor = vec4(col, 1.0);
}
`,Ye=`
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Xe=`
uniform vec3 uFogColor;
uniform vec3 uAccent;
uniform float uTime;
varying vec3 vDir;
void main(){
  float h = vDir.y;
  float band = exp(-pow(h * 5.5, 2.0));
  vec3 col = uFogColor + uAccent * band * 0.009;
  // a slow aurora of signal high above
  float a = sin(vDir.x * 3.0 + uTime * 0.05) * sin(vDir.z * 2.0 - uTime * 0.04);
  col += vec3(0.5, 0.1, 0.45) * smoothstep(0.2, 0.9, h) * max(a, 0.0) * 0.006;
  gl_FragColor = vec4(col, 1.0);
}
`;function Ze(){let{geo:e,mat:t,z:n}=(0,G.useMemo)(()=>{let e=new ee(420,J.Z_START-J.Z_END+260,1,1);return e.rotateX(-Math.PI/2),{geo:e,mat:new M({uniforms:{...Y,uSP:{value:J.SP},uSideX:{value:J.SIDE_X}},vertexShader:qe,fragmentShader:Je,fog:!1,toneMapped:!1}),z:(J.Z_START+J.Z_END)/2}},[]);return(0,G.useEffect)(()=>()=>{e.dispose(),t.dispose()},[e,t]),(0,$.jsx)(`mesh`,{geometry:e,material:t,position:[0,J.FLOOR_Y,n],renderOrder:0})}function Qe(){let e=(0,G.useRef)(null),{geo:t,mat:n}=(0,G.useMemo)(()=>({geo:new se(900,32,16),mat:new M({uniforms:{...Y},vertexShader:Ye,fragmentShader:Xe,side:1,depthWrite:!1,fog:!1,toneMapped:!1})}),[]);return(0,G.useEffect)(()=>()=>{t.dispose(),n.dispose()},[t,n]),d(({camera:t})=>{e.current?.position.copy(t.position)}),(0,$.jsx)(`mesh`,{ref:e,geometry:t,material:n,renderOrder:-1,frustumCulled:!1})}var $e=Math.PI*2,et=3.4,tt=28,nt=2.9,rt=5.6,it=6.3,at=`
float syllable(float t, float k) {
  float s = t * 2.4 - k * 1.6;
  float id = floor(s);
  float f = fract(s);
  float loud = hash11(id * 7.13 + 3.1);
  float gate = smoothstep(0.22, 0.34, loud);
  float shape = sin(3.14159265 * f);
  shape *= shape;
  float phrase = 0.62 + 0.38 * sin(t * 0.53);
  return (0.14 + 0.86 * loud * gate * shape) * phrase;
}
`,ot=`
float nearFade(){ return smoothstep(0.8, 4.0, vFogDepth); }
`,st=`
uniform float uT;
uniform float uAmp;
attribute float aRing;
attribute float aAngle;
varying float vDisp;
varying float vEnv;
varying float vFace;
${Z}
${Me}
${at}
void main() {
  vec3 n = normalize(position);
  float env = syllable(uT, aRing);
  float w = sin(aAngle * 5.0 + uT * 3.1 + aRing * 9.0) * 0.55
    + sin(aAngle * 9.0 - uT * 4.3 + aRing * 15.0) * 0.28
    + sin(aAngle * 16.0 + uT * 7.7 - aRing * 21.0) * 0.1;
  float calm = sqrt(max(0.0, 1.0 - n.y * n.y)); // poles stay quieter
  float d = w * env * uAmp * (0.25 + 0.65 * calm);
  vec4 mv = modelViewMatrix * vec4(position + n * d, 1.0);
  vec3 vn = normalize((modelViewMatrix * vec4(n, 0.0)).xyz);
  vFace = dot(vn, normalize(-mv.xyz));
  vDisp = d;
  vEnv = env;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,ct=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uEnergy;
varying float vDisp;
varying float vEnv;
varying float vFace;
${Q}
void main() {
  float face = mix(0.4, 1.0, smoothstep(-0.35, 0.45, vFace));
  float a = abs(vDisp);
  vec3 col = uColor * (0.55 + 0.6 * vEnv);
  col += uHot * smoothstep(0.1, 0.7, a) * 0.9;
  col = mix(col, vec3(1.8, 2.1, 2.0), smoothstep(0.65, 1.0, a) * 0.4);
  gl_FragColor = vec4(col * face * uEnergy * fogVis(), 1.0);
}
`,lt=`
uniform float uT;
uniform float uAmp;
uniform float uBars;
uniform float uHalfW;
attribute float aBar;
attribute vec2 aCorner;
varying float vY;
varying float vH;
varying float vBand;
varying float vFacing;
${Z}
${Me}
${at}
void main() {
  float u = (aBar + 0.5) / uBars;
  float band = abs(fract(u - 0.25 + 0.5) - 0.5) * 2.0;
  float halfN = floor(uBars * 0.5);
  float bin = floor(band * halfN + 0.5);
  float bt = uT * 7.0;
  float i0 = floor(bt);
  float n = mix(
    hash11(bin * 3.71 + i0 * 1.37),
    hash11(bin * 3.71 + (i0 + 1.0) * 1.37),
    smoothstep(0.0, 1.0, fract(bt))
  );
  float syl = syllable(uT, 0.5);
  float tilt = 1.0 - 0.55 * band;
  float h = 0.1 + (0.18 + 2.0 * n * n * tilt) * (0.25 + 0.75 * syl) * uAmp;
  float y = aCorner.y * h;
  vec4 mv = modelViewMatrix * vec4(position.x, position.y + y, position.z, 1.0);
  mv.x += aCorner.x * uHalfW;
  // bars bunch up where the ring turns edge-on (the limbs): dim them there
  vec3 rv = normalize((modelViewMatrix * vec4(position.x, 0.0, position.z, 0.0)).xyz);
  vFacing = abs(dot(rv, normalize(-mv.xyz)));
  vY = y;
  vH = h;
  vBand = band;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,ut=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uEnergy;
varying float vY;
varying float vH;
varying float vBand;
varying float vFacing;
${Q}
${ot}
void main() {
  float ay = abs(vY);
  float seg = step(0.3, fract(ay * 5.5)); // LED segments
  float rel = ay / max(vH, 0.001);
  float tip = smoothstep(0.82, 1.0, rel);
  vec3 col = uColor * (0.15 + 0.45 * rel) + uHot * tip * 0.55;
  col *= seg * uEnergy * (1.0 - 0.45 * vBand) * mix(0.3, 1.0, vFacing);
  gl_FragColor = vec4(col * fogVis() * nearFade(), 1.0);
}
`,dt=`
uniform float uT;
uniform float uAmp;
attribute float aRipple;
attribute float aEdge;
attribute float aAngle;
varying float vEdge;
varying float vFade;
${Z}
void main() {
  float ph = fract(uT * 0.3 + aRipple / 3.0);
  float grow = 1.0 - pow(1.0 - ph, 1.7);
  float r = mix(3.8, 8.6, grow);
  r += sin(aAngle * 12.0 + uT * 5.0 + aRipple * 2.1) * 0.09 * uAmp * (1.0 - ph);
  r += aEdge * mix(0.04, 0.15, ph);
  vec4 mv = modelViewMatrix * vec4(cos(aAngle) * r, sin(aAngle) * r, 0.0, 1.0);
  vFade = (1.0 - ph) * (1.0 - ph) * smoothstep(0.0, 0.08, ph);
  vEdge = aEdge;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,ft=`
uniform vec3 uHot;
uniform float uAmp;
uniform float uEnergy;
varying float vEdge;
varying float vFade;
${Q}
${ot}
void main() {
  float prof = exp(-vEdge * vEdge * 3.5);
  vec3 col = uHot * prof * vFade * (0.25 + 0.75 * uAmp) * 0.3;
  gl_FragColor = vec4(col * uEnergy * fogVis() * nearFade(), 1.0);
}
`,pt=`
uniform float uT;
uniform float uDpr;
attribute vec4 aOrbit; // radius, tilt, phase, angular speed
attribute vec2 aMeta; // yaw, size (px at ~19u)
varying float vTw;
${Z}
void main() {
  float a = aOrbit.z + uT * aOrbit.w;
  vec3 p = vec3(cos(a) * aOrbit.x, 0.0, sin(a) * aOrbit.x);
  float ct = cos(aOrbit.y);
  float st = sin(aOrbit.y);
  p = vec3(p.x, -p.z * st, p.z * ct);
  float cy = cos(aMeta.x);
  float sy = sin(aMeta.x);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  vTw = 0.3 + 0.7 * (0.5 + 0.5 * sin(uT * 2.7 + aOrbit.z * 11.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp(aMeta.y * (0.6 + 0.6 * vTw) * uDpr * (19.0 / -mv.z), 1.0, 40.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,mt=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uEnergy;
varying float vTw;
${Q}
${ot}
void main() {
  float d = length(gl_PointCoord - 0.5);
  float glow = 1.0 - smoothstep(0.0, 0.5, d);
  float pin = 1.0 - smoothstep(0.0, 0.14, d);
  vec3 col = uColor * glow * glow * 0.6 + uHot * pin * 0.6;
  gl_FragColor = vec4(col * vTw * uEnergy * fogVis() * nearFade(), 1.0);
}
`,ht=`
uniform float uT;
uniform float uAmp;
varying vec2 vQ;
varying float vSyl;
${Z}
${Me}
${at}
void main() {
  vSyl = syllable(uT, 0.5) * uAmp;
  float s = 2.8 * (0.85 + 0.3 * vSyl);
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * s;
  vQ = position.xy * 2.0;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,gt=`
uniform vec3 uHot;
uniform float uEnergy;
varying vec2 vQ;
varying float vSyl;
${Q}
void main() {
  float d = length(vQ);
  float core = exp(-d * d * 30.0);
  float halo = exp(-d * d * 6.0) * (0.12 + 0.18 * vSyl);
  float rr = (d - 0.62) * 16.0;
  float ring = exp(-rr * rr) * 0.1 * vSyl;
  vec3 col = uHot * (halo + ring) + vec3(2.2, 2.4, 2.3) * core * (0.55 + 0.45 * vSyl);
  col *= 1.0 - smoothstep(0.85, 1.0, d);
  gl_FragColor = vec4(col * uEnergy * fogVis(), 1.0);
}
`;function _t(e,t,n){return new M({uniforms:e,vertexShader:t,fragmentShader:n,transparent:!0,depthWrite:!1,blending:2,side:2,toneMapped:!1,fog:!1})}function vt(e,t){return e.boundingSphere=new ae(new D,t),e}function yt(e,t){let n=t===`mobile`,r=Re(721358),i={uT:{value:0},uAmp:{value:.22},uEnergy:{value:.35},uColor:{value:new N(e)},uHot:{value:je(e,2.4)}},a=(e={})=>({...Y,...i,...e}),o=n?64:128,s=tt*o*2,c=new Float32Array(s*3),l=new Float32Array(s),u=new Float32Array(s),d=0;for(let e=0;e<tt;e++){let t=(e+.5)/tt,n=(t-.5)*nt,r=Math.sin(n)*et,i=Math.cos(n)*et;for(let e=0;e<o;e++)for(let n=0;n<2;n++){let a=(e+n)/o*$e;c[d*3]=Math.cos(a)*i,c[d*3+1]=r,c[d*3+2]=Math.sin(a)*i,l[d]=t,u[d]=a,d++}}let f=new R;f.setAttribute(`position`,new A(c,3)),f.setAttribute(`aRing`,new A(l,1)),f.setAttribute(`aAngle`,new A(u,1)),vt(f,4.6);let p=_t(a(),st,ct),m=n?64:96,h=new Float32Array(m*4*3),g=new Float32Array(m*4),_=new Float32Array(m*4*2),v=[],y=[-1,-1,1,-1,1,1,-1,1];for(let e=0;e<m;e++){let t=(e+.5)/m*$e,n=Math.cos(t)*rt,r=Math.sin(t)*rt;for(let t=0;t<4;t++){let i=e*4+t;h[i*3]=n,h[i*3+2]=r,g[i]=e,_[i*2]=y[t*2],_[i*2+1]=y[t*2+1]}let i=e*4;v.push(i,i+1,i+2,i,i+2,i+3)}let b=new R;b.setAttribute(`position`,new A(h,3)),b.setAttribute(`aBar`,new A(g,1)),b.setAttribute(`aCorner`,new A(_,2)),b.setIndex(v),vt(b,8.2);let x=_t(a({uBars:{value:m},uHalfW:{value:n?.12:.085}}),lt,ut),C=[],w=(e,t,n,r,i,a)=>C.push(e,t,n,r,i,a),T=(e,t,n=!1)=>{for(let r=0;r<t;r++){if(n&&r%2)continue;let i=r/t*$e,a=(r+1)/t*$e;w(Math.cos(i)*e,0,Math.sin(i)*e,Math.cos(a)*e,0,Math.sin(a)*e)}};T(rt,n?96:128),T(it,n?120:160),T(4.65,n?64:96,!0);for(let e=0;e<72;e++){let t=e/72*$e,n=e%9==0?.42:.14,r=Math.cos(t),i=Math.sin(t);w(r*it,0,i*it,r*(it+n),0,i*(it+n))}for(let e of[-1,1])w(0,e*3.75,0,0,e*5.3,0),w(-.22,e*5.3,0,.22,e*5.3,0),w(0,e*5.3,-.22,0,e*5.3,.22);let E=new R;E.setAttribute(`position`,new A(new Float32Array(C),3));let D=new S({color:new N(e).multiplyScalar(.6),transparent:!0,opacity:.3,blending:2,depthWrite:!1,toneMapped:!1}),O=n?96:160,k=3*(O+1)*2,j=new Float32Array(k*3),te=new Float32Array(k),M=new Float32Array(k),ne=new Float32Array(k),re=[];d=0;for(let e=0;e<3;e++){let t=d;for(let t=0;t<=O;t++){let n=t/O*$e;for(let t=0;t<2;t++)j[d*3]=Math.cos(n)*6,j[d*3+1]=Math.sin(n)*6,te[d]=e,M[d]=t?1:-1,ne[d]=n,d++}for(let e=0;e<O;e++){let n=t+e*2;re.push(n,n+1,n+2,n+1,n+3,n+2)}}let P=new R;P.setAttribute(`position`,new A(j,3)),P.setAttribute(`aRipple`,new A(te,1)),P.setAttribute(`aEdge`,new A(M,1)),P.setAttribute(`aAngle`,new A(ne,1)),P.setIndex(re),vt(P,9);let ie=_t(a(),dt,ft),F=n?28:56,I=new Float32Array(F*4),ae=new Float32Array(F*2);for(let e=0;e<F;e++)I[e*4]=3.9+r()*3.7,I[e*4+1]=(r()-.5)*1.4,I[e*4+2]=r()*$e,I[e*4+3]=(.12+r()*.33)*(r()<.5?-1:1),ae[e*2]=r()*$e,ae[e*2+1]=3+r()*4;let L=new R;L.setAttribute(`position`,new A(new Float32Array(F*3),3)),L.setAttribute(`aOrbit`,new A(I,4)),L.setAttribute(`aMeta`,new A(ae,2)),vt(L,8);let z=_t(a(),pt,mt),oe=vt(new ee(1,1),2.4),B=_t(a(),ht,gt),se=[f,b,E,P,L,oe],V=[p,x,D,ie,z,B];return{u:i,sphereGeo:f,sphereMat:p,eqGeo:b,eqMat:x,guideGeo:E,guideMat:D,rippleGeo:P,rippleMat:ie,sparkGeo:L,sparkMat:z,coreGeo:oe,coreMat:B,dispose(){se.forEach(e=>e.dispose()),V.forEach(e=>e.dispose())}}}function bt({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(null),s=(0,G.useRef)({last:-1,spin:0,bezel:0}),c=(0,G.useMemo)(()=>yt(n,r),[n,r]);return(0,G.useEffect)(()=>()=>c.dispose(),[c]),d(()=>{let t=i.current;if(!t)return;if(!Ae(e)){t.visible=!1;return}t.visible=!0;let n=ke(e),r=X.time,l=s.current,u=l.last<0?0:Math.min(Math.max(r-l.last,0),.1);l.last=r,c.u.uT.value=r,c.u.uAmp.value=.22+.78*n,c.u.uEnergy.value=.35+.65*n,c.guideMat.opacity=.3+.4*n,l.spin+=u*(.1+.12*n),l.bezel-=u*.05,a.current&&(a.current.rotation.y=l.spin),o.current&&(o.current.rotation.y=l.bezel)}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`group`,{rotation:[.42,0,-.16],children:(0,$.jsx)(`group`,{ref:a,children:(0,$.jsx)(`lineSegments`,{geometry:c.sphereGeo,material:c.sphereMat})})}),(0,$.jsx)(`mesh`,{geometry:c.coreGeo,material:c.coreMat}),(0,$.jsxs)(`group`,{rotation:[.3,0,0],children:[(0,$.jsx)(`mesh`,{geometry:c.eqGeo,material:c.eqMat}),(0,$.jsx)(`group`,{ref:o,children:(0,$.jsx)(`lineSegments`,{geometry:c.guideGeo,material:c.guideMat})})]}),(0,$.jsx)(`group`,{rotation:[0,-.36,0],children:(0,$.jsx)(`mesh`,{geometry:c.rippleGeo,material:c.rippleMat})}),(0,$.jsx)(`points`,{geometry:c.sparkGeo,material:c.sparkMat})]})}var xt=Math.PI*2,St=6,Ct=.34,wt=.19,Tt=.42,Et=[.36,.29,.23],Dt=[0,1.3,2.6],Ot=[[.3,0,.12],[1.1,.7,0],[-1.1,-.7,0]],kt=-5.4,At=e=>e-Math.floor(e),jt=(e,t)=>At(e*.371+t*.5),Mt=e=>{let t=Math.imul(e|0,2654435761);return t^=t>>>15,t=Math.imul(t,2246822519),t^=t>>>13,(t>>>0)/4294967296},Nt=`
varying float vY;
${Z}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vY = wp.y;
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,Pt=`
uniform vec3 uColor;
uniform float uI;
uniform float uBase;
uniform float uScan;
uniform float uFlash;
varying float vY;
${Q}
void main() {
  float d = (vY - uScan) * 2.4;
  float band = exp(-d * d);
  float b = uBase + band * 2.6 + uFlash * 0.9;
  vec3 col = mix(uColor, vec3(1.0), band * 0.35 + uFlash * 0.15) * b * uI;
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,Ft=`
attribute float aFace;
varying vec3 vN;
varying vec3 vV;
varying float vFace;
varying float vY;
${Z}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * wp;
  vY = wp.y;
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  vFace = aFace;
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,It=`
uniform float uT;
uniform vec3 uColor;
uniform float uI;
uniform float uScan;
uniform float uFlash;
varying vec3 vN;
varying vec3 vV;
varying float vFace;
varying float vY;
${Q}
${Me}
void main() {
  float fres = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  float face = floor(vFace + 0.5);
  // every facet rolls a die on its own clock; ~4% light up per tick, then decay
  float ph = uT * 0.9 + hash11(face * 3.17 + 0.5) * 11.0;
  float on = step(0.955, hash11(mod(floor(ph), 1021.0) * 1.37 + face * 0.618));
  float flash = on * pow(1.0 - fract(ph), 3.0);
  float d = (vY - uScan) * 2.4;
  float band = exp(-d * d);
  float b = 0.022 + 0.11 * fres * fres + band * 0.06 + flash * 0.8 + uFlash * 0.05;
  vec3 col = mix(uColor, vec3(1.0), flash * 0.25) * b * uI;
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,Lt=`
uniform float uT;
uniform float uI;
uniform vec3 uAgentPos[6];
uniform float uAgentFlash[6];
attribute float aAgent;
varying float vB;
varying float vW;
${Z}
vec3 rotY(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}
vec3 rotX(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
}
void main() {
  int ai = int(aAgent + 0.5);
  float fl = uAgentFlash[ai];
  float spin = uT * (0.7 + 0.12 * aAgent) + aAgent * 1.7;
  vec3 lp = rotX(rotY(position, spin), spin * 0.6 + aAgent) * (1.0 + 0.4 * fl);
  vec4 mv = modelViewMatrix * vec4(uAgentPos[ai] + lp, 1.0);
  gl_Position = projectionMatrix * mv;
  vB = (1.05 + 2.0 * fl) * uI;
  vW = fl * 0.45;
  vFogDepth = -mv.z;
}
`,Rt=`
uniform vec3 uColor;
varying float vB;
varying float vW;
${Q}
void main() {
  gl_FragColor = vec4(mix(uColor, vec3(1.0), vW) * vB * fogVis(), 1.0);
}
`,zt=`
uniform vec3 uAgentPos[6];
attribute float aAgent;
attribute float aEnd;
varying float vT;
varying float vSeed;
${Z}
void main() {
  vec3 p = position + uAgentPos[int(aAgent + 0.5)] * aEnd;
  vT = aEnd;
  vSeed = aAgent;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,Bt=`
uniform float uT;
uniform float uI;
uniform float uPacket;
uniform vec3 uColor;
varying float vT;
varying float vSeed;
${Q}
void main() {
  float dash = smoothstep(0.55, 1.0, fract((vT - uT * uPacket) * 7.0 + vSeed * 0.37));
  float ends = smoothstep(0.0, 0.14, vT) * (1.0 - 0.5 * smoothstep(0.85, 1.0, vT));
  float b = (0.2 + dash * 0.85) * ends * uI;
  gl_FragColor = vec4(uColor * b * fogVis(), 1.0);
}
`,Vt=`
uniform float uT;
uniform float uI;
uniform float uOrbitR;
uniform vec3 uOrbitAng;
attribute float aRing;
attribute float aAng;
varying float vB;
varying float vW;
${Z}
void main() {
  vec3 p = position;
  float b = 0.0;
  float w = 0.0;
  if (aRing < 2.5) {
    p *= uOrbitR;
    float th = aRing < 0.5 ? uOrbitAng.x : (aRing < 1.5 ? uOrbitAng.y : uOrbitAng.z);
    float d0 = mod(th - aAng, 6.2831853);
    float d1 = mod(th + 3.1415927 - aAng, 6.2831853);
    float trail = exp(-d0 * 1.7) + exp(-d1 * 1.7);
    b = 0.15 + trail * 1.7;
    w = trail * 0.25;
  } else {
    float s = uT * 0.12;
    float c = cos(s);
    float sn = sin(s);
    p.xz = vec2(c * p.x - sn * p.z, sn * p.x + c * p.z);
    float sweep = pow(0.5 + 0.5 * cos(aAng - uT * 0.9), 10.0);
    b = (aRing < 3.5 ? 0.3 : 0.45) + sweep * 1.5;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vB = b * uI;
  vW = w;
  vFogDepth = -mv.z;
}
`,Ht=`
uniform vec3 uColor;
varying float vB;
varying float vW;
${Q}
void main() {
  gl_FragColor = vec4(mix(uColor, vec3(1.0), vW) * vB * fogVis(), 1.0);
}
`,Ut=`
uniform float uT;
uniform float uI;
uniform float uDpr;
uniform float uFlash;
uniform float uPacket;
uniform vec3 uColor;
uniform vec3 uAgentPos[6];
uniform float uAgentFlash[6];
uniform float uRet[6];
uniform mat4 uIcoMat;
attribute float aKind;
attribute float aAgent;
attribute float aSeed;
attribute float aAux;
varying vec3 vCol;
varying float vA;
varying float vPin;
${Z}
${Me}
void main() {
  int ai = int(aAgent + 0.5);
  vec3 agent = uAgentPos[ai];
  vec3 white = vec3(1.0);
  vec3 p = position;
  vec3 col = uColor * 2.0;
  float size = 6.0;
  float a = 1.0;
  float pin = 0.0;
  if (aKind < 0.5) {
    float beat = 0.5 + 0.5 * sin(uT * 2.2);
    size = 46.0 + 8.0 * beat + 30.0 * uFlash;
    col = mix(uColor * 2.6, white * 2.4, 0.45 + 0.35 * uFlash);
    pin = 1.0;
  } else if (aKind < 1.5) {
    float fl = uAgentFlash[ai];
    p = agent;
    size = 15.0 + 14.0 * fl;
    col = mix(uColor * 2.2, white * 2.0, 0.08 + 0.5 * fl);
    pin = 0.5;
  } else if (aKind < 2.5) {
    float t = fract(uT * uPacket + aSeed);
    p = agent * t;
    a = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.9, 1.0, t));
    size = 11.0;
    col = mix(uColor * 2.6, white * 2.0, 0.35);
    pin = 0.5;
  } else if (aKind < 3.5) {
    float t = uRet[ai];
    p = agent * max(t, 0.0);
    a = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.92, 1.0, t));
    size = 15.0;
    col = white * 2.6;
    pin = 1.0;
  } else if (aKind < 4.5) {
    p = (uIcoMat * vec4(position, 1.0)).xyz;
    float tw = hash11(aSeed * 91.7 + mod(floor(uT * 1.6 + aSeed * 13.0), 997.0));
    a = 0.3 + 0.7 * smoothstep(0.8, 1.0, tw);
    size = 8.0;
    col = mix(uColor * 2.0, white * 1.8, 0.3);
    pin = 0.4;
  } else if (aKind < 5.5) {
    float s = fract(uT * 0.07 + aSeed);
    float r = mix(3.75, 0.3, pow(s, 1.2)) * (0.85 + 0.3 * fract(aSeed * 13.7));
    float ang = aAux + s * 7.0 + uT * 0.25;
    p = vec3(cos(ang) * r, mix(${kt.toFixed(1)}, 0.0, s), sin(ang) * r);
    a = smoothstep(0.0, 0.12, s) * (1.0 - smoothstep(0.8, 1.0, s));
    size = 6.0;
    col = mix(uColor * 1.8, white * 1.6, s * s);
  } else {
    float ang = uT * 0.04 * (0.5 + aSeed);
    float c = cos(ang);
    float sn = sin(ang);
    p = vec3(c * p.x - sn * p.z, p.y + sin(uT * 0.3 + aAux * 6.2831853) * 0.25, sn * p.x + c * p.z);
    float tw = 0.5 + 0.5 * sin(uT * (0.8 + aSeed * 2.0) + aAux * 6.2831853);
    a = 0.2 + 0.8 * tw * tw * tw;
    size = 4.5;
    col = uColor * 1.5;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float ps = size * uDpr * (10.0 / max(-mv.z, 0.5));
  // the flight path skims the outer orbits (~1.4 units) on the way past: fade
  // points before they balloon into lens-filling blobs (parked view is ~19 away)
  vA = a * clamp(ps, 0.0, 1.0) * smoothstep(1.2, 4.5, -mv.z);
  gl_PointSize = clamp(ps, 1.0, 110.0 * uDpr);
  vCol = col * uI;
  vPin = pin;
  vFogDepth = -mv.z;
}
`,Wt=`
varying vec3 vCol;
varying float vA;
varying float vPin;
${Q}
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float d2 = dot(q, q) * 4.0;
  if (d2 > 1.0) discard;
  float halo = exp(-d2 * 4.5) * (1.0 - d2);
  float pin = exp(-d2 * 40.0) * vPin;
  gl_FragColor = vec4(vCol * (halo + pin * 1.2) * vA * fogVis(), 1.0);
}
`,Gt=`
varying vec2 vQ;
${Z}
void main() {
  vQ = uv * 2.0 - 1.0;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,Kt=`
uniform vec3 uColor;
uniform float uI;
uniform float uFlash;
varying vec2 vQ;
${Q}
void main() {
  float r2 = dot(vQ, vQ);
  float g = exp(-r2 * 9.0) * (1.0 - smoothstep(0.6, 1.0, r2)) * (0.14 + 0.26 * uFlash);
  gl_FragColor = vec4(uColor * g * uI * fogVis(), 1.0);
}
`;function qt(e,t){let n=Re(985645),r=new N(e),i=r.clone().lerp(new N(1,1,1),.15),a=[],o=[];for(let[e,t,n]of Ot){let r=new E(e,t,n);a.push(new D(1,0,0).applyEuler(r)),o.push(new D(0,0,1).applyEuler(r))}let s={uT:{value:0},uI:{value:.35},uFlash:{value:0},uScan:{value:0},uPacket:{value:Ct},uOrbitR:{value:5.3},uOrbitAng:{value:new D},uAgentPos:{value:Array.from({length:St},()=>new D)},uAgentFlash:{value:new Float32Array(St)},uRet:{value:new Float32Array(St).fill(-1)},uIcoMat:{value:new k}},c=(e,t,n,r=0)=>new M({vertexShader:e,fragmentShader:t,uniforms:{...Y,...s,...n},transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1,side:r}),l=new C(3,1),u=l.attributes.position,d=new Float32Array(u.count);for(let e=0;e<u.count;e++)d[e]=Math.floor(e/3);l.setAttribute(`aFace`,new A(d,1));let f=new ce(l),p=[],m=new Set;for(let e=0;e<u.count;e++){let t=u.getX(e),n=u.getY(e),r=u.getZ(e),i=`${Math.round(t*1e3)},${Math.round(n*1e3)},${Math.round(r*1e3)}`;m.has(i)||(m.add(i),p.push(t,n,r))}let h=new x(1.7,0),g=new ce(h);h.dispose();let _=new ne(.6,0),v=new ce(_);_.dispose();let y=v.attributes.position.array,b=v.attributes.position.count,S=b*2,w=new Float32Array(S*St*3),T=new Float32Array(S*St);for(let e=0;e<St;e++){let t=e*S*3;for(let e=0;e<b*3;e++)w[t+e]=y[e],w[t+b*3+e]=-y[e]*.55;T.fill(e,e*S,(e+1)*S)}v.dispose();let O=new R;O.setAttribute(`position`,new A(w,3)),O.setAttribute(`aAgent`,new A(T,1));let j=new R,te=new Float32Array(St*2),re=new Float32Array(St*2);for(let e=0;e<St;e++)te[e*2]=e,te[e*2+1]=e,re[e*2+1]=1;j.setAttribute(`position`,new A(new Float32Array(St*2*3),3)),j.setAttribute(`aAgent`,new A(te,1)),j.setAttribute(`aEnd`,new A(re,1));let P=[],ie=[],F=[];for(let e=0;e<3;e++)for(let t=0;t<128;t++)for(let n of[t/128*xt,(t+1)/128*xt]){let t=Math.cos(n),r=Math.sin(n);P.push(t*a[e].x+r*o[e].x,t*a[e].y+r*o[e].y,t*a[e].z+r*o[e].z),ie.push(e),F.push(n)}for(let e of[3.5,4])for(let t=0;t<96;t++)for(let n of[t/96*xt,(t+1)/96*xt])P.push(Math.cos(n)*e,kt,Math.sin(n)*e),ie.push(3),F.push(n);for(let e=0;e<60;e++){let t=e/60*xt,n=e%5==0?4.75:4.45;P.push(Math.cos(t)*4.15,kt,Math.sin(t)*4.15),P.push(Math.cos(t)*n,kt,Math.sin(t)*n),ie.push(4,4),F.push(t,t)}let I=new R;I.setAttribute(`position`,new A(new Float32Array(P),3)),I.setAttribute(`aRing`,new A(new Float32Array(ie),1)),I.setAttribute(`aAng`,new A(new Float32Array(F),1));let ae=t===`mobile`?80:160,L=t===`mobile`?100:200,z=p.length/3,oe=25+z+ae+L,B=new Float32Array(oe*3),se=new Float32Array(oe),V=new Float32Array(oe),H=new Float32Array(oe),le=new Float32Array(oe),ue=0,U=(e,t,n,r,i=0,a=0,o=0)=>{B[ue*3]=i,B[ue*3+1]=a,B[ue*3+2]=o,se[ue]=e,V[ue]=t,H[ue]=n,le[ue]=r,ue++};U(0,0,0,0);for(let e=0;e<St;e++)U(1,e,0,0);for(let e=0;e<St;e++)for(let t=0;t<2;t++)U(2,e,jt(e,t),0);for(let e=0;e<St;e++)U(3,e,0,0);for(let e=0;e<z;e++)U(4,0,n(),0,p[e*3],p[e*3+1],p[e*3+2]);for(let e=0;e<ae;e++)U(5,0,n(),n()*xt);for(let e=0;e<L;e++){let e=3.6+n()*5.4,t=n()*xt,r=Math.acos(2*n()-1);U(6,0,n(),n(),e*Math.sin(r)*Math.cos(t),e*Math.cos(r)*.75,e*Math.sin(r)*Math.sin(t))}let W=new R;W.setAttribute(`position`,new A(B,3)),W.setAttribute(`aKind`,new A(se,1)),W.setAttribute(`aAgent`,new A(V,1)),W.setAttribute(`aSeed`,new A(H,1)),W.setAttribute(`aAux`,new A(le,1));let de=new ee(8,8),fe=c(Ft,It,{uColor:{value:r}},2);fe.forceSinglePass=!0;let G=c(Nt,Pt,{uColor:{value:r},uBase:{value:1.25}}),pe=c(Nt,Pt,{uColor:{value:i},uBase:{value:1.9}}),me=c(Lt,Rt,{uColor:{value:i}}),he=c(zt,Bt,{uColor:{value:r}}),ge=c(Vt,Ht,{uColor:{value:r}}),_e=c(Ut,Wt,{uColor:{value:r}}),ve=c(Gt,Kt,{uColor:{value:r}}),ye=[l,f,g,O,j,I,W,de],be=[fe,G,pe,me,he,ge,_e,ve];return{u:s,U:a,V:o,fillGeo:l,icoEdgeGeo:f,octaGeo:g,tetGeo:O,linkGeo:j,ringGeo:I,ptsGeo:W,haloGeo:de,fillMat:fe,icoMat:G,octaMat:pe,tetMat:me,linkMat:he,ringMat:ge,ptsMat:_e,haloMat:ve,dispose(){for(let e of ye)e.dispose();for(let e of be)e.dispose()}}}function Jt({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(null),s=(0,G.useRef)(null),c=(0,G.useMemo)(()=>qt(n,r),[n,r]);return(0,G.useEffect)(()=>()=>c.dispose(),[c]),d(({camera:n})=>{let r=i.current;if(!r)return;if(!Ae(e)){r.visible=!1;return}r.visible=!0;let l=ke(e),u=X.time,d=c.u;d.uT.value=u,d.uI.value=.35+.65*l;let f=.9+.1*l,p=a.current;p&&(p.rotation.set(Math.sin(u*.13)*.25,u*.16,0),p.scale.setScalar(f),p.updateMatrix(),d.uIcoMat.value.copy(p.matrix));let m=o.current;m&&(m.rotation.set(u*.21,-u*.42,0),m.scale.setScalar(f));let h=4.7+.6*l;d.uOrbitR.value=h;let g=d.uOrbitAng.value,_=d.uAgentPos.value;for(let e=0;e<3;e++){let t=(u*Et[e]+Dt[e])%xt;g.setComponent(e,t);for(let n=0;n<2;n++){let r=t+n*Math.PI;_[e*2+n].copy(c.U[e]).multiplyScalar(Math.cos(r)*h).addScaledVector(c.V[e],Math.sin(r)*h)}}let v=d.uAgentFlash.value,y=d.uRet.value,b=0;for(let e=0;e<St;e++){let t=0;for(let n=0;n<2;n++)t=Math.max(t,Math.exp(-At(u*Ct+jt(e,n))*9));let n=u*wt+e*.173,r=Math.floor(n),i=n-r,a=Mt(r*7+e)>.42;a&&i<Tt?(y[e]=1-i/Tt,i<.05&&(t=Math.max(t,1-i/.05))):(y[e]=-1,a&&(b+=Math.exp(-(i-Tt)*24))),v[e]=t}d.uFlash.value=Math.min(1,b);let x=u*.2%1.5;d.uScan.value=t[1]+3.7-x*7.4,s.current?.quaternion.copy(n.quaternion)}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsxs)(`group`,{ref:a,children:[(0,$.jsx)(`mesh`,{geometry:c.fillGeo,material:c.fillMat}),(0,$.jsx)(`lineSegments`,{geometry:c.icoEdgeGeo,material:c.icoMat})]}),(0,$.jsx)(`group`,{ref:o,children:(0,$.jsx)(`lineSegments`,{geometry:c.octaGeo,material:c.octaMat})}),(0,$.jsx)(`lineSegments`,{geometry:c.tetGeo,material:c.tetMat,frustumCulled:!1}),(0,$.jsx)(`lineSegments`,{geometry:c.linkGeo,material:c.linkMat,frustumCulled:!1}),(0,$.jsx)(`lineSegments`,{geometry:c.ringGeo,material:c.ringMat,frustumCulled:!1}),(0,$.jsx)(`points`,{geometry:c.ptsGeo,material:c.ptsMat,frustumCulled:!1}),(0,$.jsx)(`mesh`,{ref:s,geometry:c.haloGeo,material:c.haloMat})]})}var Yt=[[-6,.1,0],[-3,2.5,-.9],[-3,.1,1.3],[-3,-2.4,-.4],[0,3.4,.7],[0,1.15,-1.7],[0,-1.15,1.5],[0,-3.3,-.6],[3,2.4,1.1],[3,.05,-1.3],[3,-2.4,.9],[6,1.35,-.5],[6,-1.25,.7]],Xt=[[0,1],[0,2],[0,3],[1,4],[1,5],[2,5],[2,6],[3,6],[3,7],[4,8],[5,8],[5,9],[6,9],[6,10],[7,10],[8,11],[9,11],[9,12],[10,12]],Zt=Yt.length,Qt=Xt.length,$t=0,en=9,tn=Yt.map((e,t)=>Xt.flatMap(([e],n)=>e===t?[n]:[])),nn=[-6,-3,0,3,6],rn=.45,an=.49,on=40,sn=.12,cn=1.12,ln=-4.6,un=Math.PI*2,dn=`#FFB547`,fn=`#FF3D7F`,pn=1.7,mn=2.9,hn=5.2,gn=0,_n=1,vn=2,yn=3,bn=4,xn=5,Sn=0,Cn=1,wn=2,Tn=3,En=4,Dn=5,On=6,kn=`
attribute vec3 aCenter;
attribute float aNode;
attribute float aKind;
uniform float uTime;
uniform float uIntensity;
uniform float uHeat[${Zt}];
uniform vec3 uTint[${Zt}];
uniform float uTrig;
uniform float uGate;
uniform float uRelease;
varying vec3 vCol;
${Z}

mat2 rot2(float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

void main(){
  int i = int(aNode + 0.5);
  float heat = uHeat[i];
  vec3 l = position - aCenter;
  float b = 0.0;
  if (aKind < 0.5) {
    l *= 1.0 + heat * 0.07;
    b = 0.5 + heat * 1.9;
  } else if (aKind < 1.5) {
    float a = uTime * 0.8 + aNode * 1.37;
    l.xz = rot2(a) * l.xz;
    l.xy = rot2(a * 0.6) * l.xy;
    l *= 1.0 + heat * 0.4;
    b = 0.9 + heat * 2.4;
  } else if (aKind < 2.5) {
    l.xy = rot2(uTime * 0.5) * l.xy;
    l *= 1.0 + uRelease * 0.22;
    b = 0.28 + uGate * 1.0 + uRelease * 1.5;
  } else if (aKind < 3.5) {
    l.xy = rot2(-uTime * 0.8) * l.xy;
    l *= 1.0 + uRelease * 0.12;
    b = 0.18 + uGate * 0.55 + uRelease * 1.1;
  } else if (aKind < 4.5) {
    l *= 0.75 + uTrig * 1.9;
    float f = 1.0 - uTrig;
    b = f * f * 1.7;
  } else {
    l.y += sin(uTime * 1.6 + aNode) * 0.02;
    l *= 1.0 + heat * 0.25;
    b = 1.0 + heat * 2.2;
  }
  vCol = uTint[i] * b * uIntensity;
  vec4 mv = modelViewMatrix * vec4(aCenter + l, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,An=`
varying vec3 vCol;
${Q}
void main(){
  gl_FragColor = vec4(vCol * fogVis(), 1.0);
}
`,jn=`
attribute vec3 aCenter;
attribute float aNode;
uniform float uHeat[${Zt}];
uniform vec3 uTint[${Zt}];
uniform float uIntensity;
varying vec2 vUv;
varying vec3 vCol;
varying float vHeat;
varying float vY;
${Z}
void main(){
  int i = int(aNode + 0.5);
  vHeat = uHeat[i];
  vCol = uTint[i] * uIntensity;
  vUv = uv;
  vec3 l = (position - aCenter) * (1.0 + vHeat * 0.07);
  vY = l.y;
  vec4 mv = modelViewMatrix * vec4(aCenter + l, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Mn=`
uniform float uTime;
varying vec2 vUv;
varying vec3 vCol;
varying float vHeat;
varying float vY;
${Q}
void main(){
  vec2 q = abs(vUv - 0.5) * 2.0;
  float edge = max(q.x, q.y);
  float rim = smoothstep(0.6, 1.0, edge);
  float scan = smoothstep(0.7, 1.0, sin(vY * 30.0 - uTime * 4.0));
  float b = 0.03 + rim * 0.14 + scan * 0.03 + vHeat * (0.16 + rim * 0.3);
  gl_FragColor = vec4(vCol * b * fogVis(), 1.0);
}
`,Nn=`
attribute float aEdge;
attribute float aT;
attribute float aAmber;
uniform float uEdgeHeat[${Qt}];
uniform float uEdgeFail[${Qt}];
varying float vT;
varying float vSeed;
varying float vHeat;
varying float vFail;
varying float vAmber;
${Z}
void main(){
  int e = int(aEdge + 0.5);
  vHeat = uEdgeHeat[e];
  vFail = uEdgeFail[e];
  vT = aT;
  vSeed = aEdge * 0.37;
  vAmber = aAmber;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Pn=`
uniform float uTime;
uniform float uIntensity;
uniform vec3 uCol;
uniform vec3 uAmber;
uniform vec3 uRed;
varying float vT;
varying float vSeed;
varying float vHeat;
varying float vFail;
varying float vAmber;
${Q}
void main(){
  float flow = smoothstep(0.8, 1.0, fract(vT * 7.0 - uTime * 0.9 + vSeed));
  vec3 c = mix(uCol, uAmber * 0.7, vAmber);
  c = mix(c, uRed, vFail);
  float b = 0.14 + flow * 0.2 + vHeat * 0.42 + vFail * 0.55;
  gl_FragColor = vec4(c * b * uIntensity * fogVis(), 1.0);
}
`,Fn=`
attribute float aA;
varying float vA;
varying float vX;
${Z}
void main(){
  vA = aA;
  vX = position.x;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,In=`
uniform float uSweep;
uniform float uIntensity;
uniform vec3 uCol;
varying float vA;
varying float vX;
${Q}
void main(){
  float dx = (vX - uSweep) * 1.2;
  float band = exp(-dx * dx);
  float b = vA * (0.3 + band * 0.9);
  gl_FragColor = vec4(uCol * b * uIntensity * fogVis(), 1.0);
}
`,Ln=`
attribute vec3 aCol;
attribute float aSize;
uniform float uDpr;
uniform float uProj;
uniform float uIntensity;
varying vec3 vCol;
${Z}
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_PointSize = clamp(aSize * uProj * uDpr / max(0.5, -mv.z), 0.0, 96.0);
  vCol = aCol * (0.55 + 0.45 * uIntensity);
  gl_Position = projectionMatrix * mv;
}
`,Rn=`
varying vec3 vCol;
${Q}
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(0.42, 0.0, d);
  float halo = (1.0 - d) * (1.0 - d);
  gl_FragColor = vec4(vCol * (halo * 0.7 + core * 1.3) * fogVis(), 1.0);
}
`,zn=`
attribute float aSeed;
uniform float uTime;
uniform float uDpr;
uniform float uProj;
varying float vTw;
varying float vWhite;
${Me}
${Z}
void main(){
  vec3 p = position;
  float sp = 0.25 + hash11(aSeed * 17.0) * 0.6;
  p.x = mod(p.x + 7.5 + uTime * sp, 15.0) - 7.5;
  p.y += sin(uTime * 0.6 + aSeed * 6.2831853) * 0.15;
  float edgeFade = 1.0 - smoothstep(5.5, 7.5, abs(p.x));
  float tw = 0.5 + 0.5 * sin(uTime * (1.5 + hash11(aSeed * 7.0) * 3.0) + aSeed * 40.0);
  vTw = tw * tw * edgeFade;
  vWhite = step(0.93, hash11(aSeed * 31.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFogDepth = -mv.z;
  float sz = (0.05 + hash11(aSeed * 53.0) * 0.08) * (1.0 + vWhite * 0.5);
  gl_PointSize = clamp(sz * uProj * uDpr / max(0.5, -mv.z), 1.0, 24.0);
  gl_Position = projectionMatrix * mv;
}
`,Bn=`
uniform vec3 uCol;
uniform float uIntensity;
varying float vTw;
varying float vWhite;
${Q}
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = (1.0 - d) * (1.0 - d);
  vec3 c = mix(uCol * 0.9, vec3(1.0, 1.2, 1.5), vWhite);
  gl_FragColor = vec4(c * a * vTw * uIntensity * fogVis(), 1.0);
}
`;function Vn(){let e=[],t=[],n=[],r=[],i=(i,a,o,s)=>{let[c,l,u]=Yt[i];e.push(c+o[0],l+o[1],u+o[2],c+s[0],l+s[1],u+s[2]),t.push(c,l,u,c,l,u),n.push(i,i),r.push(a,a)},a=(e,t,n)=>{for(let r=0;r<n.length-1;r++)i(e,t,[n[r][0],n[r][1],0],[n[r+1][0],n[r+1][1],0])},o=(e,t,n,r,a,o=0,s=un)=>{for(let c=0;c<r;c++){if(!a(c))continue;let l=s*c/r,u=s*(c+1)/r;i(e,t,[Math.cos(l)*n,Math.sin(l)*n+o,0],[Math.cos(u)*n,Math.sin(u)*n+o,0])}},s=()=>!0,c=e=>[e&1?rn:-.45,e&2?rn:-.45,e&4?rn:-.45],l=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];for(let e=0;e<Zt;e++){for(let t=0;t<8;t++)for(let n=t+1;n<8;n++){let r=t^n;(r===1||r===2||r===4)&&i(e,gn,c(t),c(n))}if(e===$t)a(e,xn,[[.09,.27],[-.1,.02],[.05,.02],[-.09,-.27]]);else if(e===en)o(e,xn,.075,16,s,.13),o(e,xn,.17,12,s,-.2,Math.PI);else if(!tn[e].length)a(e,xn,[[-.17,0],[-.05,-.13],[.19,.15]]);else{let t=.2;for(let n=0;n<6;n++)for(let r=n+1;r<6;r++){if(n>>1==r>>1)continue;let a=l[n],o=l[r];i(e,_n,[a[0]*t,a[1]*t,a[2]*t],[o[0]*t,o[1]*t,o[2]*t])}}}o(en,vn,.8,40,e=>e%2==0),o(en,yn,1.14,48,e=>e%8<5),o($t,bn,.62,36,s);let u=new R;return u.setAttribute(`position`,new A(new Float32Array(e),3)),u.setAttribute(`aCenter`,new A(new Float32Array(t),3)),u.setAttribute(`aNode`,new A(new Float32Array(n),1)),u.setAttribute(`aKind`,new A(new Float32Array(r),1)),u}function Hn(){let e=new ie(rn*2,rn*2,rn*2),t=e.attributes.position.array,n=e.attributes.uv.array,r=e.index.array,i=e.attributes.position.count,a=new Float32Array(i*Zt*3),o=new Float32Array(i*Zt*2),s=new Float32Array(i*Zt*3),c=new Float32Array(i*Zt),l=new Uint16Array(r.length*Zt);for(let e=0;e<Zt;e++){let[u,d,f]=Yt[e];for(let r=0;r<i;r++){let l=e*i+r;a[l*3]=t[r*3]+u,a[l*3+1]=t[r*3+1]+d,a[l*3+2]=t[r*3+2]+f,s[l*3]=u,s[l*3+1]=d,s[l*3+2]=f,o[l*2]=n[r*2],o[l*2+1]=n[r*2+1],c[l]=e}for(let t=0;t<r.length;t++)l[e*r.length+t]=r[t]+e*i}e.dispose();let u=new R;return u.setAttribute(`position`,new A(a,3)),u.setAttribute(`uv`,new A(o,2)),u.setAttribute(`aCenter`,new A(s,3)),u.setAttribute(`aNode`,new A(c,1)),u.setIndex(new A(l,1)),u}function Un(){let e=new Float32Array(Qt*41*3),t=new Float32Array(Qt),n=new Float32Array(Qt*on*6),r=new Float32Array(Qt*on*2),i=new Float32Array(Qt*on*2),a=new Float32Array(Qt*on*2),o=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},s=new D;Xt.forEach(([c,l],u)=>{let d=Yt[c],f=Yt[l],p=new D(d[0]+an,d[1],d[2]),m=new D(f[0]-an,f[1],f[2]),h=(m.x-p.x)*.55,g=new z(p,new D(p.x+h,p.y,p.z),new D(m.x-h,m.y,m.z),m);t[u]=g.getLength();for(let t=0;t<=on;t++){g.getPointAt(t/on,s);let n=(u*41+t)*3;e[n]=s.x,e[n+1]=s.y,e[n+2]=s.z}let _=e=>l===en?o(.5,1,e):c===en?1-o(0,.5,e):0;for(let t=0;t<on;t++){let o=(u*on+t)*2;for(let s=0;s<2;s++){let c=(u*41+t+s)*3;n[(o+s)*3]=e[c],n[(o+s)*3+1]=e[c+1],n[(o+s)*3+2]=e[c+2];let l=(t+s)/on;r[o+s]=u,i[o+s]=l,a[o+s]=_(l)}}});let c=new R;return c.setAttribute(`position`,new A(n,3)),c.setAttribute(`aEdge`,new A(r,1)),c.setAttribute(`aT`,new A(i,1)),c.setAttribute(`aAmber`,new A(a,1)),{geo:c,samp:e,lens:t}}function Wn(){let e=[],t=[],n=(n,r,i,a=i)=>{e.push(n[0],n[1],n[2],r[0],r[1],r[2]),t.push(i,a)},r=7.6,i=3.6,a=(e,t)=>{let n=e/r,a=t/i;return .55*Math.max(0,(1-n*n)*(1-a*a))};for(let e=-3;e<=3;e++)for(let t=0;t<30;t++){let i=-7.6+2*r/30*t,o=i+2*r/30;n([i,ln,e],[o,ln,e],a(i,e),a(o,e))}for(let e=-7;e<=7;e++)for(let t=0;t<18;t++){let r=-3.6+2*i/18*t,o=r+2*i/18;n([e,ln,r],[e,ln,o],a(e,r),a(e,o))}for(let[e,t,r]of Yt){n([e-.36,t-rn-.18,r],[e+.36,t-rn-.18,r],.75),n([e-.36,t-rn-.3,r],[e+.1,t-rn-.3,r],.45);let i=t-rn-.44,a=e=>.35+.35*(e-ln)/(i-ln);for(let t=i;t>-4.59;t-=.28){let i=Math.max(ln,t-.16);n([e,t,r],[e,i,r],a(t),a(i))}let o=.2;n([e-o,ln,r-o],[e+o,ln,r-o],1),n([e+o,ln,r-o],[e+o,ln,r+o],1),n([e+o,ln,r+o],[e-o,ln,r+o],1),n([e-o,ln,r+o],[e-o,ln,r-o],1)}let o=3.9;n([-6.6,ln,o],[6.6,ln,o],.5);for(let e of nn)n([e,ln,o-.15],[e,ln,4.2],.95);let s=.7;for(let e of[-7.8,7.8])for(let t of[ln,4.6])for(let r of[-3.4,3.4]){let i=e<0?s:-.7,a=t<0?s:-.7,o=r<0?s:-.7;n([e,t,r],[e+i,t,r],.9),n([e,t,r],[e,t+a,r],.9),n([e,t,r],[e,t,r+o],.9)}let c=new R;return c.setAttribute(`position`,new A(new Float32Array(e),3)),c.setAttribute(`aA`,new A(new Float32Array(t),1)),c}function Gn(e,t){let n=t?24:40,r=t?3:5,i=t?160:380,a=Re(939939),o=new N(e),s=new N(dn),c=new N(fn),l=s.clone().multiplyScalar(.8),u=new Float32Array(Zt),d=new Float32Array(Zt),f=new Float32Array(Zt*3),p=new Float32Array(Qt),m=new Float32Array(Qt),h=new Float32Array(Qt),g={uIntensity:{value:.35},uProj:{value:800},uHeat:{value:u},uTint:{value:f},uEdgeHeat:{value:p},uEdgeFail:{value:m},uTrig:{value:0},uGate:{value:0},uRelease:{value:0},uSweep:{value:-8},uCol:{value:o.clone()},uAmber:{value:s.clone()},uRed:{value:c.clone()}},_=(e,t)=>new M({uniforms:{...Y,...g},vertexShader:e,fragmentShader:t,transparent:!0,depthWrite:!1,blending:2,fog:!1,toneMapped:!1}),v=Vn(),y=Hn(),b=Un(),x=b.geo,S=Wn(),{samp:C,lens:w}=b,T=2*Zt+n*r,E=new Float32Array(T*3),O=new Float32Array(T*3),k=new Float32Array(T);Yt.forEach(([e,t,n],r)=>{E.set([e-an,t,n,e+an,t,n],r*6)});let ee=new A(E,3).setUsage(j),te=new A(O,3).setUsage(j),ne=new A(k,1).setUsage(j),re=new R;re.setAttribute(`position`,ee),re.setAttribute(`aCol`,te),re.setAttribute(`aSize`,ne);let P=new Float32Array(i*3),ie=new Float32Array(i);for(let e=0;e<i;e++)P[e*3]=(a()-.5)*15,P[e*3+1]=(a()-.5)*9,P[e*3+2]=(a()-.5)*7,ie[e]=a();let F=new R;F.setAttribute(`position`,new A(P,3)),F.setAttribute(`aSeed`,new A(ie,1));let I=[v,y,x,S,re,F];for(let e of I)e.boundingSphere=new ae(new D(0,0,0),10);let L=_(kn,An),z=_(jn,Mn);z.side=2;let oe=_(Nn,Pn),B=_(Fn,In),se=_(Ln,Rn),V=_(zn,Bn),ce=[L,z,oe,B,se,V],H=new Int16Array(n),le=new Float32Array(n),ue=new Float32Array(n),U=new Uint8Array(n),W=new Float32Array(n),de=new Uint8Array(n),fe=new Float32Array(n);for(let e=0;e<n;e++)H[e]=Math.floor(a()*Qt),le[e]=a(),ue[e]=2.5+a()*.9,U[e]=e%5==0?Dn:Sn,fe[e]=-1;let G={trig:0,gate:0,fail:0,failing:-1,cursor:0,held:0,release:0},pe=(e,t)=>{u[e]=Math.min(1.6,u[e]+t)},me=(e,t)=>{let n=tn[t];H[e]=n[Math.floor(a()*n.length)],le[e]=0,U[e]=Sn},he=(e,t)=>{pe(t,.85),t===en?(U[e]=Cn,de[e]=G.held,G.held=(G.held+1)%16):tn[t].length?me(e,t):U[e]=Dn},ge=()=>{for(let e=0;e<n;e++){let t=(G.cursor+e)%n,r=Xt[H[t]];if(!(U[t]!==Sn||le[t]>.3||r[0]===en||r[1]===en)){fe[t]=le[t]+.35+a()*.2,G.failing=t,G.cursor=t+1;return}}},_e=(e,t,n)=>{let r=Math.min(Math.max(t,0),1)*on,i=Math.min(on-1,Math.floor(r)),a=r-i,o=(e*41+i)*3;E[n]=C[o]+(C[o+3]-C[o])*a,E[n+1]=C[o+1]+(C[o+4]-C[o+1])*a,E[n+2]=C[o+2]+(C[o+5]-C[o+2])*a},ve=(e,t,n,r)=>{O[e*3]=t,O[e*3+1]=n,O[e*3+2]=r},ye=o.r*1.7+.8,be=o.g*1.7+.8,xe=o.b*1.7+.8;return{U:g,step:(e,t)=>{G.trig+=e;let i=G.trig>=pn;i&&(G.trig-=pn,pe($t,.9)),G.gate+=e;let a=G.gate>=mn;a&&(G.gate-=mn,G.release=1,pe(en,1.1)),G.fail+=e,G.failing<0&&G.fail>=hn&&ge();let _=0,v=0;h.fill(0);for(let t=0;t<n;t++){let n=H[t];switch(U[t]){case Sn:le[t]+=ue[t]*e/w[n],fe[t]>=0&&le[t]>=fe[t]?(le[t]=fe[t],fe[t]=-1,U[t]=Tn,W[t]=.7,d[Xt[n][1]]=1):le[t]>=1&&he(t,Xt[n][1]);break;case Cn:a&&(U[t]=wn,W[t]=v++*.1);break;case wn:W[t]-=e,W[t]<=0&&me(t,en);break;case Tn:W[t]-=e,W[t]<=0&&(U[t]=En);break;case En:le[t]-=ue[t]*1.5*e/w[n],le[t]<=0&&(le[t]=0,U[t]=Sn,pe(Xt[n][0],.9),G.failing=-1,G.fail=0);break;case Dn:i&&(U[t]=On,W[t]=_++*.075);break;case On:W[t]-=e,W[t]<=0&&me(t,$t);break}let r=U[t];(r===Sn||r===Tn||r===En)&&(h[H[t]]+=1)}let y=Math.exp(-e*3.2),b=Math.exp(-e*1.5),x=1-Math.exp(-e*6);for(let e=0;e<Zt;e++){u[e]*=y,d[e]*=b;let t=e===en?l:o,n=d[e];f[e*3]=t.r+(c.r-t.r)*n,f[e*3+1]=t.g+(c.g-t.g)*n,f[e*3+2]=t.b+(c.b-t.b)*n}let S=G.failing,C=S>=0&&(U[S]===Tn||U[S]===En)?H[S]:-1;for(let e=0;e<Qt;e++)p[e]+=(Math.min(1.2,h[e]*.45)-p[e])*x,m[e]+=(+(e===C)-m[e])*x;G.release*=Math.exp(-e*3),g.uRelease.value=G.release;let T=G.gate/mn;g.uGate.value=T*T,g.uTrig.value=Math.min(1,G.trig/1.1),g.uSweep.value=-8.5+t*3.4%17;for(let e=0;e<Zt;e++){let t=.75+u[e]*1.6;for(let n=0;n<2;n++){let r=e*2+n,i=e===$t&&n===0?0:t;ve(r,f[e*3]*i,f[e*3+1]*i,f[e*3+2]*i),k[r]=.16+u[e]*.08}}let D=Yt[en][0],O=Yt[en][1],A=Yt[en][2];for(let e=0;e<n;e++){let n=2*Zt+e*r,i=U[e];if(i===Dn||i===On){for(let e=0;e<r;e++)ve(n+e,0,0,0),k[n+e]=0;continue}if(i===Cn||i===wn){let i=.97+(de[e]>=8?.2:0),a=de[e]*(un/8)+t*1.5;for(let e=0;e<r;e++){let t=n+e,o=a-e*.17;E[t*3]=D+Math.cos(o)*i,E[t*3+1]=O+Math.sin(o)*i,E[t*3+2]=A;let c=1-e/r;e===0?ve(t,s.r*1.4+.25,s.g*1.4+.25,s.b*1.4+.25):ve(t,s.r*c,s.g*c,s.b*c),k[t]=e===0?.3:.2*c+.05}continue}let a=H[e];if(i===Tn){let i=.5+.5*Math.sin(t*38+e);_e(a,le[e],n*3);let o=E[n*3],s=E[n*3+1],l=E[n*3+2];ve(n,c.r*(1.8+i*1.2)+.2,c.g*(1.8+i*1.2)+.2,c.b*(1.8+i*1.2)+.2),k[n]=.42+i*.18;for(let e=1;e<r;e++){let r=n+e;E[r*3]=o+Math.sin(t*23+e*7.1)*.28,E[r*3+1]=s+Math.cos(t*19+e*3.3)*.28,E[r*3+2]=l+Math.sin(t*17+e*1.9)*.28,ve(r,c.r*1.2*i,c.g*1.2*i,c.b*1.2*i),k[r]=.12}continue}let l=i===En,u=l?1:-1,d=.16/w[a];for(let t=0;t<r;t++){let i=n+t;_e(a,le[e]+u*t*d,i*3);let s=(1-t/r)**1.3;l?t===0?ve(i,c.r*1.2+o.r*.6+.3,c.g*1.2+o.g*.6+.3,c.b*1.2+o.b*.6+.3):ve(i,c.r*.9*s,c.g*.9*s,c.b*.9*s):t===0?ve(i,ye,be,xe):ve(i,o.r*1.6*s,o.g*1.6*s,o.b*1.6*s),k[i]=t===0?.34:.24*s+.06}}ee.needsUpdate=!0,te.needsUpdate=!0,ne.needsUpdate=!0},dispose:()=>{for(let e of I)e.dispose();for(let e of ce)e.dispose()},wireGeo:v,fillGeo:y,linkGeo:x,chassisGeo:S,ptsGeo:re,dustGeo:F,wireMat:L,fillMat:z,linkMat:oe,chassisMat:B,ptsMat:se,dustMat:V}}function Kn({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(-1),s=(0,G.useMemo)(()=>Gn(n,r===`mobile`),[n,r]);return(0,G.useEffect)(()=>()=>s.dispose(),[s]),d(t=>{let n=i.current;if(!n)return;if(!Ae(e)){n.visible=!1;return}n.visible=!0;let r=ke(e),c=X.time,l=o.current<0?0:Math.min(Math.max(c-o.current,0),.05);o.current=c;let u=t.camera;s.U.uIntensity.value=.35+.65*r,s.U.uProj.value=t.size.height/(2*Math.tan((u.fov||62)*Math.PI/360)),s.step(l,c);let d=a.current;if(d){let e=X.aspect<.9?1:cn;d.scale.x!==e&&d.scale.setScalar(e),d.rotation.y=sn+Math.sin(c*.21)*.05,d.position.y=Math.sin(c*.47)*.12}}),(0,$.jsx)(`group`,{ref:i,position:t,children:(0,$.jsxs)(`group`,{ref:a,rotation:[0,sn,0],children:[(0,$.jsx)(`mesh`,{geometry:s.fillGeo,material:s.fillMat}),(0,$.jsx)(`lineSegments`,{geometry:s.wireGeo,material:s.wireMat}),(0,$.jsx)(`lineSegments`,{geometry:s.linkGeo,material:s.linkMat}),(0,$.jsx)(`lineSegments`,{geometry:s.chassisGeo,material:s.chassisMat}),(0,$.jsx)(`points`,{geometry:s.ptsGeo,material:s.ptsMat}),(0,$.jsx)(`points`,{geometry:s.dustGeo,material:s.dustMat})]})})}var qn=.82,Jn=.3,Yn=8,Xn=10,Zn=34,Qn=.42,$n=2.5,er=.95,tr=1.2,nr=[.62,.46,.55],rr=`
varying vec3 vBox;
varying vec3 vCol;
${Z}
void main(){
  vBox = position * ${(1/Jn).toFixed(5)};
  vCol = vec3(1.0);
  #ifdef USE_INSTANCING_COLOR
  vCol = instanceColor;
  #endif
  vec4 lp = vec4(position, 1.0);
  #ifdef USE_INSTANCING
  lp = instanceMatrix * lp;
  #endif
  vec4 mvPosition = modelViewMatrix * lp;
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`,ir=`
uniform float uFill;
varying vec3 vBox;
varying vec3 vCol;
${Q}
float second3(vec3 e){ return max(min(e.x, e.y), min(max(e.x, e.y), e.z)); }
void main(){
  vec3 e = 0.5 - abs(vBox);
  float s = second3(e);
  float aa = fwidth(s) * 1.5 + 0.01;
  float edge = 1.0 - smoothstep(0.075, 0.075 + aa, s);
  gl_FragColor = vec4(vCol * (uFill + edge) * fogVis(), 1.0);
}
`,ar=`
uniform float uT;
uniform float uDpr;
uniform float uInt;
attribute vec3 aColor;
attribute float aSize;
attribute vec4 aOrbit;
varying vec3 vCol;
${Z}
const float TC = 0.9611;
const float TS = 0.2764;
void main(){
  vec3 p = position;
  float k = 1.0;
  if (aOrbit.x > 0.0) {
    float a = aOrbit.y + uT * aOrbit.z;
    float r = aOrbit.x + sin(uT * 0.4 + aOrbit.w) * 0.25;
    vec3 q = vec3(cos(a) * r, position.y + sin(uT * 0.5 + aOrbit.w * 2.0) * 0.3, sin(a) * r);
    p = vec3(q.x * TC - q.y * TS, q.x * TS + q.y * TC, q.z);
    k = (0.4 + 0.6 * pow(0.5 + 0.5 * sin(uT * (1.3 + aOrbit.w * 0.3) + aOrbit.w * 9.0), 3.0)) * uInt;
  }
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  float dist = -mvPosition.z;
  // the halo's outer edge reaches the flight path (the camera flies past at
  // x ~ 0): never let a sprite smear across the lens
  vCol = aColor * k * smoothstep(1.5, 4.5, dist);
  vFogDepth = dist;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = clamp(aSize * uDpr * (900.0 / max(dist, 0.1)), 0.0, 64.0 * uDpr);
}
`,or=`
varying vec3 vCol;
${Q}
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 7.0);
  float halo = (1.0 - d) * 0.35;
  gl_FragColor = vec4(vCol * (core + halo) * fogVis(), 1.0);
}
`;function sr(e,t){let n=new R;return n.setAttribute(`position`,new A(new Float32Array(e),3)),n.setAttribute(`color`,new A(new Float32Array(t),3)),n}function cr(){return new S({vertexColors:!0,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1})}function lr(){let e=[],t=[];return{pos:e,col:t,seg:(n,r,i,a,o,s,c,l)=>{e.push(n,r,i,a,o,s),t.push(c.r*l,c.g*l,c.b*l,c.r*l,c.g*l,c.b*l)}}}function ur(e,t){let n=t===`mobile`,r=n?5:7,i=r*r*r,a=n?140:300,o=Re(1296387332),s=new N(e),c=new N(`#FFE3BF`),l=(r-1)/2,u=(r-1)*qn+Jn,d=u/2+.6,f=n?5:6.4,p=new Float32Array(i*3),h=new Float32Array(i*3),g=new Float32Array(i*3),_=new Float32Array(i),v=new Float32Array(i),y=Math.sqrt(3)*l,b=0;for(let e=0;e<r;e++)for(let t=0;t<r;t++)for(let n=0;n<r;n++){let r=b*3;g[r]=e,g[r+1]=t,g[r+2]=n,p[r]=(e-l)*qn,p[r+1]=(t-l)*qn,p[r+2]=(n-l)*qn,h[r]=(o()-.5)*1.1,h[r+1]=(o()-.5)*1.1,h[r+2]=(o()-.5)*1.1;let i=Math.hypot(e-l,t-l,n-l)/(y||1);_[b]=(.55+.45*o())*(1-.35*i),v[b]=o()*Math.PI*2,b++}let x=new ie(Jn,Jn,Jn),S=new M({uniforms:{...Y,uFill:{value:.08}},vertexShader:rr,fragmentShader:ir,transparent:!0,depthWrite:!1,blending:2,side:2,toneMapped:!1,fog:!1});S.forceSinglePass=!0;let C=new F(x,S,i);C.instanceMatrix.setUsage(j),C.instanceColor=new I(new Float32Array(i*3),3),C.instanceColor.setUsage(j),C.frustumCulled=!1;let E=C.instanceMatrix.array;for(let e=0;e<i;e++){let t=e*16;E.fill(0,t,t+16),E[t]=E[t+5]=E[t+10]=E[t+15]=1,E[t+12]=p[e*3],E[t+13]=p[e*3+1],E[t+14]=p[e*3+2]}let O=lr();for(let e of[-1,1])for(let t of[-1,1])O.seg(-d,e*d,t*d,d,e*d,t*d,s,.3),O.seg(e*d,-d,t*d,e*d,d,t*d,s,.3),O.seg(e*d,t*d,-d,e*d,t*d,d,s,.3);let k=d+.32,ee=.7;for(let e of[-1,1])for(let t of[-1,1])for(let n of[-1,1]){let r=e*k,i=t*k,a=n*k;O.seg(r,i,a,r-e*ee,i,a,s,1.9),O.seg(r,i,a,r,i-t*ee,a,s,1.9),O.seg(r,i,a,r,i,a-n*ee,s,1.9)}let te=k*Math.sqrt(3),ne=1/Math.sqrt(3);for(let e of[-1,1])for(let t=0;t<3;t++){let n=(te+.35+t*.42)*e*ne,r=(te+.59+t*.42)*e*ne;O.seg(n,n,n,r,r,r,s,1.3-t*.35)}let re=sr(O.pos,O.col),P=cr(),ae=new w(re,P),L=lr(),z=u/2+.22;L.seg(-z,0,-z,z,0,-z,s,1.5),L.seg(z,0,-z,z,0,z,s,1.5),L.seg(z,0,z,-z,0,z,s,1.5),L.seg(-z,0,z,-z,0,-z,s,1.5),L.seg(0,0,-z,0,0,-z+.4,c,1.3),L.seg(z,0,0,z-.4,0,0,c,1.3),L.seg(0,0,z,0,0,z-.4,c,1.3),L.seg(-z,0,0,-z+.4,0,0,c,1.3);let oe=sr(L.pos,L.col),B=cr(),se=new w(oe,B),V=lr(),ce=n?72:120;for(let e=0;e<ce;e++){let t=e/ce*Math.PI*2,n=(e+1)/ce*Math.PI*2,r=.2+.95*Math.max(0,Math.cos(3*(t+n)*.5))**10;V.seg(Math.cos(t)*f,0,Math.sin(t)*f,Math.cos(n)*f,0,Math.sin(n)*f,s,r)}for(let e=0;e<48;e++){let t=e/48*Math.PI*2,n=e%4==0,r=f+(n?.5:.22);V.seg(Math.cos(t)*f,0,Math.sin(t)*f,Math.cos(t)*r,0,Math.sin(t)*r,s,n?1.2:.55)}let H=sr(V.pos,V.col),le=cr(),ue=new w(H,le),U=new Float32Array(Yn*Zn*3),W=new Float32Array(Yn*Zn*3),de=new R;de.setAttribute(`position`,new A(U,3).setUsage(j)),de.setAttribute(`color`,new A(W,3).setUsage(j));let fe=cr(),G=new w(de,fe);G.frustumCulled=!1;let pe=Yn+a,me=new Float32Array(pe*3),he=new Float32Array(pe*3),ge=new Float32Array(pe),_e=new Float32Array(pe*4),ve=n?3.4:4.2,ye=n?6:7.6;for(let e=0;e<a;e++){let t=Yn+e;_e[t*4]=ve+o()*(ye-ve),_e[t*4+1]=o()*Math.PI*2,_e[t*4+2]=(.06+o()*.16)*(o()<.8?1:-1),_e[t*4+3]=o()*Math.PI*2,me[t*3+1]=(o()+o()+o()-1.5)*2.6;let n=o()<.1,r=n?c:s,i=n?1.6:.5+o()*.8;he[t*3]=r.r*i,he[t*3+1]=r.g*i,he[t*3+2]=r.b*i,ge[t]=n?.13:.05+o()*.07}let be=[new A(me,3).setUsage(j),new A(he,3).setUsage(j),new A(ge,1).setUsage(j)],xe=new R;xe.setAttribute(`position`,be[0]),xe.setAttribute(`aColor`,be[1]),xe.setAttribute(`aSize`,be[2]),xe.setAttribute(`aOrbit`,new A(_e,4));let Se=new M({uniforms:{...Y,uT:{value:0},uInt:{value:.35}},vertexShader:ar,fragmentShader:or,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1}),Ce=new T(xe,Se);Ce.frustumCulled=!1;let we=new m().setFromUnitVectors(new D(1,1,1).normalize(),new D(0,1,0)),Te=new Float32Array(i).fill(-1e6),Ee=new Float32Array(i),De=new Float32Array(i*3);return De.set(p),{n:r,count:i,L:u,mobile:n,acc:s,hotW:c,qDiamond:we,base:p,jit:h,grid:g,bright:_,phase:v,start:Te,peak:Ee,cur:De,voxels:C,voxelMat:S,frame:ae,frameMat:P,scan:se,scanMat:B,ring:ue,ringMat:le,beams:G,beamPos:U,beamCol:W,beamGeo:de,beamMat:fe,points:Ce,ptGeo:xe,ptMat:Se,ptPos:me,ptCol:he,ptSize:ge,headAttrs:be,bSrc:new Int16Array(Yn).fill(-1),bStart:new Float32Array(Yn),bEnd:new Float32Array(Yn*3),bLift:new Float32Array(Yn*3),rnd:Re(1592590340),next:0,events:0,lock:0,dispose(){C.dispose(),x.dispose(),S.dispose(),re.dispose(),P.dispose(),oe.dispose(),B.dispose(),H.dispose(),le.dispose(),de.dispose(),fe.dispose(),xe.dispose(),Se.dispose()}}}function dr(e,t,n){let{n:r,count:i,grid:a,start:o,peak:s,rnd:c}=e,l=Math.floor(c()*i)%i,u=a[l*3],d=a[l*3+1],f=a[l*3+2],p=(e.mobile?1:1.3)+c()*.7;for(let e=0;e<i;e++){let n=a[e*3]-u,r=a[e*3+1]-d,i=a[e*3+2]-f,c=Math.sqrt(n*n+r*r+i*i);c>p||(o[e]=t+c*.085,s[e]=1-c/p*.55)}let m=n>.55&&c()<.45?2:1;for(let n=0;n<m;n++){let i=0,a=1/0;for(let t=0;t<Yn;t++){if(e.bSrc[t]<0){i=t;break}e.bStart[t]<a&&(a=e.bStart[t],i=t)}let o=l;if(n>0){let e=g.clamp(u+Math.round(c()*2-1),0,r-1),t=g.clamp(d+Math.round(c()*2-1),0,r-1),n=g.clamp(f+1-2*Math.round(c()),0,r-1);o=(e*r+t)*r+n}e.bSrc[i]=o,e.bStart[i]=t+.1+n*.2,e.events++;let s=e.events*.618034%1,p=i*3;e.bEnd[p]=e.mobile?-3.8-c()*1.4:-6.6-c()*2.6,e.bEnd[p+1]=-2.6+s*5.6,e.bEnd[p+2]=-1.2+c()*3.8,e.bLift[p]=0,e.bLift[p+1]=1+c()*1.6,e.bLift[p+2]=.6+c()}}var fr=new D,pr=new D,mr=new D,hr=new D,gr=new k;function _r(e,t){let n=1-e,r=n*n,i=2*n*e,a=e*e;t.set(r*fr.x+i*mr.x+a*pr.x,r*fr.y+i*mr.y+a*pr.y,r*fr.z+i*mr.z+a*pr.z)}function vr(e,t,n,r,i){e[t*3]=n,e[t*3+1]=r,e[t*3+2]=i}function yr(e,t,n,r,i,a,o,s,c,l){vr(e.beamPos,t,n,r,i),vr(e.beamPos,t+1,a,o,s),vr(e.beamCol,t,c.r*l,c.g*l,c.b*l),vr(e.beamCol,t+1,c.r*l,c.g*l,c.b*l)}function br(e,t,n){let{acc:r,hotW:i,beamPos:a,beamCol:o,ptPos:s,ptCol:c,ptSize:l}=e;for(let u=0;u<Yn;u++){let d=u*Zn,f=t-e.bStart[u],p=e.bSrc[u];if(p<0||f<0||f>$n){p>=0&&f>$n&&(e.bSrc[u]=-1),a.fill(0,d*3,(d+Zn)*3),o.fill(0,d*3,(d+Zn)*3),c[u*3]=c[u*3+1]=c[u*3+2]=0,l[u]=0;continue}fr.set(e.cur[p*3],e.cur[p*3+1],e.cur[p*3+2]).applyQuaternion(e.qDiamond).applyMatrix4(gr);let m=u*3;pr.set(e.bEnd[m],e.bEnd[m+1],e.bEnd[m+2]),mr.addVectors(fr,pr).multiplyScalar(.5),mr.x+=e.bLift[m],mr.y+=e.bLift[m+1],mr.z+=e.bLift[m+2];let h=Math.min(f/Qn,1),_=1-(1-h)*(1-h)*(1-h),v=(f<Qn?1:Math.exp(-(f-Qn)*1.45))*(.55+.45*n),y=f>Qn?(f-Qn)*1.1%1:-10,b=f<Qn?2.2:.7;for(let e=0;e<=Xn;e++){let t=e/Xn;_r(t*_,hr);let n=(.3+.9*t*t)*v,s=(t-y)*7,c=(Math.exp(-s*s)*1.6+t*t*t*t*t*t*b)*v,l=r.r*n+i.r*c,u=r.g*n+i.g*c,f=r.b*n+i.b*c;e>0&&(vr(a,d+2*(e-1)+1,hr.x,hr.y,hr.z),vr(o,d+2*(e-1)+1,l,u,f)),e<Xn&&(vr(a,d+2*e,hr.x,hr.y,hr.z),vr(o,d+2*e,l,u,f))}s[u*3]=hr.x,s[u*3+1]=hr.y,s[u*3+2]=hr.z;let x=(f<Qn?3:2)*v;c[u*3]=i.r*x,c[u*3+1]=i.g*x,c[u*3+2]=i.b*x,l[u]=f<Qn?.45:.3+.07*Math.sin(f*12);let S=g.smoothstep(f,Qn*.8,.7),C=er/2*S,w=tr/2*S,T=pr.x-er/2-.1,E=pr.y,D=pr.z,O=1.5*v*S,k=d+Xn*2;yr(e,k,T-C,E-w,D,T+C,E-w,D,r,O),yr(e,k+=2,T+C,E-w,D,T+C,E+w,D,r,O),yr(e,k+=2,T+C,E+w,D,T-C,E+w,D,r,O),yr(e,k+=2,T-C,E+w,D,T-C,E-w,D,r,O);for(let t=0;t<nr.length;t++){let n=g.clamp((f-Qn-.15-t*.12)/.3,0,1),a=E+w*(.5-t*.36),o=T-C+.14*S,s=o+nr[t]*er*S*n;yr(e,k+=2,o,a,D,s,a,D,t===0?i:r,(t===0?1.3:.9)*v*S)}}}function xr({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(null),s=(0,G.useMemo)(()=>ur(n,r),[n,r]);return(0,G.useEffect)(()=>()=>s.dispose(),[s]),d((t,n)=>{let r=i.current,c=a.current;if(!r||!c)return;if(!Ae(e)){r.visible=!1;return}r.visible=!0;let l=s,u=ke(e),d=X.time,f=.35+.65*u;l.lock=g.damp(l.lock,u,2.5,Math.min(n,.1));let p=1-l.lock,m=1+.14*p;c.rotation.set(Math.sin(d*.23)*.06,d*.16,0),c.updateMatrix(),gr.copy(c.matrix),o.current&&(o.current.rotation.y=d*.07);let h=-l.L/2-.35+(l.L+.7)*(d/3.4%1);l.scan.position.y=h,(d>=l.next||l.next-d>5)&&(dr(l,d,u),l.next=d+.8*(1.7-.7*u)*(.7+.6*l.rnd()));let{count:_,base:v,jit:y,bright:b,phase:x,start:S,peak:C,cur:w,acc:T,hotW:E}=l,D=l.voxels.instanceMatrix.array,O=l.voxels.instanceColor.array;for(let e=0;e<_;e++){let t=e*3,n=d-S[e],r=n<0?0:C[e]*(n<.1?n/.1:Math.exp(-(n-.1)*2.3)),i=p*(.6+.4*Math.sin(d*.7+x[e])),a=v[t]*m+y[t]*i,o=v[t+1]*m+y[t+1]*i,s=v[t+2]*m+y[t+2]*i;w[t]=a,w[t+1]=o,w[t+2]=s;let c=1+.4*r,l=e*16;D[l]=D[l+5]=D[l+10]=c,D[l+12]=a,D[l+13]=o,D[l+14]=s;let u=o-h,g=Math.exp(-u*u*5),_=f*b[e]*(.27+.5*g),k=r*(.9+1.1*f);O[t]=T.r*_+E.r*k,O[t+1]=T.g*_+E.g*k,O[t+2]=T.b*_+E.b*k}l.voxels.instanceMatrix.needsUpdate=!0,l.voxels.instanceColor.needsUpdate=!0,br(l,d,f),l.beamGeo.attributes.position.needsUpdate=!0,l.beamGeo.attributes.color.needsUpdate=!0;for(let e=0;e<l.headAttrs.length;e++){let t=l.headAttrs[e];t.clearUpdateRanges(),t.addUpdateRange(0,Yn*t.itemSize),t.needsUpdate=!0}l.frameMat.color.setScalar(f),l.scanMat.color.setScalar(f*(.6+.4*u)),l.ringMat.color.setScalar(f*.9),l.ptMat.uniforms.uT.value=d,l.ptMat.uniforms.uInt.value=f}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`group`,{ref:a,children:(0,$.jsxs)(`group`,{quaternion:s.qDiamond,children:[(0,$.jsx)(`primitive`,{object:s.voxels}),(0,$.jsx)(`primitive`,{object:s.frame}),(0,$.jsx)(`primitive`,{object:s.scan})]})}),(0,$.jsx)(`group`,{rotation:[.36,0,-.2],children:(0,$.jsx)(`group`,{ref:o,children:(0,$.jsx)(`primitive`,{object:s.ring})})}),(0,$.jsx)(`primitive`,{object:s.beams}),(0,$.jsx)(`primitive`,{object:s.points})]})}var Sr=-5,Cr=6,wr=.6,Tr=5.4,Er=2.25,Dr=6,Or=24,kr=-5.35,Ar=[0,.37,.71],jr=e=>wr+(Tr-wr)*e**1.25,Mr=`
float funnelR(float t) { return 0.6 + 4.8 * pow(t, 1.25); }
`,Nr=class extends L{constructor(){super()}getPoint(e,t=new D){let n=e*Er*Math.PI*2,r=jr(e);return t.set(Math.cos(n)*r,Sr+(Cr-Sr)*e,Math.sin(n)*r)}getUtoTmapping(e){return e}},Pr={transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1},Fr=`
uniform float uTime;
uniform float uDpr;
uniform float uFlow;
uniform float uFlash;
attribute float aSeed;
attribute float aOffset;
attribute float aSpeed;
attribute float aAng;
attribute float aRadF;
attribute float aSize;
varying float vT;
varying float vBright;
${Z}
${Mr}
void main() {
  float t = fract(aOffset + uFlow * 0.065 * aSpeed);
  float r = funnelR(t) * aRadF + sin(uTime * 1.3 + aSeed * 40.0) * 0.07 * (0.3 + t);
  float a = aAng + t * 14.137167;
  vec3 p = vec3(cos(a) * r, mix(-5.0, 6.0, t), sin(a) * r);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
  float tw = 0.6 + 0.4 * sin(uTime * (2.0 + aSeed * 5.0) + aSeed * 91.0);
  float ends = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.94, 1.0, t));
  float top = smoothstep(0.8, 1.0, t);
  vBright = tw * ends;
  vT = t;
  float size = aSize * (1.3 + 2.4 * aSeed * aSeed) * (1.0 + 0.7 * t) * (1.0 + uFlash * top);
  gl_PointSize = clamp(size * uDpr * (34.0 / max(-mv.z, 0.5)), 1.0, 28.0);
}
`,Ir=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uInt;
uniform float uFlash;
varying float vT;
varying float vBright;
${Q}
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float halo = 1.0 - smoothstep(0.0, 0.5, d);
  float core = exp(-d * d * 55.0);
  float top = smoothstep(0.6, 1.0, vT);
  vec3 col = mix(uColor, uHot, top * top * 0.9);
  float k = (halo * halo * 0.6 + core * 1.3) * vBright * (0.85 + 1.2 * top + uFlash * top * 1.4);
  gl_FragColor = vec4(col * k * uInt * fogVis(), 1.0);
}
`,Lr=`
varying float vT;
${Z}
void main() {
  vT = uv.x;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,Rr=`
uniform vec3 uColor;
uniform vec3 uAccHot;
uniform vec3 uHot;
uniform float uInt;
uniform float uFlow;
uniform float uFlash;
varying float vT;
${Q}
void main() {
  // same climb rate as the leads: 0.065 of the height per flow unit
  float ph = fract(vT * 4.0 - uFlow * 0.26);
  float pulse = pow(ph, 10.0);
  float ends = smoothstep(0.0, 0.05, vT) * (1.0 - smoothstep(0.985, 1.0, vT));
  vec3 col = uColor * (0.28 + 0.6 * vT);
  col += mix(uAccHot, uHot, pulse * pulse) * pulse * 1.3;
  col += uHot * uFlash * smoothstep(0.82, 1.0, vT) * 0.7;
  gl_FragColor = vec4(col * ends * uInt * fogVis(), 1.0);
}
`,zr=`
uniform float uTime;
uniform float uGrow;
attribute float aBar;
attribute float aU;
varying float vY;
varying float vH;
varying float vU;
${Z}
void main() {
  float ramp = aBar / 23.0;
  float wave = 0.5 + 0.5 * sin(aBar * 0.5235988 - uTime * 2.1);
  float jitter = 0.12 * sin(uTime * 5.3 + aBar * 2.7);
  float h = (0.4 + ramp * 1.9 + wave * 2.6 + jitter) * (0.3 + 0.7 * uGrow);
  vec3 p = vec3(position.x, -5.35 + position.y * h, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
  vY = position.y * h;
  vH = h;
  vU = aU;
}
`,Br=`
uniform vec3 uColor;
uniform vec3 uAccHot;
uniform vec3 uHot;
uniform float uInt;
varying float vY;
varying float vH;
varying float vU;
${Q}
void main() {
  float led = 0.3 + 0.7 * step(fract(vY * 3.4), 0.7);
  float grad = 0.3 + 0.7 * clamp(vY / vH, 0.0, 1.0);
  float edge = smoothstep(0.3, 0.5, abs(vU - 0.5));
  float cap = smoothstep(vH - 0.2, vH, vY);
  vec3 col = uColor * grad * led * (0.2 + 0.7 * edge);
  col += mix(uAccHot, uHot, 0.45) * cap;
  gl_FragColor = vec4(col * uInt * fogVis(), 1.0);
}
`,Vr=`
uniform float uBurst;
attribute float aEdge;
attribute float aPhase;
varying float vEdge;
varying float vLife;
${Z}
void main() {
  float life = fract(uBurst + aPhase);
  float e = 1.0 - pow(1.0 - life, 3.0);
  float w = mix(0.4, 0.06, life);
  float rr = 5.4 + 4.4 * e + (aEdge - 0.5) * w;
  vec3 p = vec3(position.x * rr, 6.0 + 0.8 * e, position.z * rr);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
  vEdge = aEdge;
  vLife = life;
}
`,Hr=`
uniform vec3 uAccHot;
uniform vec3 uHot;
uniform float uInt;
varying float vEdge;
varying float vLife;
${Q}
void main() {
  float band = 1.0 - abs(vEdge * 2.0 - 1.0);
  band *= band;
  float fade = (1.0 - vLife) * (1.0 - vLife) * smoothstep(0.0, 0.025, vLife);
  vec3 col = mix(uHot, uAccHot * 0.8, smoothstep(0.0, 0.35, vLife));
  gl_FragColor = vec4(col * band * fade * uInt * fogVis(), 1.0);
}
`,Ur=`
varying vec2 vP;
${Z}
void main() {
  vP = (uv - 0.5) * 16.0;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,Wr=`
uniform vec3 uColor;
uniform vec3 uAccHot;
uniform vec3 uHot;
uniform float uInt;
uniform float uGrow;
uniform float uTime;
varying vec2 vP;
${Q}
void main() {
  float r = length(vP);
  if (r > 7.9) discard;
  float aa = max(fwidth(r), 1e-4);
  float rings = 1.0 - smoothstep(0.0, aa * 1.4, abs(fract(r + 0.5) - 0.5));
  // 24 spokes, lined up with the bar crown (arc distance keeps them crisp)
  float a = atan(vP.y, vP.x);
  float seg = 6.2831853 / 24.0;
  float ds = abs(fract(a / seg + 0.5) - 0.5) * seg * r;
  float spokes = (1.0 - smoothstep(0.0, aa * 1.4, ds)) * smoothstep(0.8, 1.6, r);
  float wake = mod(uTime * 0.7 - a, 6.2831853);
  float sweep = exp(-wake * 2.2) * smoothstep(0.6, 1.2, r) * (1.0 - smoothstep(5.6, 6.1, r));
  // squared by hand: pow() with a negative base is undefined (NaN on ANGLE/D3D)
  float dRim = (r - 6.0) / 0.06;
  float rim = exp(-dRim * dRim);
  float dThroat = (r - 0.6) / 0.05;
  float throat = exp(-dThroat * dThroat);
  float core = exp(-r * r * 2.5);
  float fade = 1.0 - smoothstep(5.8, 7.9, r);
  vec3 col = uColor * ((rings * 0.2 + spokes * 0.1 + sweep * 0.22) * fade + rim * 0.9 + throat * 1.4);
  col += mix(uAccHot * 0.7, uHot, 0.5) * core * (0.4 + 0.6 * uGrow);
  gl_FragColor = vec4(col * uInt * fogVis(), 1.0);
}
`;function Gr(e,t){let n=e===`mobile`,r=Re(5005),i={uInt:{value:.35},uFlow:{value:0},uFlash:{value:0},uBurst:{value:0},uGrow:{value:0},uColor:{value:new N(t)},uAccHot:{value:je(t,2.2)},uHot:{value:new N(`#ffd9e8`).multiplyScalar(2.4)}},a=(e,t,n=2)=>new M({uniforms:{...Y,...i},vertexShader:e,fragmentShader:t,side:n,...Pr}),o=n?1e3:2500,s=new Float32Array(o),c=new Float32Array(o),l=new Float32Array(o),u=new Float32Array(o),d=new Float32Array(o),f=new Float32Array(o);for(let e=0;e<o;e++){s[e]=r(),c[e]=r();let t=r();t<.6?(u[e]=e%2*Math.PI+(r()-.5)*.42,d[e]=1+(r()-.5)*.14,l[e]=.85+r()*.35,f[e]=1):t<.9?(u[e]=r()*Math.PI*2,d[e]=.2+Math.sqrt(r())*.85,l[e]=.6+r()*.4,f[e]=.75):(u[e]=r()*Math.PI*2,d[e]=1.15+r()*.5,l[e]=.25+r()*.2,f[e]=.5)}let p=new R;p.setAttribute(`position`,new A(new Float32Array(o*3),3)),p.setAttribute(`aSeed`,new A(s,1)),p.setAttribute(`aOffset`,new A(c,1)),p.setAttribute(`aSpeed`,new A(l,1)),p.setAttribute(`aAng`,new A(u,1)),p.setAttribute(`aRadF`,new A(d,1)),p.setAttribute(`aSize`,new A(f,1)),p.boundingSphere=new ae(new D(0,.5,0),11);let m=a(Fr,Ir),h=new re(new Nr,n?160:320,.045,6,!1),g=a(Lr,Rr),_=[],v=[],y=(e,t)=>{let n=jr(e);_.push(Math.cos(t)*n,Sr+(Cr-Sr)*e,Math.sin(t)*n);let r=.35+.65*e;v.push(r,r,r)};for(let e of[0,.25,.5,.75,1])for(let t=0;t<72;t++)y(e,t/72*Math.PI*2),y(e,(t+1)/72*Math.PI*2);for(let e=0;e<16;e++){let t=e/16*Math.PI*2;for(let e=0;e<22;e++)y(e/22,t),y((e+1)/22,t)}let b=new R;b.setAttribute(`position`,new A(new Float32Array(_),3)),b.setAttribute(`color`,new A(new Float32Array(v),3));let x=new N(t).multiplyScalar(.3),C=new S({color:x.clone(),vertexColors:!0,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1}),w=[],T=[],E=[],O=[],k=.09;for(let e=0;e<Or;e++){let t=e/Or*Math.PI*2,n=Math.cos(t)*Dr,r=Math.sin(t)*Dr,i=Math.cos(t),a=Math.sin(t),o=-a,s=i,c=[[n+(i+o)*k,r+(a+s)*k],[n+(-i+o)*k,r+(-a+s)*k],[n+(-i-o)*k,r+(-a-s)*k],[n+(i-o)*k,r+(a-s)*k]];for(let t=0;t<4;t++){let n=c[t],r=c[(t+1)%4],i=w.length/3;w.push(n[0],0,n[1],r[0],0,r[1],r[0],1,r[1],n[0],1,n[1]),E.push(0,1,1,0),T.push(e,e,e,e),O.push(i,i+1,i+2,i,i+2,i+3)}}let j=new R;j.setAttribute(`position`,new A(new Float32Array(w),3)),j.setAttribute(`aBar`,new A(new Float32Array(T),1)),j.setAttribute(`aU`,new A(new Float32Array(E),1)),j.setIndex(O),j.boundingSphere=new ae(new D(0,-3,0),8.5);let te=a(zr,Br),ne=n?96:160,P=[],ie=[],F=[],I=[];for(let e of Ar){let t=P.length/3;for(let t=0;t<=ne;t++){let n=t/ne*Math.PI*2;for(let t=0;t<2;t++)P.push(Math.cos(n),0,Math.sin(n)),ie.push(t),F.push(e)}for(let e=0;e<ne;e++){let n=t+e*2;I.push(n,n+1,n+3,n,n+3,n+2)}}let L=new R;L.setAttribute(`position`,new A(new Float32Array(P),3)),L.setAttribute(`aEdge`,new A(new Float32Array(ie),1)),L.setAttribute(`aPhase`,new A(new Float32Array(F),1)),L.setIndex(I),L.boundingSphere=new ae(new D(0,6.5,0),11);let z=a(Vr,Hr),oe=new ee(16,16).rotateX(-Math.PI/2).translate(0,kr-.05,0),B=a(Ur,Wr),se=[p,h,b,j,L,oe],V=[m,g,C,te,z,B];return{leadsGeo:p,leadsMat:m,strandGeo:h,strandMat:g,wireGeo:b,wireMat:C,barsGeo:j,barsMat:te,burstGeo:L,burstMat:z,padGeo:oe,padMat:B,tick(e,t){i.uInt.value=.35+.65*t,i.uGrow.value=t,i.uFlow.value+=e*(.55+.75*t),i.uBurst.value=(i.uBurst.value+e*(.09+.13*t))%1;let n=0;for(let e=0;e<Ar.length;e++)n=Math.max(n,Math.exp(-((i.uBurst.value+Ar[e])%1)*16));i.uFlash.value=n*(.4+.6*t),C.color.copy(x).multiplyScalar(i.uInt.value)},dispose(){se.forEach(e=>e.dispose()),V.forEach(e=>e.dispose())}}}function Kr({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(X.time),s=(0,G.useMemo)(()=>Gr(r,n),[r,n]);return(0,G.useEffect)(()=>()=>s.dispose(),[s]),d(()=>{let t=X.time,n=Math.min(.1,Math.max(0,t-o.current));o.current=t;let r=i.current;if(r){if(!Ae(e)){r.visible=!1;return}r.visible=!0,s.tick(n,ke(e)),a.current&&(a.current.rotation.y=t*.15)}}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsxs)(`group`,{ref:a,children:[(0,$.jsx)(`points`,{geometry:s.leadsGeo,material:s.leadsMat}),(0,$.jsx)(`mesh`,{geometry:s.strandGeo,material:s.strandMat}),(0,$.jsx)(`mesh`,{geometry:s.strandGeo,material:s.strandMat,"rotation-y":Math.PI}),(0,$.jsx)(`lineSegments`,{geometry:s.wireGeo,material:s.wireMat})]}),(0,$.jsx)(`mesh`,{geometry:s.barsGeo,material:s.barsMat}),(0,$.jsx)(`mesh`,{geometry:s.burstGeo,material:s.burstMat}),(0,$.jsx)(`mesh`,{geometry:s.padGeo,material:s.padMat})]})}var qr=Math.PI*2,Jr=[5.4,4.4,3.4],Yr=.03,Xr=1.1,Zr=-4.8,Qr=4.7,$r=12,ei=7.1,ti=10,ni=`#FFB547`,ri=`
uniform mat4 uG0;
uniform mat4 uG1;
uniform mat4 uG2;
uniform mat4 uG3;
mat4 gimbal(float g) {
  if (g < 0.5) return uG0;
  if (g < 1.5) return uG1;
  if (g < 2.5) return uG2;
  return uG3;
}
`,ii=`
float scan(float u, float g) {
  float behind = fract(uT * (0.08 + 0.035 * g) + g * 0.31 - u);
  return exp(-behind * 8.0) * 0.85 + exp(-behind * 90.0) * 0.8;
}
`,ai=`
float nearFade(){ return smoothstep(0.8, 4.0, vFogDepth); }
`,oi=`
attribute float aGimbal;
varying float vU;
varying float vG;
${Z}
${ri}
void main() {
  vec4 mv = modelViewMatrix * (gimbal(aGimbal) * vec4(position, 1.0));
  vU = uv.x;
  vG = aGimbal;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,si=`
uniform float uT;
uniform float uEnergy;
uniform vec3 uColor;
uniform vec3 uHot;
varying float vU;
varying float vG;
${Q}
${ai}
${ii}
void main() {
  vec3 col = uColor * (0.28 + 0.1 * vG) + uHot * scan(vU, vG);
  gl_FragColor = vec4(col * uEnergy * fogVis() * nearFade(), 1.0);
}
`,ci=`
attribute float aGimbal;
attribute float aKind; // 0 short tick, 1 long tick, 2 axle, 3 bearing
attribute float aU;
varying float vU;
varying float vG;
varying float vKind;
${Z}
${ri}
void main() {
  vec4 mv = modelViewMatrix * (gimbal(aGimbal) * vec4(position, 1.0));
  vU = aU;
  vG = aGimbal;
  vKind = aKind;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,li=`
uniform float uT;
uniform float uEnergy;
uniform float uBeat;
uniform vec3 uColor;
uniform vec3 uHot;
varying float vU;
varying float vG;
varying float vKind;
${Q}
${ai}
${ii}
void main() {
  vec3 col;
  if (vKind < 1.5) {
    col = uColor * (vKind > 0.5 ? 0.6 : 0.3) + uHot * scan(vU, vG) * 1.2;
  } else if (vKind < 2.5) {
    col = uColor * 0.42;
  } else {
    col = uHot * (0.6 + 0.5 * uBeat); // bearings tick with the heartbeat
  }
  gl_FragColor = vec4(col * uEnergy * fogVis() * nearFade(), 1.0);
}
`,ui=`
varying vec2 vUv;
${Z}
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,di=`
uniform float uSweep;
uniform float uEnergy;
uniform vec3 uColor;
uniform vec3 uHot;
varying vec2 vUv;
${Q}
const float TAU = 6.2831853;
void main() {
  vec2 q = vUv * 2.0 - 1.0;
  float r = length(q);
  // atan(0, 0) is undefined (NaN on some GPUs); a NaN pixel smears through
  // Bloom's mip chain, so never evaluate it at the exact centre vertex
  float ang = atan(q.y, r < 0.00001 ? 1.0 : q.x);
  float aa = max(fwidth(r), 0.0001) * 1.5;
  float behind = mod(uSweep - ang, TAU);
  float trail = exp(-behind * 2.2);
  float beam = exp(-behind * 60.0);
  float rd = abs(fract(r * 4.0 + 0.5) - 0.5) * 0.25;
  float rings = 1.0 - smoothstep(0.0, aa, rd);
  float sd = abs(fract(ang / TAU * 12.0 + 0.5) - 0.5) * (TAU / 12.0) * r;
  float spokes = (1.0 - smoothstep(0.0, aa, sd)) * smoothstep(0.08, 0.2, r);
  float td = abs(fract(ang / TAU * 72.0 + 0.5) - 0.5) * (TAU / 72.0) * r;
  float ticks = (1.0 - smoothstep(0.0, aa, td)) * smoothstep(0.92, 0.94, r);
  vec2 gq = abs(fract(q * 6.0 + 0.5) - 0.5) / 6.0;
  float grid = 1.0 - smoothstep(0.0, aa, min(gq.x, gq.y));
  float rimD = (r - 0.975) * 70.0;
  float rim = exp(-rimD * rimD);
  float lines = rings * 0.5 + spokes * 0.22 + grid * 0.07 + ticks * 0.5;
  vec3 col = uColor * (lines * (0.45 + 1.1 * trail) + trail * 0.2 + rim * 0.6);
  col += uHot * beam * smoothstep(0.02, 0.1, r) * 0.9;
  col *= 1.0 - smoothstep(0.993, 1.0, r);
  gl_FragColor = vec4(col * uEnergy * fogVis(), 1.0);
}
`,fi=`
uniform float uSweep;
uniform float uDpr;
attribute float aAng;
varying float vPing;
varying float vAge;
${Z}
const float TAU = 6.2831853;
void main() {
  float behind = mod(uSweep - aAng, TAU); // radians since the beam crossed
  vAge = behind / TAU;
  vPing = exp(-behind * 1.4);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // fixed sprite so the ping ring can genuinely grow in screen space (a sprite
  // that shrank with the ping kept the ring's pixel radius almost constant)
  gl_PointSize = clamp(44.0 * uDpr * (19.0 / -mv.z), 1.0, 120.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,pi=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uEnergy;
varying float vPing;
varying float vAge;
${Q}
void main() {
  float d = length(gl_PointCoord - 0.5);
  float dotc = 1.0 - smoothstep(0.0, 0.04 + 0.05 * vPing, d);
  float life = clamp(vAge / 0.28, 0.0, 1.0); // ring lives ~28% of a lap
  float rr = mix(0.05, 0.46, sqrt(life));
  float fade = 1.0 - life;
  float ring = (1.0 - smoothstep(0.0, 0.025, abs(d - rr))) * fade * fade;
  vec3 col = uColor * dotc * (0.3 + 0.7 * vPing) + uHot * (dotc * vPing + ring) * 0.8;
  col *= step(d, 0.5);
  gl_FragColor = vec4(col * uEnergy * fogVis(), 1.0);
}
`,mi=`
uniform float uBeat;
varying vec2 vQ;
${Z}
void main() {
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * (2.4 + 0.5 * uBeat);
  vQ = position.xy * 2.0;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,hi=`
uniform float uBeat;
uniform float uEnergy;
uniform vec3 uHot;
varying vec2 vQ;
${Q}
void main() {
  float d = length(vQ);
  float core = exp(-d * d * 34.0);
  float halo = exp(-d * d * 7.0) * (0.12 + 0.2 * uBeat);
  vec3 col = uHot * halo + vec3(2.0, 2.3, 2.5) * core * (0.5 + 0.5 * uBeat);
  col *= 1.0 - smoothstep(0.85, 1.0, d);
  gl_FragColor = vec4(col * uEnergy * fogVis(), 1.0);
}
`,gi=`
uniform float uT;
uniform float uDpr;
uniform float uDrift;
uniform float uDriftIdx;
attribute float aIdx;
varying float vAmber;
varying float vBlink;
${Z}
void main() {
  float isDrift = 1.0 - step(0.5, abs(aIdx - uDriftIdx));
  vAmber = isDrift * uDrift;
  float ph = fract(uT * (0.4 + 0.06 * mod(aIdx, 5.0)) + aIdx * 0.618);
  vBlink = 0.35 + 0.65 * exp(-ph * 10.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp((13.0 + 5.0 * vBlink + 14.0 * vAmber) * uDpr * (19.0 / -mv.z), 1.0, 56.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,_i=`
uniform float uT;
uniform float uEnergy;
uniform vec3 uHot;
uniform vec3 uAmber;
varying float vAmber;
varying float vBlink;
${Q}
${ai}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float dia = abs(c.x) + abs(c.y);
  float frame = 1.0 - smoothstep(0.0, 0.05, abs(dia - 0.3));
  float pin = 1.0 - smoothstep(0.0, 0.11, d);
  float alert = (1.0 - smoothstep(0.0, 0.04, abs(d - 0.42 + 0.04 * sin(uT * 14.0)))) * vAmber;
  vec3 tint = mix(uHot, uAmber, vAmber);
  vec3 col = tint * (frame * 0.55 + pin * vBlink) + uAmber * alert;
  col *= step(d, 0.5);
  gl_FragColor = vec4(col * uEnergy * fogVis() * nearFade(), 1.0);
}
`,vi=`
attribute float aT;
varying float vT;
${Z}
void main() {
  vT = aT;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,yi=`
uniform float uT;
uniform float uDrift;
uniform float uEnergy;
uniform vec3 uColor;
uniform vec3 uHot;
varying float vT;
${Q}
${ai}
void main() {
  vec3 col;
  if (vT < -0.5) {
    col = uColor * 0.22;
  } else {
    float x = (vT - fract(uT * 1.6)) * 7.0;
    float packet = exp(-x * x);
    col = (uHot * 0.35 + vec3(1.6, 1.9, 2.0) * packet) * uDrift;
  }
  gl_FragColor = vec4(col * uEnergy * fogVis() * nearFade(), 1.0);
}
`,bi=`
uniform float uT;
uniform float uDpr;
attribute vec4 aM; // angle, radius, phase, rise speed
varying float vA;
${Z}
void main() {
  float span = 11.5;
  float h = mod(aM.z * span + uT * aM.w, span);
  float a = aM.x + uT * 0.12;
  vA = smoothstep(0.0, 1.2, h) * (1.0 - smoothstep(span - 2.5, span, h));
  vec4 mv = modelViewMatrix * vec4(cos(a) * aM.y, h, sin(a) * aM.y, 1.0);
  gl_PointSize = clamp(5.0 * uDpr * (19.0 / -mv.z), 1.0, 16.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,xi=`
uniform vec3 uColor;
uniform float uEnergy;
varying float vA;
${Q}
void main() {
  float d = length(gl_PointCoord - 0.5);
  float glow = 1.0 - smoothstep(0.0, 0.5, d);
  gl_FragColor = vec4(uColor * glow * glow * vA * 0.9 * uEnergy * fogVis(), 1.0);
}
`;function Si(e,t,n,r=2){return new M({uniforms:e,vertexShader:t,fragmentShader:n,transparent:!0,depthWrite:!1,blending:2,side:r,toneMapped:!1,fog:!1})}function Ci(e,t){return e.boundingSphere=new ae(new D,t),e}function wi(e){let t=e%1.05/1.05,n=(t-.04)*16,r=(t-.22)*16;return Math.min(1,Math.exp(-n*n)+.6*Math.exp(-r*r))}function Ti(e,t){let n=t===`mobile`,r=Re(941690),i={uT:{value:0},uEnergy:{value:.35},uBeat:{value:0},uSweep:{value:0},uDrift:{value:0},uDriftIdx:{value:3},uColor:{value:new N(e)},uHot:{value:je(e,2.2)},uAmber:{value:je(ni,2.4)},uG0:{value:new k},uG1:{value:new k},uG2:{value:new k},uG3:{value:new k}},a=()=>({...Y,...i}),o=Jr.map(e=>new P(e,Yr,n?4:6,n?128:192)),s=0,c=0;for(let e of o)s+=e.attributes.position.count,c+=e.index.count;let l=new Float32Array(s*3),u=new Float32Array(s*2),d=new Float32Array(s),f=new Uint16Array(c),p=0,m=0;o.forEach((e,t)=>{let n=e.attributes.position.count;l.set(e.attributes.position.array,p*3),u.set(e.attributes.uv.array,p*2),d.fill(t,p,p+n);let r=e.index.array;for(let e=0;e<r.length;e++)f[m+e]=r[e]+p;p+=n,m+=r.length,e.dispose()});let h=new R;h.setAttribute(`position`,new A(l,3)),h.setAttribute(`uv`,new A(u,2)),h.setAttribute(`aGimbal`,new A(d,1)),h.setIndex(new A(f,1)),Ci(h,Jr[0]+.5);let g=Si(a(),oi,si,0),_=[],v=[],y=[],b=[],x=(e,t,n,r,i,a,o,s,c)=>{_.push(r,i,a,o,s,c),v.push(e,e),y.push(t,t),b.push(n,n)},w=(e,t,n,r)=>{let i=.14;x(e,3,0,t-i,n,r,t+i,n,r),x(e,3,0,t,n-i,r,t,n+i,r),x(e,3,0,t,n,r-i,t,n,r+i)};Jr.forEach((e,t)=>{for(let n=0;n<60;n++){let r=n/60*qr,i=Math.cos(r),a=Math.sin(r),o=n%5==0,s=e+(o?.42:.16);x(t,+!!o,n/60,i*(e+.06),a*(e+.06),0,i*s,a*s,0),o&&x(t,1,n/60,i*(e-.06),a*(e-.06),0,i*(e-.24),a*(e-.24),0)}});let[T,E,O]=Jr;x(3,2,0,0,-T,0,0,-5.9,0),x(3,2,0,0,T,0,0,T+.55,0),x(3,2,0,-.25,T+.55,0,.25,T+.55,0),w(3,0,T,0),w(3,0,-T,0),x(0,2,0,E,0,0,T,0,0),x(0,2,0,-E,0,0,-T,0,0),w(0,E,0,0),w(0,-E,0,0),x(1,2,0,0,O,0,0,E,0),x(1,2,0,0,-O,0,0,-E,0),w(1,0,O,0),w(1,0,-O,0);let M=new R;M.setAttribute(`position`,new A(new Float32Array(_),3)),M.setAttribute(`aGimbal`,new A(new Float32Array(v),1)),M.setAttribute(`aKind`,new A(new Float32Array(y),1)),M.setAttribute(`aU`,new A(new Float32Array(b),1)),Ci(M,6.4);let ne=Si(a(),ci,li),re=new te(Qr,n?64:96);re.rotateX(-Math.PI/2);let ie=Si(a(),ui,di),F=new Float32Array(ti*3),I=new Float32Array(ti);for(let e=0;e<ti;e++){let t=(e+r()*.8)/ti*qr,n=(.22+r()*.68)*Qr;F[e*3]=Math.cos(t)*n,F[e*3+1]=.03,F[e*3+2]=-Math.sin(t)*n,I[e]=t}let L=new R;L.setAttribute(`position`,new A(F,3)),L.setAttribute(`aAng`,new A(I,1)),Ci(L,5.2);let z=Si(a(),fi,pi),oe=new C(.95,1),B=new C(.48,0),se=new ce(oe),V=new ce(B),H=se.attributes.position.array,le=V.attributes.position.array,ue=new Float32Array(H.length+le.length);ue.set(H,0),ue.set(le,H.length),[oe,B,se,V].forEach(e=>e.dispose());let U=new R;U.setAttribute(`position`,new A(ue,3));let W=new S({color:je(e,1.4),transparent:!0,opacity:.35,blending:2,depthWrite:!1,toneMapped:!1}),de=Ci(new ee(1,1),2.2),fe=Si(a(),mi,hi),G=new A(new Float32Array($r*3),3);G.setUsage(j);let pe=new Float32Array($r);for(let e=0;e<$r;e++)pe[e]=e;let me=new R;me.setAttribute(`position`,G),me.setAttribute(`aIdx`,new A(pe,1)),Ci(me,8.6);let he=Si(a(),gi,_i),ge=n?72:112,_e=[0,0,0,ei,0,0],ve=[0,1];for(let e=0;e<ge;e+=2){let t=e/ge*qr,n=(e+1)/ge*qr;_e.push(Math.cos(t)*ei,0,Math.sin(t)*ei,Math.cos(n)*ei,0,Math.sin(n)*ei),ve.push(-1,-1)}let ye=new A(new Float32Array(_e),3);ye.setUsage(j);let be=new R;be.setAttribute(`position`,ye),be.setAttribute(`aT`,new A(new Float32Array(ve),1)),Ci(be,8.6);let xe=Si(a(),vi,yi),Se=n?40:80,Ce=new Float32Array(Se*4);for(let e=0;e<Se;e++)Ce[e*4]=r()*qr,Ce[e*4+1]=.3+Math.sqrt(r())*4.3,Ce[e*4+2]=r(),Ce[e*4+3]=.4+r()*.7;let we=new R;we.setAttribute(`position`,new A(new Float32Array(Se*3),3)),we.setAttribute(`aM`,new A(Ce,4)),we.boundingSphere=new ae(new D(0,5.75,0),7.5);let Te=Si(a(),bi,xi),Ee=[h,M,re,L,U,de,me,be,we],De=[g,ne,ie,z,W,fe,he,xe,Te];return{u:i,satPos:G,orbitPos:ye,ringGeo:h,ringMat:g,tickGeo:M,tickMat:ne,discGeo:re,discMat:ie,blipGeo:L,blipMat:z,eyeGeo:U,eyeMat:W,coreGeo:de,coreMat:fe,satGeo:me,satMat:he,orbitGeo:be,orbitMat:xe,moteGeo:we,moteMat:Te,dispose(){Ee.forEach(e=>e.dispose()),De.forEach(e=>e.dispose())}}}function Ei({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useMemo)(()=>Ti(n,r),[n,r]);(0,G.useEffect)(()=>()=>o.dispose(),[o]);let s=(0,G.useRef)({last:-1,a0:0,a1:1.1,a2:.6,sweep:0,orbit:0,eyeA:0,next:3.5,start:-1,idx:3}),c=(0,G.useMemo)(()=>new k,[]);return d(()=>{let t=i.current;if(!t)return;if(!Ae(e)){t.visible=!1;return}t.visible=!0;let n=ke(e),r=X.time,l=s.current,u=l.last<0?0:Math.min(Math.max(r-l.last,0),.1);l.last=r;let d=o.u,f=.5+.5*n;l.a0+=u*.18*f,l.a1+=u*.29*f,l.a2+=u*.47*f,d.uG0.value.makeRotationY(l.a0),d.uG1.value.multiplyMatrices(d.uG0.value,c.makeRotationX(l.a1)),d.uG2.value.multiplyMatrices(d.uG1.value,c.makeRotationY(l.a2)),l.sweep=(l.sweep+u*(.9+.6*n))%qr,l.orbit=(l.orbit+u*.11)%qr,l.start<0&&r>=l.next&&(l.start=r,l.idx=(l.idx+5)%$r);let p=0;if(l.start>=0){let e=r-l.start;e<.5?p=e/.5:e<2.1?p=1:e<3?p=1-(e-2.1)/.9:(l.start=-1,l.next=r+5+l.idx%4*.7),p=p*p*(3-2*p)}let m=wi(r);d.uT.value=r,d.uEnergy.value=.35+.65*n,d.uBeat.value=m,d.uSweep.value=l.sweep,d.uDrift.value=p,d.uDriftIdx.value=l.idx,o.eyeMat.opacity=(.35+.65*n)*(.75+.25*m);let h=o.satPos.array;for(let e=0;e<$r;e++){let t=l.orbit+e/$r*qr,n=e===l.idx?p:0,r=ei+n*1.1;h[e*3]=Math.cos(t)*r,h[e*3+1]=n*.6,h[e*3+2]=Math.sin(t)*r}o.satPos.needsUpdate=!0;let g=o.orbitPos.array;g[3]=h[l.idx*3],g[4]=h[l.idx*3+1],g[5]=h[l.idx*3+2],o.orbitPos.needsUpdate=!0,l.eyeA+=u*.35;let _=a.current;_&&(_.rotation.set(l.eyeA*.6,l.eyeA,0),_.scale.setScalar(1+.07*m))}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsxs)(`group`,{position:[0,Xr,0],children:[(0,$.jsx)(`mesh`,{geometry:o.ringGeo,material:o.ringMat}),(0,$.jsx)(`lineSegments`,{geometry:o.tickGeo,material:o.tickMat}),(0,$.jsx)(`group`,{ref:a,children:(0,$.jsx)(`lineSegments`,{geometry:o.eyeGeo,material:o.eyeMat})}),(0,$.jsx)(`mesh`,{geometry:o.coreGeo,material:o.coreMat}),(0,$.jsxs)(`group`,{rotation:[.42,0,.18],children:[(0,$.jsx)(`points`,{geometry:o.satGeo,material:o.satMat}),(0,$.jsx)(`lineSegments`,{geometry:o.orbitGeo,material:o.orbitMat})]})]}),(0,$.jsx)(`group`,{position:[0,Zr,0],rotation:[0,-.36,0],children:(0,$.jsxs)(`group`,{rotation:[.16,0,0],children:[(0,$.jsx)(`mesh`,{geometry:o.discGeo,material:o.discMat}),(0,$.jsx)(`points`,{geometry:o.blipGeo,material:o.blipMat})]})}),(0,$.jsx)(`points`,{position:[0,Zr,0],geometry:o.moteGeo,material:o.moteMat})]})}var Di=13,Oi=Math.PI/2,ki=14,Ai=10.5,ji=3.5,Mi=ji*4,Ni=.22,Pi=Math.PI*2,Fi=14,Ii=.52,Li=0,Ri=1,zi=2,Bi=3,Vi=4,Hi=5,Ui=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},Wi=`
float angDist(float a, float b){
  return abs(mod(a - b + 3.1415927, 6.2831853) - 3.1415927);
}
`,Gi=`
varying float vAng;
${Z}
void main(){
  vAng = uv.x * 6.2831853;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Ki=`
uniform float uTime;
uniform float uIntensity;
uniform float uPkt;
uniform float uProg;
uniform float uTrail;
uniform float uFlash;
uniform float uNear;
uniform vec3 uCol;
varying float vAng;
${Q}
void main(){
  float behind = mod(vAng - uPkt, 6.2831853);
  float ahead = 6.2831853 - behind;
  float trail = exp(-behind * (2.4 - 1.6 * uTrail)) * (0.45 + 0.75 * uTrail);
  float head = exp(-min(behind, ahead) * 30.0);
  float fromTop = mod(${Oi.toFixed(7)} - vAng, 6.2831853);
  float lit = 1.0 - smoothstep(uProg * 6.2831853 - 0.05, uProg * 6.2831853, fromTop);
  float shimmer = 0.5 + 0.5 * sin(vAng * 120.0 - uTime * 2.5);
  float b = 0.16 + lit * 0.24 + shimmer * 0.05 + trail * 1.3 + uFlash * 0.9 + uNear * 0.8;
  vec3 c = uCol * b + vec3(1.0, 1.15, 1.35) * head * 2.4;
  gl_FragColor = vec4(c * uIntensity * fogVis(), 1.0);
}
`,qi=`
attribute float aAng;
attribute float aKind;
attribute float aSpin;
attribute float aW;
attribute float aV;
uniform float uTime;
uniform float uIntensity;
uniform float uPkt;
uniform float uFlash;
uniform float uNear;
varying float vB;
varying float vW;
varying float vWhite;
${Me}
${Wi}
${Z}
void main(){
  float rot = uTime * aSpin;
  float c = cos(rot);
  float s = sin(rot);
  vec3 p = vec3(c * position.x - s * position.y, s * position.x + c * position.y, position.z);
  float a = aAng + rot;
  float near = exp(-angDist(a, uPkt) * 3.0);
  float tw = 0.6 + 0.4 * sin(uTime * 2.0 + hash11(aAng * 13.7) * 30.0);
  float b = 0.0;
  if (aKind < 0.5) {
    b = (0.22 + near * 0.9) * tw + uNear * 0.9;
  } else if (aKind < 1.5) {
    b = 0.5 + near * 1.4 + uNear * 1.4 + uFlash * 0.6;
  } else if (aKind < 2.5) {
    b = 0.24 + near * 0.8 + uNear * 0.6;
  } else if (aKind < 3.5) {
    b = 0.14 + near * 0.3 + uNear * 0.4;
  } else if (aKind < 4.5) {
    b = 0.3 + uNear * 1.2 + uFlash * 0.4;
  } else {
    float f = 1.0 - aV;
    b = f * f * (0.05 + uNear * uNear * 1.8 + uFlash * 0.3);
  }
  vB = b * uIntensity;
  vW = aW;
  vWhite = aKind > 4.5 ? 0.35 : 0.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Ji=`
uniform vec3 uCol;
varying float vB;
varying float vW;
varying float vWhite;
${Q}
void main(){
  float edge = 1.0 - vW * vW;
  vec3 c = mix(uCol, vec3(1.0), vWhite);
  gl_FragColor = vec4(c * vB * edge * fogVis(), 1.0);
}
`,Yi=`
attribute vec3 aCenter;
attribute float aStep;
attribute float aKind;
uniform float uTime;
uniform float uIntensity;
uniform float uNear;
uniform float uStep[4];
uniform vec3 uCol;
varying vec3 vCol;
${Z}
mat2 rot2(float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}
void main(){
  int i = int(aStep + 0.5);
  float act = uStep[i];
  vec3 l = position - aCenter;
  float b = 0.0;
  if (aKind < 0.5) {
    l.xz = rot2(uTime * 0.7 + aStep * 1.3) * l.xz;
    l.yz = rot2(0.42) * l.yz;
    l *= 1.0 + act * 0.22;
    b = 0.45 + act * 1.9;
  } else if (aKind < 1.5) {
    l.xz = rot2(-uTime * 1.3 - aStep) * l.xz;
    l.xy = rot2(uTime * 0.5) * l.xy;
    l *= 1.0 + act * 0.55;
    b = 0.6 + act * 2.6;
  } else if (aKind < 2.5) {
    l.xy = rot2(uTime * (mod(aStep, 2.0) < 0.5 ? 0.6 : -0.6)) * l.xy;
    l *= 1.0 + act * 0.18;
    b = 0.18 + act * 1.1;
  } else {
    b = 0.16 + act * 0.7;
  }
  b += uNear * 0.5;
  vCol = mix(uCol, vec3(1.0), clamp(act - 0.6, 0.0, 1.0) * 0.5) * b * uIntensity;
  vec4 mv = modelViewMatrix * vec4(aCenter + l, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Xi=`
varying vec3 vCol;
${Q}
void main(){
  gl_FragColor = vec4(vCol * fogVis(), 1.0);
}
`,Zi=`
attribute float aMode;
attribute float aA;
attribute float aR;
attribute float aSeed;
uniform float uTime;
uniform float uDpr;
uniform float uProj;
uniform float uIntensity;
uniform float uPkt;
uniform float uTrail;
uniform float uNear;
uniform float uStep[4];
uniform vec3 uCol;
varying vec3 vCol;
varying float vSharp;
${Me}
${Wi}
${Z}
void main(){
  vec3 p = position;
  vec3 c = uCol;
  float size = 0.1;
  float b = 1.0;
  vSharp = 0.0;
  if (aMode < 0.5) {
    int i = int(aA + 0.5);
    float act = uStep[i];
    size = 1.1 + act * 1.5;
    b = 0.18 + act * 0.9;
  } else if (aMode < 1.5) {
    float k = 1.0 - aA / ${Fi}.0;
    float ang = uPkt + aA * (0.012 + 0.03 * uTrail);
    p = vec3(cos(ang) * aR, sin(ang) * aR, 0.0);
    if (aA < 0.5) {
      size = 1.0;
      b = 2.4;
      c = vec3(1.0, 1.1, 1.3);
      vSharp = 1.0;
    } else {
      size = 0.12 + 0.3 * k;
      b = (0.4 + 1.4 * uTrail) * k * k;
      vSharp = 0.6;
    }
  } else {
    float sp = 0.03 + hash11(aSeed * 3.7) * 0.1;
    float ang = aA - uTime * sp;
    p = vec3(cos(ang) * aR, sin(ang) * aR, position.z);
    float tw = 0.5 + 0.5 * sin(uTime * (1.0 + hash11(aSeed) * 3.0) + aSeed * 50.0);
    size = 0.07 + hash11(aSeed * 9.1) * 0.09;
    b = (0.3 + exp(-angDist(ang, uPkt) * 2.5) * 1.5 + uNear * 0.6) * tw;
    c = mix(uCol, vec3(1.2), step(0.93, hash11(aSeed * 1.3)) * 0.7);
    vSharp = 0.5;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFogDepth = -mv.z;
  // sprite sizes are world units: follow the group scale (0.52 on portrait) so
  // auras and the comet keep their proportion to the ring; dust only halfway,
  // so it never shrinks below a readable sparkle
  float sc = length(modelViewMatrix[0].xyz);
  size *= aMode < 1.5 ? sc : sqrt(sc);
  gl_PointSize = clamp(size * uProj * uDpr / max(0.5, -mv.z), 1.0, 256.0);
  vCol = c * b * uIntensity;
  gl_Position = projectionMatrix * mv;
}
`,Qi=`
varying vec3 vCol;
varying float vSharp;
${Q}
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float halo = exp(-d * d * 5.0) - 0.0067;
  float core = smoothstep(0.4, 0.0, d);
  vec3 col = vCol * (halo * (1.0 - vSharp * 0.4) + core * vSharp * 1.4);
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,$i=`
varying vec2 vP;
${Z}
void main(){
  vP = position.xy;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,ea=`
uniform float uTime;
uniform float uIntensity;
uniform float uPkt;
uniform float uFlash;
uniform float uNear;
uniform float uCross;
uniform vec2 uCamXY;
uniform vec3 uCol;
varying vec2 vP;
${Me}
${Wi}
${Q}
// distance to the hex cell border (0.5 on the border) + the cell centre
float hexDist(vec2 p, out vec2 id){
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  id = p - g;
  g = abs(g);
  return max(dot(g, vec2(0.5, 0.8660254)), g.x);
}
void main(){
  float rr = length(vP) / ${Di.toFixed(1)};
  vec2 id;
  float hd = hexDist(vP * 0.62, id);
  float w = fwidth(hd) + 0.012;
  float line = smoothstep(0.5 - w, 0.5, hd);
  // finer lattice that only resolves while the camera is inside the membrane
  vec2 id2;
  float hd2 = hexDist(vP * 2.4, id2);
  float line2 = smoothstep(0.5 - fwidth(hd2) - 0.01, 0.5, hd2);
  // a few cells blink on and off like a shield negotiating a handshake
  vec2 key = vec2(floor(id.x * 2.0 + 0.5), floor(id.y * 1.1547005 + 0.5));
  float on = step(0.93, hash21(key * 1.37 + floor(uTime * 1.5 + hash21(key) * 7.0)));
  float fill = on * smoothstep(0.5, 0.2, hd);
  float rim = smoothstep(0.55, 1.0, rr);
  // atan(0, 0) is undefined (NaN on some GPUs, and a NaN pixel smears through
  // the bloom mip chain): nudge x off the exact centre
  float ax = abs(vP.x) < 0.0001 ? 0.0001 : vP.x;
  float near = exp(-angDist(atan(vP.y, ax), uPkt) * 2.0);
  float wave = 0.5 + 0.5 * sin(rr * 20.0 + uTime * 2.0);
  // ripples spreading from the exact point the camera pierces the membrane
  float dc = length(vP - uCamXY);
  float rip = 0.5 + 0.5 * sin(dc * 2.0 - uTime * 8.0);
  rip = rip * rip * rip * rip * exp(-dc * 0.1);
  float glow = exp(-dc * 0.3);
  float b = line * rim * (0.03 + near * 0.09 + wave * 0.025 + uNear * 0.05);
  b += line * uCross * (0.08 + 0.18 * rim + rip * 0.6 + glow * 0.4);
  b += line2 * uCross * (0.05 + glow * 0.25);
  b += rip * uCross * 0.05;
  b += fill * (0.05 * rim + 0.1 * uCross);
  b += smoothstep(0.94, 1.0, rr) * (0.06 + uFlash * 0.15 + uNear * 0.2 + uCross * 0.4);
  gl_FragColor = vec4(uCol * b * uIntensity * fogVis(), 1.0);
}
`;function ta(e,t){let n=[],r=[],i=[],a=[],o=[],s=[],c=[],l=0,u=e?1.6:1,d=(e,t,u,d,f=0)=>{n.push(...e),r.push(t,t,t,t),i.push(u,u,u,u),a.push(d,d,d,d),o.push(-1,1,-1,1),s.push(0,0,f,f),c.push(l,l+1,l+2,l+2,l+1,l+3),l+=4},f=(e,t,n,r,i,a,o)=>{let s=r*u,c=Math.cos(t),l=Math.sin(t),f=Math.cos(n),p=Math.sin(n);d([c*(e-s),l*(e-s),i,c*(e+s),l*(e+s),i,f*(e-s),p*(e-s),i,f*(e+s),p*(e+s),i],(t+n)/2,a,o)},p=(e,t,n,r,i,a,o,s=0)=>{let c=Math.cos(e),l=Math.sin(e),f=-l*r*u,p=c*r*u;d([c*t-f,l*t-p,i,c*t+f,l*t+p,i,c*n-f,l*n-p,i,c*n+f,l*n+p,i],e,a,o,s)},m=e?120:180;for(let e=0;e<m;e++){let t=e/m*Pi,n=e%(m/12)==0,r=(n?.7:.26)/(2*ki);f(ki,t-r,t+r,n?.06:.035,-.4,n?Ri:Li,-.05)}let h=e?72:120;for(let e=0;e<h;e++){let t=e/h*Pi,n=e%(h/12)==0;p(t,Ai,Ai-(n?.95:.42),n?.045:.025,.6,zi,.08)}let g=e?120:200;for(let e=0;e<g;e++)f(Ai,e/g*Pi,(e+1)/g*Pi,.02,.6,Bi,.08);let _=15.7;for(let e=0;e<4;e++){let t=Math.PI/4+e*Math.PI/2,n=.24;for(let e=0;e<14;e++)f(_,t-n+e*2*n/14,t-n+(e+1)*2*n/14,.045,.9,Vi,0);p(t-n,_-.55,15.75,.04,.9,Vi,0),p(t+n,_-.55,15.75,.04,.9,Vi,0)}let v=e?20:36;for(let e=0;e<v;e++)p((e+.5)/v*Pi+(t()-.5)*.08,14.4,18.4+t()*7,.05+t()*.03,0,Hi,0,1);let y=new R;return y.setAttribute(`position`,new A(new Float32Array(n),3)),y.setAttribute(`aAng`,new A(new Float32Array(r),1)),y.setAttribute(`aKind`,new A(new Float32Array(i),1)),y.setAttribute(`aSpin`,new A(new Float32Array(a),1)),y.setAttribute(`aW`,new A(new Float32Array(o),1)),y.setAttribute(`aV`,new A(new Float32Array(s),1)),y.setIndex(c),y}function na(){let e=[],t=[],n=[],r=[],i=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];for(let a=0;a<4;a++){let o=Oi-a*Math.PI/2,s=Math.cos(o),c=Math.sin(o),l=s*Di,u=c*Di,d=(i,o,s,c,d,f,p)=>{e.push(l+o,u+s,c,l+d,u+f,p),t.push(l,u,0,l,u,0),n.push(a,a),r.push(i,i)},f=(e,t)=>{for(let n=0;n<6;n++)for(let r=n+1;r<6;r++)n>>1!=r>>1&&d(t,i[n][0]*e,i[n][1]*e,i[n][2]*e,i[r][0]*e,i[r][1]*e,i[r][2]*e)};f(.9,0),f(.4,1);for(let e=0;e<36;e+=2){let t=e/36*Pi,n=(e+1)/36*Pi;d(2,Math.cos(t)*1.6,Math.sin(t)*1.6,0,Math.cos(n)*1.6,Math.sin(n)*1.6,0)}let p=c,m=-s,h=3.5;d(3,s*2,c*2,0,s*h,c*h,0),d(3,s*h,c*h,0,s*h+p*1.9,c*h+m*1.9,0);let g=3.82;d(3,s*g+p*.85,c*g+m*.85,0,s*g+p*1.9,c*g+m*1.9,0);for(let e=0;e<=a;e++){let t=.12+e*.16;d(3,s*3.7+p*t,c*3.7+m*t,0,s*3.98+p*t,c*3.98+m*t,0)}}let a=new R;return a.setAttribute(`position`,new A(new Float32Array(e),3)),a.setAttribute(`aCenter`,new A(new Float32Array(t),3)),a.setAttribute(`aStep`,new A(new Float32Array(n),1)),a.setAttribute(`aKind`,new A(new Float32Array(r),1)),a}function ra(e,t){let n=e?260:600,r=18+n,i=new Float32Array(r*3),a=new Float32Array(r),o=new Float32Array(r),s=new Float32Array(r),c=new Float32Array(r),l=0;for(let e=0;e<4;e++,l++){let t=Oi-e*Math.PI/2;i[l*3]=Math.cos(t)*Di,i[l*3+1]=Math.sin(t)*Di,a[l]=0,o[l]=e,s[l]=Di}for(let e=0;e<Fi;e++,l++)i[l*3]=Di,a[l]=1,o[l]=e,s[l]=Di;for(let e=0;e<n;e++,l++){let e=t()*Pi,n=Di+(t()+t()-1)*2.4,r=(t()-.5)*2.2;i[l*3]=Math.cos(e)*n,i[l*3+1]=Math.sin(e)*n,i[l*3+2]=r,a[l]=2,o[l]=e,s[l]=n,c[l]=t()}let u=new R;return u.setAttribute(`position`,new A(i,3)),u.setAttribute(`aMode`,new A(a,1)),u.setAttribute(`aA`,new A(o,1)),u.setAttribute(`aR`,new A(s,1)),u.setAttribute(`aSeed`,new A(c,1)),u}function ia(e,t){let n=Re(65719),r=new Float32Array(4),i={uIntensity:{value:.35},uProj:{value:800},uPkt:{value:Oi},uProg:{value:0},uTrail:{value:0},uFlash:{value:0},uNear:{value:0},uCross:{value:0},uCamXY:{value:new H(0,0)},uStep:{value:r},uCol:{value:new N(e)}},a=(e,t)=>new M({uniforms:{...Y,...i},vertexShader:e,fragmentShader:t,transparent:!0,depthWrite:!1,blending:2,fog:!1,toneMapped:!1}),o=new P(Di,t?.13:.08,6,t?220:360),s=ta(t,n),c=na(),l=ra(t,n),u=new te(Di-.12,t?72:144),d=[o,s,c,l,u];for(let e of d)e.boundingSphere=new ae(new D(0,0,0),26);let f=a(Gi,Ki),p=a(qi,Ji);p.side=2;let m=a(Yi,Xi),h=a(Zi,Qi),g=a($i,ea);g.side=2;let _=[f,p,m,h,g];return{U:i,stepLv:r,dispose:()=>{for(let e of d)e.dispose();for(let e of _)e.dispose()},ringGeo:o,ringsGeo:s,stepGeo:c,ptsGeo:l,memGeo:u,ringMat:f,ringsMat:p,stepMat:m,ptsMat:h,memMat:g}}function aa({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(-1),s=(0,G.useMemo)(()=>ia(n,r===`mobile`),[n,r]);return(0,G.useEffect)(()=>()=>s.dispose(),[s]),d(n=>{let r=i.current;if(!r)return;if(!Ae(e)){r.visible=!1;return}r.visible=!0;let c=ke(e),l=X.time,u=o.current<0?0:Math.min(Math.max(l-o.current,0),.05);o.current=l;let d=s.U,f=n.camera;d.uIntensity.value=.35+.65*c,d.uProj.value=n.size.height/(2*Math.tan((f.fov||62)*Math.PI/360));let p=X.aspect<.9?Ii:1,m=a.current;m&&(m.scale.x!==p&&m.scale.setScalar(p),m.rotation.x=Math.sin(l*.13)*.04,m.rotation.y=Math.sin(l*.11)*.05);let h=l%Mi/ji,g=Math.min(3,Math.floor(h)),_=Math.min(1,Math.max(0,(h-g-Ni)/(.95-Ni))),v=(g+_*_*(3-2*_))/4;d.uPkt.value=Oi-v*Pi,d.uProg.value=v,d.uTrail.value=4*_*(1-_);let y=h>=3.95?h-3.95:h+.05,b=1-Math.exp(-u*10),x=s.stepLv;for(let e=0;e<4;e++){let t=e===0?y:h-(e-.05),n=t<0?.08:.4+1.25*Math.exp(-t*2.4);x[e]+=(n-x[e])*b}d.uFlash.value=Math.exp(-y*3.5);let S=Math.abs(f.position.z-t[2]);d.uNear.value=1-Ui(4,24,S),d.uCross.value=1-Ui(0,7,S),d.uCamXY.value.set((f.position.x-t[0])/p,(f.position.y-t[1])/p)}),(0,$.jsx)(`group`,{ref:i,position:t,children:(0,$.jsxs)(`group`,{ref:a,children:[(0,$.jsx)(`mesh`,{geometry:s.memGeo,material:s.memMat}),(0,$.jsx)(`mesh`,{geometry:s.ringGeo,material:s.ringMat}),(0,$.jsx)(`mesh`,{geometry:s.ringsGeo,material:s.ringsMat}),(0,$.jsx)(`lineSegments`,{geometry:s.stepGeo,material:s.stepMat}),(0,$.jsx)(`points`,{geometry:s.ptsGeo,material:s.ptsMat})]})})}var oa=130,sa=70,ca=-7,la=[0,-.5],ua=[5,3.75],da=1.6,fa=100,pa=`
varying vec2 vP;
${Z}
void main() {
  vP = position.xy;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`,ma=`
uniform sampler2D uAtlas;
uniform vec3 uTint;
uniform vec2 uCell;
uniform vec2 uMin;
uniform vec2 uMax;
uniform vec2 uHoleC;
uniform vec2 uHoleH;
uniform float uHoleR;
uniform float uRimW;
uniform float uT;
uniform float uI;
uniform float uFlare;
uniform float uDensity;
uniform float uSeed;
uniform float uScan;
uniform float uGain;
uniform float uLog;
varying vec2 vP;
${Q}

// sine-free hashes: stable for the large cell / time indices used here
float h1(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float h2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  // glyph-space coords and their screen gradients, taken BEFORE any discard so
  // the quad's derivatives stay defined on every driver (ANGLE/Metal included)
  vec2 g = vP / uCell;
  vec2 gdx = dFdx(g) * 0.11;
  vec2 gdy = dFdy(g) * 0.11;

  float sd = sdRound(vP - uHoleC, uHoleH, uHoleR); // < 0 inside the opening
  if (sd < -0.2) discard;

  vec2 cell = floor(g);
  vec2 f = fract(g);
  float cx = cell.x + uSeed;
  float rowHi = floor(uMax.y / uCell.y);
  float rows = rowHi - floor(uMin.y / uCell.y);

  // rain: falling heads per column, each dragging a fading trail above it.
  // The period overshoots the wall so a head wraps only once its trail is gone.
  float live = step(h1(cx * 1.713 + 0.37), uDensity);
  float rain = 0.0;
  float head = 0.0;
  for (int i = 0; i < CW_HEADS; i++) {
    float fi = float(i);
    float hs = h1(cx * 3.117 + fi * 17.31);
    float speed = mix(3.0, 12.0, hs * hs);
    float trail = floor(mix(6.0, 28.0, h1(cx * 5.37 + fi * 9.1)));
    float period = rows + 36.0 + floor(h1(cx * 7.77 + fi * 2.9) * 48.0);
    float phase = h1(cx * 11.3 + fi * 3.3) * period;
    float hr = rowHi + 2.0 - floor(mod(uT * speed + phase, period));
    float d = cell.y - hr;
    if (d >= 0.0 && d < trail) {
      float k = 1.0 - d / trail;
      rain = max(rain, k * k);
      head = max(head, d < 0.5 ? 1.0 : (d < 1.5 ? 0.35 : 0.0));
    }
  }
  rain *= live;
  head *= live;

  // rim band: whole cells within ~uRimW of the opening light up
  vec2 cc = (cell + 0.5) * uCell - uHoleC;
  float sdc = sdRound(cc, uHoleH, uHoleR);
  float rim = (1.0 - smoothstep(0.0, uRimW, sdc)) * step(-0.45 * uCell.x, sdc);

  // log lines: a row gets typed out by a cursor, holds, then fades
  float logK = 0.0;
  float typed = 0.0;
  float cursor = 0.0;
#if CW_LOG
  float lt = uT * 0.16 + h1(cell.y * 1.31 + uSeed) * 9.0;
  float ep = mod(floor(lt), 997.0);
  float lf = fract(lt);
  float span = (uMax.x - uMin.x) / uCell.x;
  float x0 = floor((h2(vec2(ep + 3.1, cell.y * 0.7)) - 0.5) * span * 0.42);
  float len = floor(mix(10.0, 40.0, h2(vec2(cell.y + 9.7, ep))));
  float cur = x0 + floor(lf * 1.7 * len);
  typed = step(x0, cell.x) * step(cell.x, min(cur, x0 + len));
  cursor = (1.0 - step(0.5, abs(cell.x - cur))) * step(cur, x0 + len);
  logK = step(h2(vec2(cell.y, ep)), uLog) * (1.0 - smoothstep(0.72, 1.0, lf));
#endif

  // glyph: each cell re-rolls at its own cadence; heads, rim and cursor scramble
  float ch = h2(cell + uSeed * 0.13);
  float rate = mix(0.2, 2.4, ch * ch) + head * 14.0 + rim * 5.0 + cursor * logK * 20.0;
  float tick = mod(floor(uT * rate + ch * 31.0), 241.0);
  float gi = floor(h2(vec2(cell.x + tick * 7.13, cell.y - tick * 3.71)) * 64.0);
  vec2 auv = (vec2(mod(gi, 8.0), 7.0 - floor(gi / 8.0)) + mix(vec2(0.06), vec2(0.94), f)) / 8.0;
  // gradients from the continuous coordinate: no mip seams at cell borders
  float cov = textureGrad(uAtlas, auv, gdx, gdy).r;

  float occ = step(h2(cell * 1.37 + vec2(4.1, uSeed)), 0.62);
  float tw = step(0.993, h2(cell + vec2(mod(floor(uT * 3.0), 911.0), uSeed)));

  // scan sweep: thin line, glyph wake trailing behind it
  float dxs = uScan - vP.x;
  float wake = dxs >= 0.0 ? exp(-dxs * 0.3) : exp(dxs * 2.5);
  float scanLine = exp(-abs(dxs) * 9.0);

  float open = smoothstep(-0.02, 0.08, sd);
  float glyph = 0.05 * occ + rain * 0.48 + tw * 0.3
    + logK * (typed * 0.32 + cursor * 0.9)
    + rim * (0.55 + 0.9 * uFlare);
  glyph *= 1.0 + wake * 1.2;
  vec3 col = uTint * glyph * cov;
  float white = head * 2.3 + logK * cursor * 1.4 + rim * uFlare * 1.2;
  col += mix(uTint, vec3(1.0), 0.6) * white * cov;
  col *= open;

  // the opening: hot boundary line + soft halo on the wall face
  float edge = 1.0 - smoothstep(0.0, 0.2, abs(sd - 0.06));
  float halo = exp(-max(sd, 0.0) * 1.1) * step(0.0, sd);
  col += mix(uTint, vec3(1.0), 0.3) * edge * (1.1 + 2.4 * uFlare);
  col += uTint * halo * (0.1 + 0.4 * uFlare);
  col += uTint * scanLine * 0.45 * open;
  // seam where the wall meets the floor
  col += uTint * (1.0 - smoothstep(0.0, 0.15, vP.y - uMin.y)) * 0.9;

  float ef = smoothstep(uMin.x, uMin.x + 16.0, vP.x)
    * (1.0 - smoothstep(uMax.x - 16.0, uMax.x, vP.x))
    * (1.0 - smoothstep(uMax.y - 28.0, uMax.y, vP.y));
  col *= ef * uI * uGain * fogVis();
  if (max(col.r, max(col.g, col.b)) < 0.002) discard;
  gl_FragColor = vec4(col, 1.0);
}
`,ha=`
uniform float uT;
uniform float uI;
uniform float uFlare;
uniform float uDpr;
attribute vec4 aData;
attribute vec3 aDir;
varying float vA;
varying float vHot;
${Z}
void main() {
  float life = fract(uT * aData.x + aData.y);
  vec3 p = position + aDir * life * (1.0 + uFlare * 1.2);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vFogDepth = -mvPosition.z;
  vA = sin(3.14159265 * life) * (0.3 + 0.7 * uI) * (1.0 + uFlare);
  vHot = aData.w;
  gl_PointSize = clamp(aData.z * uDpr * (420.0 / max(-mvPosition.z, 0.5)), 1.0, 48.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,ga=`
uniform vec3 uTint;
varying float vA;
varying float vHot;
${Q}
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r2 = dot(q, q);
  if (r2 > 0.25) discard;
  float core = exp(-r2 * 40.0);
  float glow = exp(-r2 * 10.0) * 0.35;
  vec3 c = mix(uTint, vec3(1.0), vHot * core) * (core * (1.1 + vHot * 1.6) + glow);
  gl_FragColor = vec4(c * vA * fogVis(), 1.0);
}
`;function _a(e,t){let[n,r]=ua,i=da,a=2*(n-i),o=2*(r-i),s=Math.PI*i/2,c=[a,s,o,s,a,s,o,s],l=(e%1+1)%1*(2*a+2*o+4*s),u=0;for(;u<7&&l>c[u];)l-=c[u],u++;let d=Math.min(1,l/c[u]),f=(e,n,r)=>{let a=r-Math.PI/2*d;t.nx=Math.cos(a),t.ny=Math.sin(a),t.x=e+i*t.nx,t.y=n+i*t.ny};switch(u){case 0:t.x=-n+i+d*a,t.y=r,t.nx=0,t.ny=1;break;case 1:f(n-i,r-i,Math.PI/2);break;case 2:t.x=n,t.y=r-i-d*o,t.nx=1,t.ny=0;break;case 3:f(n-i,-r+i,0);break;case 4:t.x=n-i-d*a,t.y=-r,t.nx=0,t.ny=-1;break;case 5:f(-n+i,-r+i,-Math.PI/2);break;case 6:t.x=-n,t.y=-r+i+d*o,t.nx=-1,t.ny=0;break;default:f(-n+i,r-i,Math.PI);break}return t}function va(e){return new M({uniforms:{...Y,uAtlas:{value:null},uTint:{value:e.tint},uCell:{value:new H(e.cell[0],e.cell[1])},uMin:{value:e.min},uMax:{value:e.max},uHoleC:{value:new H(la[0],la[1])},uHoleH:{value:new H(ua[0],ua[1])},uHoleR:{value:da},uRimW:{value:e.rimW},uT:{value:0},uI:{value:.35},uFlare:{value:0},uDensity:{value:e.density},uSeed:{value:e.seed},uScan:{value:0},uGain:{value:e.gain},uLog:{value:e.log}},defines:{CW_HEADS:e.heads,CW_LOG:+(e.log>0)},vertexShader:pa,fragmentShader:ma,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1})}function ya(e,t){let n=Re(80808),r=new Float32Array(e*3),i=new Float32Array(e*3),a=new Float32Array(e*4),o={x:0,y:0,nx:0,ny:0},s=Math.floor(e*.62);for(let c=0;c<e;c++)if(c<s){_a(n(),o);let e=n()*.5;r.set([la[0]+o.x+o.nx*e,la[1]+o.y+o.ny*e,n()*.3],c*3);let t=.3+n()*1.4;i.set([o.nx*t,o.ny*t+.3,3+n()*8],c*3),a.set([.12+n()*.25,n(),.07+n()*.1,+(n()<.3)],c*4)}else{let e=0,o=0;do e=(n()-.5)*90,o=t+2+n()*36;while(Math.abs(e-la[0])<ua[0]+1&&Math.abs(o-la[1])<ua[1]+1);r.set([e,o,.3+n()*1.6],c*3),i.set([0,-(3+n()*7),.4+n()*2],c*3),a.set([.05+n()*.12,n(),.05+n()*.07,+(n()<.12)],c*4)}let c=new R;return c.setAttribute(`position`,new V(r,3)),c.setAttribute(`aDir`,new V(i,3)),c.setAttribute(`aData`,new V(a,4)),c}function ba(e){let t=[],n=[],r=new N(e),i=(e,i,a,o,s,c,l)=>{t.push(e,i,a,o,s,c),n.push(r.r*l,r.g*l,r.b*l,r.r*l,r.g*l,r.b*l)},[a,o]=la,s=ua[0]+1.1,c=ua[1]+1,l=1.8,u=.45,d=.35;for(let e of[-1,1])for(let t of[-1,1]){let n=a+e*s,r=o+t*c;i(n-e*l,r,d,n-e*u,r,d,1.6),i(n-e*u,r,d,n,r-t*u,d,1.6),i(n,r-t*u,d,n,r-t*l,d,1.6)}for(let e=-8;e<=8;e++){let t=a+e*.5,n=e%4==0?.45:.2;i(t,o+c+.25,d,t,o+c+.25+n,d,.9),i(t,o-c-.25,d,t,o-c-.25-n,d,.9)}let f={x:0,y:0,nx:0,ny:0},p={x:0,y:0,nx:0,ny:0};for(let e of[-1.75,-3.5,-5.25])for(let t=0;t<48;t++)_a(t/48,f),_a((t+1)/48,p),i(a+f.x,o+f.y,e,a+p.x,o+p.y,e,.55);for(let e=0;e<8;e++)_a((e+.5)/8,f),i(a+f.x,o+f.y,0,a+f.x,o+f.y,ca,.8);for(let e of[-1,1]){let t=o+e*(c+1.4);for(let e of[-1,1])for(let n=0;n<14;n++){let r=a+e*(s+1+n*2.4);i(r,t,.2,r+e*1.5,t,.2,.7*(1-n/14))}}let m=new R;return m.setAttribute(`position`,new V(t,3)),m.setAttribute(`color`,new V(n,3)),m}function xa(e,t,n){let r=e===`mobile`,i=new N(t),a=new ee(oa,sa,1,1);a.translate(0,n+sa/2,0);let o=new H(-130/2,n),s=new H(oa/2,n+sa),c=va({tint:i,cell:[.7,.82],min:o,max:s,density:.85,seed:0,gain:1,log:.14,rimW:1.9,heads:2}),l=va({tint:i,cell:[1.15,1.35],min:o,max:s,density:.45,seed:57.3,gain:.45,log:0,rimW:2.6,heads:1}),u=ya(r?420:900,n),d=new M({uniforms:{...Y,uTint:{value:i},uT:{value:0},uI:{value:.35},uFlare:{value:0}},vertexShader:ha,fragmentShader:ga,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1}),f=ba(t),p=new S({vertexColors:!0,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1});return{wallGeo:a,frontMat:c,backMat:l,sparkGeo:u,sparkMat:d,hudGeo:f,hudMat:p,dispose(){a.dispose(),c.dispose(),l.dispose(),u.dispose(),d.dispose(),f.dispose(),p.dispose()}}}function Sa({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=J.FLOOR_Y-t[1],o=(0,G.useMemo)(()=>xa(r,n,a),[r,n,a]);return(0,G.useEffect)(()=>()=>o.dispose(),[o]),(0,G.useEffect)(()=>{let e=Ie();return o.frontMat.uniforms.uAtlas.value=e,o.backMat.uniforms.uAtlas.value=e,()=>{o.frontMat.uniforms.uAtlas.value=null,o.backMat.uniforms.uAtlas.value=null,Le()}},[o]),d(n=>{let r=i.current;if(!r)return;if(!Ae(e)){r.visible=!1;return}r.visible=!0;let a=ke(e),s=X.time,c=.35+.65*a,l=n.camera.position.z-t[2],u=l-ca,d=Math.exp(-(l*l)/26)+.2*Math.exp(-(l*l)/700),f=Math.exp(-(u*u)/26),p=s*14%fa-fa/2,m=o.frontMat.uniforms;m.uT.value=s,m.uI.value=c,m.uFlare.value=d,m.uScan.value=p;let h=o.backMat.uniforms;h.uT.value=s,h.uI.value=c,h.uFlare.value=f,h.uScan.value=p-8;let g=o.sparkMat.uniforms;g.uT.value=s,g.uI.value=c,g.uFlare.value=Math.max(d,f),o.hudMat.color.setScalar(c*(1+1.4*Math.max(d,f)))}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`mesh`,{geometry:o.wallGeo,material:o.backMat,position:[0,0,ca]}),(0,$.jsx)(`mesh`,{geometry:o.wallGeo,material:o.frontMat}),(0,$.jsx)(`points`,{geometry:o.sparkGeo,material:o.sparkMat,frustumCulled:!1}),(0,$.jsx)(`lineSegments`,{geometry:o.hudGeo,material:o.hudMat})]})}var Ca=[-7,-3.6,5.6,9,12.4,15.8],wa=[`#FF3D7F`,`#9AE6FF`,`#FFB36B`,`#27F2C0`,`#4EA8FF`,`#7C5CFF`],Ta=[1,0,0,1,2,3],Ea=Ca.length,Da=13,Oa=9,ka=1.3,Aa=.09,ja=[[-13,-9],[Da,-9],[-13,Oa],[Da,Oa],[-6.5,Oa],[6.5,Oa],[-6.5,-9],[6.5,-9]],Ma=-7.6,Na=16.4-Ma,Pa=8.799999999999999/2,Fa=-9,Ia=28,La=Ea*4,Ra=La+Ea,za=Ra+ja.length,Ba=e=>`(${e.toFixed(3)})`,Va=`
attribute vec4 aSlab; // x scan z, y weld 0..1, z seed
attribute vec3 aHue;
varying vec2 vP;
varying vec3 vTint;
varying vec3 vHue;
varying vec4 vSlab;
${Z}
void main(){
  vP = position.xz;
  vTint = vec3(1.0);
  #ifdef USE_INSTANCING_COLOR
  vTint = instanceColor;
  #endif
  vHue = aHue;
  vSlab = aSlab;
  vec4 lp = vec4(position, 1.0);
  #ifdef USE_INSTANCING
  lp = instanceMatrix * lp;
  #endif
  vec4 mvPosition = modelViewMatrix * lp;
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`,Ha=`
uniform float uT;
uniform float uInt;
varying vec2 vP;
varying vec3 vTint;
varying vec3 vHue;
varying vec4 vSlab;
${Q}
${Me}
float rule(float d, float w, float fw){ return 1.0 - smoothstep(w, w + fw * 1.5 + 0.0001, abs(d)); }
void main(){
  vec2 d2 = vec2(${Ba(Da)}, ${Ba(Oa)}) - abs(vP);
  float ed = min(d2.x, d2.y);
  float inside = step(0.6, ed);

  // double frame: an inset rule echoing the beam outline
  float inset = rule(ed - 0.6, 0.012, fwidth(ed));

  // ruler ticks between the outline and the inset rule (front/back edges)
  float tk = rule(fract(vP.x) - 0.5, 0.025, fwidth(vP.x)) * step(d2.y, 0.42) * step(0.8, d2.x);

  // AA grid, faded out where cells shrink to a few pixels (grazing views)
  vec2 gp = vP / ${Ba(ka)};
  vec2 fw = max(fwidth(gp), vec2(0.0001));
  vec2 gd = abs(fract(gp - 0.5) - 0.5) / fw;
  float grid = (1.0 - min(min(gd.x, gd.y), 1.0)) * (1.0 - smoothstep(0.25, 0.8, max(fw.x, fw.y))) * inside;

  // blinking data cells
  vec2 cell = floor(gp);
  float h = hash21(cell + vSlab.z * 13.7);
  float blink = step(0.87, h) * (0.5 + 0.5 * sin(uT * (0.8 + h * 2.5) + h * 31.0));
  vec2 cf = abs(fract(gp) - 0.5);
  float cbox = 1.0 - smoothstep(0.2, 0.2 + max(fw.x, fw.y) * 1.5, max(cf.x, cf.y));
  float cells = blink * cbox * inside;

  // two data lanes, dashes streaming in opposite directions
  float lane = rule(abs(vP.y) - ${Ba(Oa-2.2)}, 0.03, fwidth(vP.y))
    * step(0.45, fract(vP.x * 0.7 - uT * 1.6 * sign(vP.y))) * step(1.2, d2.x);

  // the scan: hot leading edge, cooling trail behind it
  float dz = vP.y - vSlab.x;
  float band = exp(-dz * dz * 6.0);
  float trail = step(dz, 0.0) * exp(dz * 0.45);

  // an un-welded deck has an unstable signal
  float weld = vSlab.y;
  float flick = mix(0.7 + 0.3 * step(0.35, hash11(floor(uT * 14.0) + vSlab.z * 7.0)), 1.0, weld);

  vec3 col = vTint * (0.03 + grid * (0.13 + 0.5 * trail) + inset * 0.5 + band * 1.1)
    + vHue * (tk * 0.4 + lane * 0.55 + cells * (0.3 + 0.7 * trail))
    + vec3(0.15) * band;
  col *= uInt * mix(0.5, 1.0, weld) * flick * fogVis();
  gl_FragColor = vec4(col, 1.0);
}
`,Ua=`
varying vec3 vBox;
varying vec3 vScale;
varying vec3 vCol;
${Z}
void main(){
  vBox = position;
  vScale = vec3(1.0);
  vCol = vec3(1.0);
  vec4 lp = vec4(position, 1.0);
  #ifdef USE_INSTANCING
  vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  lp = instanceMatrix * lp;
  #endif
  #ifdef USE_INSTANCING_COLOR
  vCol = instanceColor;
  #endif
  vec4 mvPosition = modelViewMatrix * lp;
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`,Wa=`
uniform float uInt;
varying vec3 vBox;
varying vec3 vScale;
varying vec3 vCol;
${Q}
float second3(vec3 e){ return max(min(e.x, e.y), min(max(e.x, e.y), e.z)); }
void main(){
  vec3 e = (0.5 - abs(vBox)) * vScale;
  float s = second3(e);
  float edge = 1.0 - smoothstep(0.035, 0.035 + fwidth(s) * 1.5 + 0.0001, s);
  float yy = vBox.y * vScale.y * 4.0;
  float rack = (1.0 - smoothstep(0.06, 0.06 + fwidth(yy) * 1.5 + 0.0001, abs(fract(yy) - 0.5)))
    * step(abs(vBox.y), 0.49);
  vec3 col = vCol * (0.06 + edge + rack * 0.2) * uInt * fogVis();
  gl_FragColor = vec4(col, 1.0);
}
`,Ga=`
uniform float uT;
uniform float uDpr;
uniform float uInt;
uniform float uWeld;
attribute vec4 aData;
attribute vec3 aColor;
varying vec3 vCol;
${Z}
void main(){
  vec3 p = position;
  float k = uInt;
  if (aData.x > 1.5) {
    // a weld point ignites only once its extruding weld beam has reached it
    float reach = ${Ba(Na*.5)} * uWeld - abs(p.y - ${Ba(Pa)});
    k *= smoothstep(-0.3, 0.4, reach) * step(0.001, uWeld) * (0.6 + 0.4 * sin(uT * 3.0 + aData.y * 6.2832));
  } else if (aData.x > 0.5) {
    float f = fract(aData.y + uT * aData.z);
    p.y = ${Ba(Ma)} + ${Ba(Na)} * f;
    float halfLen = ${Ba(Na*.5)} * uWeld;
    k *= step(abs(p.y - ${Ba(Pa)}), halfLen) * smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.94, 1.0, f));
  } else {
    p.y = ${Ba(Fa)} + mod(position.y - ${Ba(Fa)} + uT * aData.z, ${Ba(Ia)});
    p.x += sin(uT * 0.3 + aData.y * 6.2832) * 0.4;
    k *= 0.25 + 0.75 * (0.5 + 0.5 * sin(uT * (1.0 + aData.z * 3.0) + aData.y * 40.0));
  }
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  float dist = -mvPosition.z;
  k *= smoothstep(1.5, 4.5, dist); // never let a sprite smear across the lens
  vCol = aColor * k;
  vFogDepth = dist;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = clamp(aData.w * uDpr * (900.0 / max(dist, 0.1)), 0.0, 64.0 * uDpr);
}
`,Ka=`
varying vec3 vCol;
${Q}
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 7.0);
  float halo = (1.0 - d) * 0.3;
  gl_FragColor = vec4(vCol * (core + halo) * fogVis(), 1.0);
}
`,qa={transparent:!0,depthWrite:!1,blending:2,toneMapped:!1};function Ja(e,t){let n=t===`mobile`,r=Re(1470889993),i=new N(e),a=new N(`#FFE3BF`),o=new N(1,1,1),s=wa.map(e=>i.clone().lerp(new N(e),.15)),c=wa.map(e=>new N(e).lerp(o,.3)),l=wa.map(e=>new N(e).lerp(i,.4).lerp(o,.15)),u=n?3:5,d=n?3:6,f=n?140:320,p=new Float32Array(Ea*6);for(let e=0;e<Ea;e++){let t=Ca[e]<1?-1:1;p[e*6]=(r()-.5)*5,p[e*6+1]=t*(.8+r()*1.6),p[e*6+2]=(r()-.5)*6,p[e*6+3]=(r()-.5)*.24,p[e*6+4]=(r()-.5)*.3,p[e*6+5]=(r()-.5)*.18}let m=new ie(1,1,1),h=new O({color:16777215,...qa}),g=new F(m,h,za);g.instanceMatrix.setUsage(j),g.frustumCulled=!1;let _=[new k().makeScale(26.09,Aa,Aa).setPosition(0,0,Oa),new k().makeScale(26.09,Aa,Aa).setPosition(0,0,-9),new k().makeScale(Aa,Aa,2*Oa).setPosition(-13,0,0),new k().makeScale(Aa,Aa,2*Oa).setPosition(Da,0,0)],v=new N;for(let e=0;e<Ea;e++){for(let t=0;t<4;t++)g.setColorAt(e*4+t,v.copy(s[e]).multiplyScalar(1));g.setColorAt(La+e,v.copy(i).multiplyScalar(1.7).add(c[e].clone().multiplyScalar(.45)))}for(let e=0;e<ja.length;e++)g.setColorAt(Ra+e,v.copy(i).multiplyScalar(1.6));g.instanceColor.needsUpdate=!0;let y=new ee(2*Da,2*Oa);y.rotateX(-Math.PI/2);let b=new M({uniforms:{...Y,uT:{value:0},uInt:{value:.35}},vertexShader:Va,fragmentShader:Ha,side:2,fog:!1,...qa});b.forceSinglePass=!0;let x=new Float32Array(Ea*4),S=new Float32Array(Ea*3);for(let e=0;e<Ea;e++)x[e*4+2]=e+r(),c[e].toArray(S,e*3);let C=new I(x,4).setUsage(j);y.setAttribute(`aSlab`,C),y.setAttribute(`aHue`,new I(S,3));let w=new F(y,b,Ea);w.instanceMatrix.setUsage(j),w.frustumCulled=!1;for(let e=0;e<Ea;e++)w.setColorAt(e,s[e]);w.instanceColor.needsUpdate=!0;let E=Ea*u,D=[],te=new Float32Array(E),ne=(2*Da-3)/u;for(let e=0;e<Ea;e++){let t=Ca[e]<1?1:-1;for(let n=0;n<u;n++){let i=ne*(.45+r()*.35),a=1.2+r()*2.6,o=.45+r()*.85,s=-11.5+ne*(n+.5)+(r()-.5)*ne*.3,c=(r()-.5)*(2*Oa-a-2.5);te[e*u+n]=c,D.push(new k().makeScale(i,o,a).setPosition(s,t*(o/2+.04),c))}}let re=new M({uniforms:{...Y,uInt:{value:.35}},vertexShader:Ua,fragmentShader:Wa,side:2,fog:!1,...qa});re.forceSinglePass=!0;let P=new F(m,re,E);P.instanceMatrix.setUsage(j),P.instanceColor=new I(new Float32Array(E*3),3),P.instanceColor.setUsage(j),P.frustumCulled=!1;let ae=ja.length*d+ja.length*Ea+f,L=new Float32Array(ae*3),z=new Float32Array(ae*3),oe=new Float32Array(ae*4),B=0,se=(e,t,n,r,i,a,o,s,c)=>{L[B*3]=e,L[B*3+1]=t,L[B*3+2]=n,oe[B*4]=r,oe[B*4+1]=i,oe[B*4+2]=a,oe[B*4+3]=o,z[B*3]=s.r*c,z[B*3+1]=s.g*c,z[B*3+2]=s.b*c,B++};for(let[e,t]of ja)for(let n=0;n<d;n++){let n=r()<.35,o=r()<.5?1:-1;se(e,Ma,t,1,r(),(.05+r()*.07)*o,.22,n?a:i,n?2.6:2.4)}for(let[e,t]of ja)for(let n=0;n<Ea;n++)se(e,Ca[n],t,2,r(),0,.34,a,2.2);for(let e=0;e<f;e++){let e=r()<.7,t=e?i:c[Math.floor(r()*Ea)%Ea];se((r()-.5)*30,Fa+r()*Ia,(r()-.5)*22,0,r(),.15+r()*.35,.05+r()*.07,t,e?.5+r()*.6:.6+r()*.4)}let V=new R;V.setAttribute(`position`,new A(L,3)),V.setAttribute(`aColor`,new A(z,3)),V.setAttribute(`aData`,new A(oe,4));let ce=new M({uniforms:{...Y,uT:{value:0},uInt:{value:.35},uWeld:{value:0}},vertexShader:Ga,fragmentShader:Ka,fog:!1,...qa}),H=new T(V,ce);return H.frustumCulled=!1,{MODS:u,off:p,outline:_,modLocal:D,modZ:te,partHues:l,beams:g,decks:w,aSlab:C,modules:P,points:H,deckMat:b,modMat:re,ptMat:ce,beamMat:h,weld:0,dispose(){g.dispose(),w.dispose(),P.dispose(),m.dispose(),h.dispose(),y.dispose(),b.dispose(),re.dispose(),V.dispose(),ce.dispose()}}}var Ya=new oe,Xa=new k,Za=new k,Qa=new N,$a=e=>{let t=e-1;return 1+2.5*t*t*t+1.5*t*t};function eo({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useMemo)(()=>Ja(n,r),[n,r]);return(0,G.useEffect)(()=>()=>a.dispose(),[a]),d((t,n)=>{let r=i.current;if(!r)return;if(!Ae(e)){r.visible=!1;return}r.visible=!0;let o=a,s=ke(e),c=X.time,l=.35+.65*s;o.weld=g.damp(o.weld,g.smoothstep(s,.2,.8),2.6,Math.min(n,.1));let u=o.weld,d=g.clamp((u-.55)/.45,0,1),f=d*d*(3-2*d),{off:p,outline:m,modLocal:h,modZ:_,partHues:v,MODS:y,beams:b,decks:x,modules:S}=o,C=o.aSlab.array;for(let e=0;e<Ea;e++){let t=$a(g.clamp(u*1.4-Ta[e]*.12,0,1)),n=1-t,r=e*6;Ya.position.set(p[r]*n,Ca[e]+p[r+1]*n,p[r+2]*n),Ya.rotation.set(p[r+3]*n,p[r+4]*n,p[r+5]*n),Ya.updateMatrix(),x.setMatrixAt(e,Ya.matrix);for(let t=0;t<4;t++)Xa.multiplyMatrices(Ya.matrix,m[t]),b.setMatrixAt(e*4+t,Xa);let i=-9+2*Oa*((c*.19+e*.16)%1);Za.makeScale(2*Da-.4,.045,.1).setPosition(0,0,i),Xa.multiplyMatrices(Ya.matrix,Za),b.setMatrixAt(La+e,Xa),C[e*4]=i,C[e*4+1]=g.clamp(t,0,1);for(let t=0;t<y;t++){let n=e*y+t;Xa.multiplyMatrices(Ya.matrix,h[n]),S.setMatrixAt(n,Xa);let r=_[n]-i;S.setColorAt(n,Qa.copy(v[e]).multiplyScalar(.55+1.9*Math.exp(-r*r*1.2)))}}let w=f>.002?.075:0;for(let e=0;e<ja.length;e++)Xa.makeScale(w,Na*f,w).setPosition(ja[e][0],Pa,ja[e][1]),b.setMatrixAt(Ra+e,Xa);b.instanceMatrix.needsUpdate=!0,x.instanceMatrix.needsUpdate=!0,o.aSlab.needsUpdate=!0,S.instanceMatrix.needsUpdate=!0,S.instanceColor.needsUpdate=!0,o.beamMat.color.setScalar(l),o.deckMat.uniforms.uT.value=c,o.deckMat.uniforms.uInt.value=l,o.modMat.uniforms.uInt.value=l,o.ptMat.uniforms.uT.value=c,o.ptMat.uniforms.uInt.value=l,o.ptMat.uniforms.uWeld.value=f}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`primitive`,{object:a.decks}),(0,$.jsx)(`primitive`,{object:a.beams}),(0,$.jsx)(`primitive`,{object:a.modules}),(0,$.jsx)(`primitive`,{object:a.points})]})}var to=15,no=2.2,ro=.6,io=-10,ao=-2.5,oo=5,so=9,co=.6,lo=[[-13,0],[13,0],[-7.5,-14],[7.5,-14]],uo=[[-6.5,0],[6.5,0],[-5,-16],[5,-16]],fo={transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1},po=`
float pick(vec4 v, float i) {
  vec4 m = vec4(1.0) - step(vec4(0.5), abs(vec4(i) - vec4(0.0, 1.0, 2.0, 3.0)));
  return dot(v, m);
}
`,mo=`
uniform vec4 uLit;
attribute float aIdx;
varying float vLit;
varying float vY;
varying float vIdx;
${Z}
${po}
void main() {
  vLit = pick(uLit, aIdx);
  vY = position.y;
  vIdx = aIdx;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,ho=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uTime;
varying float vLit;
varying float vY;
varying float vIdx;
${Q}
void main() {
  float scanY = mod(uTime * 2.6 + vIdx * 6.0, 24.0) - 13.0;
  // squared by hand: pow() with a negative base is undefined (NaN on ANGLE/D3D)
  float ds = (vY - scanY) / 0.8;
  float scan = exp(-ds * ds);
  float b = 0.35 + 0.65 * vLit;
  vec3 col = uColor * b * 0.85 + mix(uColor * 1.8, uHot, 0.4) * scan * (0.25 + 0.75 * vLit);
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,go=`
uniform vec4 uLit;
attribute float aIdx;
attribute float aKind;
varying vec2 vUv;
varying float vLit;
varying float vKind;
varying float vY;
varying float vIdx;
${Z}
${po}
void main() {
  vUv = uv;
  vLit = pick(uLit, aIdx);
  vKind = aKind;
  vY = position.y;
  vIdx = aIdx;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,_o=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uTime;
varying vec2 vUv;
varying float vLit;
varying float vKind;
varying float vY;
varying float vIdx;
${Q}
void main() {
  vec3 col;
  if (vKind < 0.5) {
    float scanY = mod(uTime * 1.6 + vIdx * 5.0, 22.0) - 12.0;
    float db = (vY - scanY) / 1.4;
    float band = exp(-db * db);
    float foot = exp(-(vY + 10.0) * 0.6);
    col = uColor * (0.02 + 0.03 * vLit + band * 0.07 * (0.3 + vLit) + foot * 0.12 * (0.3 + 0.7 * vLit));
  } else if (vKind < 1.5) {
    float pulse = 0.85 + 0.15 * sin(uTime * 3.0 + vIdx * 1.7);
    col = mix(uColor * 2.4, uHot, 0.35) * (0.35 + 0.65 * vLit) * pulse;
  } else {
    vec2 c = (vUv - 0.5) * 2.0;
    float glow = exp(-dot(c, c) * 2.2);
    float box = max(abs(c.x), abs(c.y));
    float dr = (box - 0.62) / 0.03;
    float ring = exp(-dr * dr);
    col = uColor * (glow * 0.35 + ring * 0.6) * (0.35 + 0.65 * vLit);
  }
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,vo=`
uniform vec4 uLit;
attribute float aIdx;
varying vec2 vUv;
varying float vLit;
varying float vIdx;
${Z}
${po}
void main() {
  vUv = uv;
  vLit = pick(uLit, aIdx);
  vIdx = aIdx;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,yo=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uTime;
varying vec2 vUv;
varying float vLit;
varying float vIdx;
${Q}
${Me}
void main() {
  const float COLS = 12.0;
  const float ROWS = 90.0;
  vec2 g = vUv * vec2(COLS, ROWS);
  vec2 cell = floor(g);
  vec2 f = fract(g) - 0.5;
  // both axes: the yawed slabs squash the columns more than the rows
  vec2 fw = fwidth(g);
  float aa = max(max(fw.x, fw.y), 1e-3);
  float dotMask = 1.0 - smoothstep(0.36 - aa, 0.36 + aa, length(f));
  // once a cell shrinks toward a pixel, melt the dots into an even glow (no moire)
  dotMask = mix(dotMask, 0.4, smoothstep(0.25, 0.6, aa));
  float v = (cell.y + 0.5) / ROWS;
  float t = uTime;
  // wrapped clock for the hash seeds: sin() hashes degrade as arguments grow
  // over a long session; a wrap is invisible in random flicker
  float tq = mod(t, 512.0);
  float fill = 0.06 + 0.94 * vLit;
  float on = 0.0;
  float hotDot = 0.0;
  if (vIdx < 0.5) {
    // 24/7
    float sp = 0.45 + 0.6 * hash11(cell.x * 3.17 + 1.0);
    float s = fract(hash11(cell.x * 7.31) + cell.y / 22.0 + t * sp);
    on = pow(1.0 - s, 1.6) * step(0.3, hash21(cell + floor(tq * 9.0)) + 0.5 * (1.0 - s));
    hotDot = step(0.955, 1.0 - s);
    float dBeat = (v - fract(t * 0.42)) * ROWS / 3.0;
    float beat = exp(-dBeat * dBeat);
    on = max(on, beat * 0.9);
  } else if (vIdx < 1.5) {
    // <1s
    float hc = hash11(cell.x * 5.7 + 2.0);
    float lv = 0.5 + 0.5 * sin(t * (6.0 + hc * 6.0) + hc * 20.0);
    lv *= 0.55 + 0.45 * sin(t * 1.7 + cell.x * 0.8);
    float level = fill * (0.25 + 0.75 * lv);
    on = step(v, level) * (0.6 + 0.6 * v / max(level, 0.01));
    hotDot = step(level - 1.5 / ROWS, v) * step(v, level);
  } else if (vIdx < 2.5) {
    // 500+
    float rate = 1.5 + 4.0 * hash21(cell.yx + 3.0);
    float r = hash21(cell + floor(tq * rate));
    on = step(0.62 - 0.28 * vLit, r);
    float row = step(0.988, hash11(cell.y * 1.37 + floor(tq * 7.0)));
    on = max(on, row);
    hotDot = row * step(0.5, hash21(cell * 1.7 + floor(tq * 7.0)));
  } else {
    // 2x
    float stair = (0.3 + 0.7 * (floor(cell.x / 2.0) + 1.0) / 6.0) * fill;
    float chev = fract((cell.y + abs(cell.x - 5.5) * 1.2 - t * 16.0) / 10.0);
    float c = step(chev, 0.16);
    on = max(step(v, stair) * 0.45, c);
    hotDot = c * step(chev, 0.06);
  }
  // count-up: the display is live below the fill line, a ghost above it
  float live = step(v, fill);
  float frontier = (1.0 - smoothstep(0.0, 1.6 / ROWS, abs(v - fill))) * smoothstep(0.02, 0.15, vLit);
  float dSweep = (vUv.y - 1.0 + fract(t * 0.15 + vIdx * 0.25)) * 14.0;
  float sweep = exp(-dSweep * dSweep);
  float b = 0.035 + on * mix(0.12, 0.85, live) + sweep * 0.12;
  vec3 col = uColor * b + uHot * (hotDot * live * 0.9 + frontier * 0.9);
  col *= dotMask * (0.45 + 0.55 * vLit);
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,bo=`
uniform vec4 uLit;
attribute float aIdx;
attribute float aLen;
attribute float aS;
varying float vS;
varying float vLen;
varying float vLit;
${Z}
${po}
void main() {
  vS = aS;
  vLen = aLen;
  vLit = pick(uLit, aIdx);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,xo=`
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uTime;
varying float vS;
varying float vLen;
varying float vLit;
${Q}
void main() {
  float d = vS * vLen;
  float dash = step(0.6, fract(d * 0.7 - uTime * 2.2));
  float ends = exp(-d * 1.5) + exp(-(vLen - d) * 1.5);
  float b = 0.3 + 0.7 * vLit;
  vec3 col = uColor * b * (0.45 + 0.55 * dash) + mix(uColor * 2.0, uHot, 0.5) * ends * b;
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,So=`
uniform float uTime;
uniform float uDpr;
uniform vec4 uLit;
attribute vec3 aB;
attribute float aOff;
attribute float aSpeed;
attribute float aSize;
attribute float aKind;
attribute float aIdx;
varying float vKind;
varying float vBright;
${Z}
${po}
void main() {
  float f = fract(aOff + uTime * aSpeed);
  vec3 p = mix(position, aB, f);
  float lit = pick(uLit, aIdx);
  float bright;
  if (aKind < 0.5) {
    bright = (0.12 + 0.88 * lit) * smoothstep(0.0, 0.05, f) * (1.0 - smoothstep(0.95, 1.0, f));
  } else if (aKind < 1.5) {
    p.x += sin(uTime * 0.6 + aOff * 37.0) * 0.35;
    p.z += cos(uTime * 0.5 + aOff * 23.0) * 0.35;
    float tw = 0.5 + 0.5 * sin(uTime * (1.5 + aOff * 3.0) + aOff * 60.0);
    bright = (0.3 + 0.7 * lit) * tw * smoothstep(0.0, 0.1, f) * (1.0 - smoothstep(0.8, 1.0, f));
  } else {
    bright = (0.3 + 0.7 * lit) * (0.8 + 0.2 * sin(uTime * 3.0 + aOff * 20.0));
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
  vKind = aKind;
  vBright = bright;
  gl_PointSize = clamp(aSize * uDpr * (30.0 / max(-mv.z, 0.5)), 1.0, 36.0);
}
`,Co=`
uniform vec3 uColor;
uniform vec3 uHot;
varying float vKind;
varying float vBright;
${Q}
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float halo = 1.0 - smoothstep(0.0, 0.5, d);
  float core = exp(-d * d * 60.0);
  vec3 col;
  if (vKind > 0.5 && vKind < 1.5) col = uColor * (halo * halo * 0.5 + core * 0.6);
  else col = uColor * halo * halo * 1.1 + uHot * core * 1.2;
  gl_FragColor = vec4(col * vBright * fogVis(), 1.0);
}
`;function wo(e,t){let n=0,r=0;for(let{geo:t}of e)n+=t.getAttribute(`position`).count,r+=t.index?t.index.count:0;let i=e.every(e=>e.geo.index!==null),a=new Float32Array(n*3),o=t.map(t=>{let r=e[0].geo.getAttribute(t).itemSize;return{name:t,size:r,data:new Float32Array(n*r)}}),s=Object.keys(e[0].consts).map(e=>({name:e,data:new Float32Array(n)})),c=i?new Uint32Array(r):null,l=new D,u=0,d=0;for(let{geo:t,matrix:n,consts:r}of e){let e=t.getAttribute(`position`);for(let t=0;t<e.count;t++)l.fromBufferAttribute(e,t).applyMatrix4(n),a[(u+t)*3]=l.x,a[(u+t)*3+1]=l.y,a[(u+t)*3+2]=l.z;for(let e of o){let n=t.getAttribute(e.name);for(let t=0;t<n.count;t++)for(let r=0;r<e.size;r++)e.data[(u+t)*e.size+r]=n.getComponent(t,r)}for(let t of s)t.data.fill(r[t.name],u,u+e.count);if(c&&t.index){for(let e=0;e<t.index.count;e++)c[d+e]=t.index.getX(e)+u;d+=t.index.count}u+=e.count}let f=new R;f.setAttribute(`position`,new A(a,3));for(let e of o)f.setAttribute(e.name,new A(e.data,e.size));for(let e of s)f.setAttribute(e.name,new A(e.data,1));return c&&f.setIndex(new A(c,1)),f}function To(e){let t=[],n=(e,n)=>t.push(e[0],e[1],e[2],n[0],n[1],n[2]),r=ro/2,i=no/2;for(let e of[-5,0])n([-.3,e,-1.1],[r,e,-1.1]),n([r,e,-1.1],[r,e,i]),n([r,e,i],[-.3,e,i]),n([-.3,e,i],[-.3,e,-1.1]);let a=-e*.304,o=.97,s=ao-7.18,c=4.68;n([a,s,-.97],[a,s,o]),n([a,c,-.97],[a,c,o]),n([a,s,-.97],[a,c,-.97]),n([a,s,o],[a,c,o]);for(let e=-9;e<oo;e++){let t=(e-io)%5==0?.13:.06;n([a,e,i],[a,e,i-t]),n([a,e,-1.1],[a,e,-1.1+t])}return t}function Eo(e,t){let n=e===`mobile`,r=n?uo:lo,i=Re(10010),a={uLit:{value:new _},uColor:{value:new N(t)},uHot:{value:new N(`#d8fff2`).multiplyScalar(2.3)}},o=(e,t,n)=>new M({uniforms:{...Y,...a},vertexShader:e,fragmentShader:t,side:n,...fo}),s=()=>new ae(new D(0,0,-7),26),c=r.map(([e,t])=>new k().makeRotationY(Math.sign(e)*co).setPosition(e,0,t)),l=[],u=e=>(l.push(e),e),d=u(new ie(ro,to,no).translate(0,ao,0)),f=u(new ce(d)),p=[];c.forEach((e,t)=>{p.push({geo:f,matrix:e,consts:{aIdx:t}});let n=u(new R);n.setAttribute(`position`,new A(new Float32Array(To(Math.sign(r[t][0]))),3)),p.push({geo:n,matrix:e,consts:{aIdx:t}})});let h=wo(p,[]);h.boundingSphere=s();let g=u(new ie(.74,.14,2.3400000000000003).translate(0,5.07,0)),v=u(new ee(2.6,4.2).rotateX(-Math.PI/2).translate(0,-9.97,0)),y=[];c.forEach((e,t)=>{y.push({geo:d,matrix:e,consts:{aIdx:t,aKind:0}}),y.push({geo:g,matrix:e,consts:{aIdx:t,aKind:1}}),y.push({geo:v,matrix:e,consts:{aIdx:t,aKind:2}})});let b=wo(y,[`uv`]);b.boundingSphere=s();let x=u(new ee(1.86,14.2)),S=wo(c.map((e,t)=>{let n=Math.sign(r[t][0]),i=new k().makeRotationY(n>0?-Math.PI/2:Math.PI/2).setPosition(-n*.312,ao,0);return{geo:x,matrix:e.clone().multiply(i),consts:{aIdx:t}}}),[`uv`]);S.boundingSphere=s();let C=r.map(([e,t])=>new D(e,5.14,t)),w=r.map(([e,t])=>new D(e,so,t)),T=[...C.map((e,t)=>({a:e,b:w[t],idx:t,th:.07})),{a:w[0],b:w[1],idx:1,th:.075},{a:w[3],b:w[2],idx:3,th:.065},{a:w[0],b:w[2],idx:2,th:.05},{a:w[1],b:w[3],idx:3,th:.05},{a:w[0],b:w[3],idx:3,th:.035},{a:w[1],b:w[2],idx:3,th:.035}],E=new D(1,0,0),O=new D,j=new D,te=new m,ne=new D(1,1,1),re=wo(T.map(({a:e,b:t,idx:n,th:r})=>{let i=e.distanceTo(t),a=u(new ie(i,r,r)),o=a.getAttribute(`position`),s=new Float32Array(o.count);for(let e=0;e<o.count;e++)s[e]=o.getX(e)/i+.5;return a.setAttribute(`aS`,new A(s,1)),O.subVectors(t,e).normalize(),te.setFromUnitVectors(E,O),j.addVectors(e,t).multiplyScalar(.5),{geo:a,matrix:new k().compose(j,te,ne),consts:{aIdx:n,aLen:i}}}),[`aS`]);re.boundingSphere=s(),l.forEach(e=>e.dispose());let P=[],F=[],I=[],L=[],z=[],oe=[],B=[],se=(e,t,n,r,i,a,o)=>{P.push(e.x,e.y,e.z),F.push(t.x,t.y,t.z),I.push(n),L.push(r),z.push(i),oe.push(a),B.push(o)};for(let{a:e,b:t,idx:n}of T){let r=e.distanceTo(t),a=Math.max(1,Math.round(r/4));for(let o=0;o<a;o++)se(e,t,o/a+i()*.1,(4.5+i()*2.5)/r,2.6+i(),0,n)}let V=n?180:420,H=(r[0][1]+r[2][1])/2,le=new D,ue=new D;for(let e=0;e<V;e++){let e=i()<.5?-1:1,t=e*(n?3+i()*9:4+i()*12),r=-22+i()*30;le.set(t,io,r),ue.set(t+(i()-.5)*2,11,r+(i()-.5)*2);let a=(r>H?0:2)+ +(e>0);se(le,ue,i(),.025+i()*.035,.8+i()*1.2,1,a)}w.forEach((e,t)=>se(e,e,i(),0,6.5,2,t));let U=new D().addVectors(w[0],w[1]).multiplyScalar(.5),W=new D().addVectors(w[2],w[3]).multiplyScalar(.5);se(U,U,i(),0,4.5,2,1),se(W,W,i(),0,4.5,2,3);let de=-w[0].x/(w[3].x-w[0].x),fe=new D().lerpVectors(w[0],w[3],de);se(fe,fe,i(),0,5,2,3);let G=new R;G.setAttribute(`position`,new A(new Float32Array(P),3)),G.setAttribute(`aB`,new A(new Float32Array(F),3)),G.setAttribute(`aOff`,new A(new Float32Array(I),1)),G.setAttribute(`aSpeed`,new A(new Float32Array(L),1)),G.setAttribute(`aSize`,new A(new Float32Array(z),1)),G.setAttribute(`aKind`,new A(new Float32Array(oe),1)),G.setAttribute(`aIdx`,new A(new Float32Array(B),1)),G.boundingSphere=s();let pe=o(mo,ho,0),me=o(go,_o,2),he=o(vo,yo,2),ge=o(bo,xo,0),_e=o(So,Co,0),ve=[h,b,S,re,G],ye=[pe,me,he,ge,_e];return{u:a,edgeGeo:h,edgeMat:pe,bodyGeo:b,bodyMat:me,dataGeo:S,dataMat:he,beamGeo:re,beamMat:ge,ptsGeo:G,ptsMat:_e,dispose(){ve.forEach(e=>e.dispose()),ye.forEach(e=>e.dispose())}}}var Do=(e,t)=>{let n=Math.min(1,Math.max(0,(e-t*.13)/.5));return n*n*(3-2*n)};function Oo({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useMemo)(()=>Eo(r,n),[r,n]);return(0,G.useEffect)(()=>()=>a.dispose(),[a]),d(()=>{let t=i.current;if(!t)return;if(!Ae(e)){t.visible=!1;return}t.visible=!0;let n=ke(e);a.u.uLit.value.set(Do(n,0),Do(n,1),Do(n,2),Do(n,3))}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`mesh`,{geometry:a.bodyGeo,material:a.bodyMat}),(0,$.jsx)(`mesh`,{geometry:a.dataGeo,material:a.dataMat}),(0,$.jsx)(`lineSegments`,{geometry:a.edgeGeo,material:a.edgeMat}),(0,$.jsx)(`mesh`,{geometry:a.beamGeo,material:a.beamMat}),(0,$.jsx)(`points`,{geometry:a.ptsGeo,material:a.ptsMat})]})}var ko=[-15,0,15],Ao=[.5,1,.5],jo=4.5,Mo=8,No=1.6,Po=.5,Fo=`
attribute vec4 aInst; // brightness, gate, kind, param
varying vec3 vG;
varying vec4 vInst;
${Z}
void main() {
  vec4 gp = instanceMatrix * vec4(position, 1.0);
  vG = gp.xyz;
  vInst = aInst;
  vec4 mvPosition = modelViewMatrix * gp;
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`,Io=`
uniform vec3 uTint;
uniform float uT;
uniform float uI;
uniform float uFlare;
uniform float uTop;
uniform float uFloor;
uniform float uCharge;
varying vec3 vG;
varying vec4 vInst;
${Q}
void main() {
  float gate = vInst.y;
  float kind = vInst.z;
  // charge band: climbs from the floor, over the lintel, up the sky beam.
  // uCharge is integrated on the CPU (faster when near) so it never jumps.
  float by = mod(uCharge + gate * 7.3, 36.0) + uFloor - 2.0;
  float dy = (vG.y - by) / 0.9;
  float b = vInst.x * (1.0 + 1.3 * exp(-dy * dy));
  if (kind > 0.5 && kind < 1.5) {
    // rung ticks fill bottom-to-top like a meter, then reset
    float ph = fract(uT * 0.3 + gate * 0.27) * 1.4 - vInst.w;
    b *= 0.3 + 1.7 * smoothstep(0.0, 0.05, ph) * (1.0 - smoothstep(0.25, 0.4, ph));
  } else if (kind > 1.5 && kind < 2.5) {
    // tier bars pulse in sequence
    float s = 0.5 + 0.5 * sin(uT * 2.6 - vInst.w * 1.2 - gate * 0.8);
    b *= 0.7 + 0.6 * s * s * s;
  } else if (kind > 3.5) {
    // sky beam fades into the dark above the gate
    b *= exp(-max(vG.y - uTop, 0.0) * 0.085);
  }
  b *= uI * (1.0 + 1.8 * uFlare);
  vec3 col = mix(uTint, vec3(1.0), clamp(b * 0.14, 0.0, 0.45)) * b;
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,Lo=`
attribute vec2 aL; // gate-local coords: (x, y) on curtains, (x, z) on floor pools
attribute vec2 aK; // gate index, kind (0 curtain, 1 floor pool)
varying vec2 vL;
varying vec2 vK;
${Z}
void main() {
  vL = aL;
  vK = aK;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`,Ro=`
uniform vec3 uTint;
uniform vec3 uGain;
uniform float uT;
uniform float uI;
uniform float uFlare;
uniform float uHW;
uniform float uTop;
uniform float uFloor;
uniform float uCh;
varying vec2 vL;
varying vec2 vK;
${Q}
float h1(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
void main() {
  float gate = vK.x;
  float gain = gate < 0.5 ? uGain.x : (gate < 1.5 ? uGain.y : uGain.z);
  vec3 col = vec3(0.0);
  if (vK.y < 0.5) {
    // light curtain filling the opening (chamfered top corners clipped)
    float x = vL.x;
    float y = vL.y;
    float cut = abs(x) + y - (uHW + uTop - uCh) + 0.15;
    if (cut > 0.0) discard;
    float dEdge = min(min(uHW - abs(x), uTop - y), -cut * 0.7071);
    float edge = exp(-max(dEdge, 0.0) * 2.4);
    // far away the 0.25-unit scanlines drop below a few pixels: fade them to
    // their mean (~0.2) instead of letting them moire
    float farK = smoothstep(22.0, 50.0, vFogDepth);
    float lines = pow(max(0.5 + 0.5 * sin(y * 25.0 - uT * 2.0), 0.0), 8.0);
    lines = mix(lines, 0.2, farK);
    float span = uTop - uFloor + 8.0;
    float sy = y - (mod(uT * 3.0 + gate * 5.1, span) + uFloor - 4.0);
    float sweep = exp(-sy * sy * 0.8);
    // shimmer: thin flickering vertical threads
    float streak = step(0.8, h1(floor(x * 6.0) + 17.0 * gate + floor(uT * 6.0) * 0.618))
      * (1.0 - smoothstep(0.04, 0.12, abs(fract(x * 6.0) - 0.5))) * (1.0 - farK);
    float rise = 1.0 - 0.6 * smoothstep(uFloor, uTop, y);
    float a = (0.012 + 0.03 * lines) * rise
      + sweep * (0.06 + 0.16 * lines)
      + edge * 0.14
      + streak * 0.05 * (1.0 + 2.0 * sweep);
    // the screen-filling plane dissolves as you reach it instead of washing the view
    float reach = smoothstep(1.0, 10.0, vFogDepth);
    col = mix(uTint, vec3(1.0), sweep * 0.3) * a * reach;
  } else {
    // floor light pool: bands stream toward and into the gate
    float x = vL.x;
    float z = vL.y;
    float fx = 1.0 - smoothstep(uHW * 0.6, uHW + 0.8, abs(x));
    float fz = exp(-max(z, 0.0) * 0.32) * smoothstep(-2.5, 0.0, z);
    float flow = pow(max(0.5 + 0.5 * sin((z + uT * 2.5) * 3.0), 0.0), 10.0);
    col = uTint * fx * fz * (0.07 + 0.16 * flow);
  }
  col *= gain * uI * (1.0 + 1.5 * uFlare);
  gl_FragColor = vec4(col * fogVis(), 1.0);
}
`,zo=`
uniform float uT;
uniform float uI;
uniform float uFlare;
uniform float uDpr;
attribute vec4 aData; // speed, phase, size, hot
attribute vec3 aDir;
attribute float aGain;
varying float vA;
varying float vHot;
${Z}
void main() {
  float life = fract(uT * aData.x + aData.y);
  vec3 p = position + aDir * life;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vFogDepth = -mvPosition.z;
  vA = sin(3.14159265 * life) * aGain * (0.3 + 0.7 * uI) * (1.0 + uFlare);
  vHot = aData.w;
  gl_PointSize = clamp(aData.z * uDpr * (420.0 / max(-mvPosition.z, 0.5)), 1.0, 48.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,Bo=`
uniform vec3 uTint;
varying float vA;
varying float vHot;
${Q}
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r2 = dot(q, q);
  if (r2 > 0.25) discard;
  float core = exp(-r2 * 40.0);
  float glow = exp(-r2 * 10.0) * 0.35;
  vec3 c = mix(uTint, vec3(1.0), vHot * core) * (core * (1.1 + vHot * 1.6) + glow);
  gl_FragColor = vec4(c * vA * fogVis(), 1.0);
}
`;function Vo(e,t){let n=e*.4142;return[[-4.5-e,t],[-4.5-e,Mo-No+n],[-2.9-n,Mo+e],[jo-No+n,Mo+e],[jo+e,Mo-No+n],[jo+e,t]]}function Ho(e,t){let n=e===`mobile`,r=[],i=(e,t,n,i,a,o,s,c=0)=>r.push({a:e,b:t,sx:n,sz:i,bright:a,gate:o,kind:s,w:c});ko.forEach((e,r)=>{let a=Ao[r],o=Vo(0,t);for(let t=0;t<o.length-1;t++){let[n,s]=o[t],[c,l]=o[t+1];i([e+n,s,Po],[e+c,l,Po],.11,.11,1.45*a,r,0),i([e+n,s,-.5],[e+c,l,-.5],.07,.07,.8*a,r,0)}let s=[...o,[-4.5,-1],[jo,-1]];for(let[n,o]of s){let s=Math.max(o,t+.05);i([e+n,s,Po],[e+n,s,-.5],.06,.06,.75*a,r,0)}let c=Vo(.75,t+.5),l=1.1,u=n?.9:.45;for(let t=0;t<c.length-1;t++){let[n,o]=c[t],[s,d]=c[t+1],f=Math.hypot(s-n,d-o),p=(s-n)/f,m=(d-o)/f;for(let t=0;t<f-.2;t+=l+u){let s=Math.min(t+l,f);i([e+n+p*t,o+m*t,Po],[e+n+p*s,o+m*s,Po],.05,.05,.7*a,r,0)}}let d=n?1.8:.9;for(let n=t+1.2;n<Mo-No-.3;n+=d){let o=(n-t)/(Mo-t);for(let t of[-1,1])i([e+t*4.7,n,Po],[e+t*5.0600000000000005,n,Po],.05,.05,1.1*a,r,1,o)}i([e-(jo-No),Mo-.7,Po],[e+(jo-No),Mo-.7,Po],.04,.04,.9*a,r,0);for(let t=0;t<=r;t++){let n=9.5+t*.62;i([e-1.7,n,Po],[e+1.7,n,Po],.2,.2,1.9+1.1*a,r,2,t)}for(let n of[-1,1])i([e+n*jo,t+.06,-1.3],[e+n*jo,t+.06,1.3],.1,.1,1.1*a,r,0);let f=t+.05;for(let[t,n,o]of[[1.5,1,1.7],[2.5,.8,1.1],[3.7,.6,.6]])i([e-jo*n,f,t],[e+jo*n,f,t],.02,.2,o*a,r,3);for(let t of[-1,1])i([e+t*4.8,f,1.1],[e+t*4.8,f,7.5],.12,.02,.8*a,r,3);i([e,9.5+(r+1)*.62+.3,0],[e,54,0],.05,.05,1.5*a,r,4)});let a=new ie(1,1,1),o=new Float32Array(r.length*4),s=new oe,c=new D(0,1,0),l=new D,u=new M({uniforms:{...Y,uTint:{value:new N},uT:{value:0},uI:{value:.35},uFlare:{value:0},uTop:{value:Mo},uFloor:{value:t},uCharge:{value:0}},vertexShader:Fo,fragmentShader:Io,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1}),d=new F(a,u,r.length);return r.forEach((e,t)=>{let n=e.b[0]-e.a[0],r=e.b[1]-e.a[1],i=e.b[2]-e.a[2],a=Math.hypot(n,r,i);l.set(n/a,r/a,i/a),s.position.set((e.a[0]+e.b[0])/2,(e.a[1]+e.b[1])/2,(e.a[2]+e.b[2])/2),s.quaternion.setFromUnitVectors(c,l),s.scale.set(e.sx,a,e.sz),s.updateMatrix(),d.setMatrixAt(t,s.matrix),o.set([e.bright,e.gate,e.kind,e.w],t*4)}),a.setAttribute(`aInst`,new I(o,4)),d.instanceMatrix.needsUpdate=!0,d.computeBoundingSphere(),{mesh:d,geo:a,mat:u,count:r.length}}function Uo(e){let t=[],n=[],r=[],i=[],a=(e,a,o,s)=>{let c=t.length/3;for(let i=0;i<4;i++)t.push(...e[i]),n.push(...a[i]),r.push(o,s);i.push(c,c+1,c+2,c,c+2,c+3)};ko.forEach((t,n)=>{let r=t-jo+.1,i=t+jo-.1,o=Mo-.1;a([[r,e,0],[i,e,0],[i,o,0],[r,o,0]],[[r-t,e],[i-t,e],[i-t,o],[r-t,o]],n,0);let s=t-jo-1,c=t+jo+1,l=-2.5,u=e+.03;a([[s,u,9],[c,u,9],[c,u,l],[s,u,l]],[[s-t,9],[c-t,9],[c-t,l],[s-t,l]],n,1)});let o=new R;return o.setAttribute(`position`,new V(t,3)),o.setAttribute(`aL`,new V(n,2)),o.setAttribute(`aK`,new V(r,2)),o.setIndex(i),{geo:o,mat:new M({uniforms:{...Y,uTint:{value:new N},uGain:{value:new D(.5,1,.5)},uT:{value:0},uI:{value:.35},uFlare:{value:0},uHW:{value:jo},uTop:{value:Mo},uFloor:{value:e},uCh:{value:No}},vertexShader:Lo,fragmentShader:Ro,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,side:2,fog:!1})}}function Wo(e,t){let n=Re(111111),r=new Float32Array(e*3),i=new Float32Array(e*3),a=new Float32Array(e*4),o=new Float32Array(e);for(let s=0;s<e;s++){let e=n(),c=e<.5?1:e<.75?0:2,l=ko[c];o[s]=c===1?1:.5,n()<.33?(r.set([l+(n()-.5)*jo*1.4,t+.15+n()*.8,8.5+n()*2],s*3),i.set([0,n()*.6,-(10+n()*3)],s*3),a.set([.12+n()*.13,n(),.06+n()*.06,+(n()<.25)],s*4)):(r.set([l+(n()-.5)*2*jo*.9,t+n()*4,(n()-.5)*2.5],s*3),i.set([(n()-.5)*1.2,8+n()*12,(n()-.5)*1],s*3),a.set([.05+n()*.09,n(),.05+n()*.08,+(n()<.15)],s*4))}let s=new R;return s.setAttribute(`position`,new V(r,3)),s.setAttribute(`aDir`,new V(i,3)),s.setAttribute(`aData`,new V(a,4)),s.setAttribute(`aGain`,new V(o,1)),s}function Go(e,t){let n=[],r=[],i=new N(e),a=(e,t,a,o,s,c,l)=>{n.push(e,t,a,o,s,c),r.push(i.r*l,i.g*l,i.b*l,i.r*l,i.g*l,i.b*l)},o=13.2;for(let e=-21;e<21;e+=1.7)a(e,o,0,Math.min(e+1.2,21),o,0,.6);for(let e of[-1,1])a(e*21,o,0,e*21,o-.8,0,.8);ko.forEach((e,n)=>{let r=n===1?1:.6,i=9.5+n*.62+.1;for(let t of[-1,1])a(e+t*1.7,o,0,e+t*1.7,i,Po,.45*r);let s=t+.04;for(let t of[-1,1])a(e+t*5.5,s,Po,e+t*5.5,s,9.5,.4*r);a(e-jo-1,s,9.5,e+jo+1,s,9.5,.4*r)});let s=new R;return s.setAttribute(`position`,new V(n,3)),s.setAttribute(`color`,new V(r,3)),s}function Ko(e,t,n){let r=new N(t),i=Ho(e,n);i.mat.uniforms.uTint.value=r;let a=Uo(n);a.mat.uniforms.uTint.value=r;let o=Wo(e===`mobile`?200:420,n),s=new M({uniforms:{...Y,uTint:{value:r},uT:{value:0},uI:{value:.35},uFlare:{value:0}},vertexShader:zo,fragmentShader:Bo,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1}),c=Go(t,n),l=new S({vertexColors:!0,transparent:!0,depthWrite:!1,blending:2,toneMapped:!1});return{beams:i,curtains:a,moteGeo:o,moteMat:s,hudGeo:c,hudMat:l,dispose(){i.mesh.dispose(),i.geo.dispose(),i.mat.dispose(),a.geo.dispose(),a.mat.dispose(),o.dispose(),s.dispose(),c.dispose(),l.dispose()}}}function qo({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=J.FLOOR_Y-t[1],o=(0,G.useMemo)(()=>Ko(r,n,a),[r,n,a]);(0,G.useEffect)(()=>()=>o.dispose(),[o]);let s=(0,G.useRef)(0),c=(0,G.useRef)(X.time);return d(n=>{let r=i.current;if(!r)return;if(!Ae(e)){r.visible=!1;return}r.visible=!0;let a=ke(e),l=X.time,u=.35+.65*a,d=Math.min(Math.max(l-c.current,0),.1);c.current=l,s.current=(s.current+d*(4+4*u))%36;let f=n.camera.position.z-t[2],p=Math.exp(-(f*f)/40),m=o.beams.mat.uniforms;m.uT.value=l,m.uI.value=u,m.uFlare.value=p,m.uCharge.value=s.current;let h=o.curtains.mat.uniforms;h.uT.value=l,h.uI.value=u,h.uFlare.value=p;let g=o.moteMat.uniforms;g.uT.value=l,g.uI.value=u,g.uFlare.value=p,o.hudMat.color.setScalar(u*(1+p))}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`primitive`,{object:o.beams.mesh}),(0,$.jsx)(`mesh`,{geometry:o.curtains.geo,material:o.curtains.mat}),(0,$.jsx)(`points`,{geometry:o.moteGeo,material:o.moteMat,frustumCulled:!1}),(0,$.jsx)(`lineSegments`,{geometry:o.hudGeo,material:o.hudMat})]})}var Jo=Math.PI*2,Yo=26,Xo=60,Zo=6,Qo=`
float fogVisK(float k) {
  float f = uFogDensity * k * vFogDepth;
  return exp(-f * f);
}
`,$o=`
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
${Z}
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  vP = position;
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,es=`
uniform float uT;
uniform float uI;
uniform vec3 uColor;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
${Q}
${Qo}
void main() {
  float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
  float plasma = sin(vP.x * 1.7 + uT * 1.1) * sin(vP.y * 2.3 - uT * 0.9) * sin(vP.z * 1.9 + uT * 1.3);
  vec3 rim = uColor * (1.5 + 0.5 * plasma);
  vec3 heart = vec3(1.0) * (2.5 + 0.35 * plasma);
  vec3 col = mix(rim, heart, pow(facing, 1.3)) + uColor * pow(1.0 - facing, 3.0) * 1.2;
  gl_FragColor = vec4(col * uI * fogVisK(0.45), 1.0);
}
`,ts=`
varying vec2 vQ;
${Z}
void main() {
  vQ = uv * 2.0 - 1.0;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vFogDepth = -mv.z;
}
`,ns=`
uniform float uT;
uniform float uP;
uniform float uI;
uniform vec3 uColor;
varying vec2 vQ;
${Q}
${Qo}
void main() {
  float r = length(vQ);
  // haze grows from a small aura to most of the frame, peak kept under bloom-white
  float reach = mix(0.32, 1.0, uP);
  float haze = pow(max(1.0 - r / reach, 0.0), 2.6) * mix(0.26, 0.95, uP * uP);
  float halo = exp(-r * r * mix(110.0, 60.0, uP)) * mix(1.5, 2.3, uP);
  float rd = (r - mix(0.13, 0.15, uP)) * 70.0;
  float ring = exp(-rd * rd) * 0.8;
  float streak = exp(-abs(vQ.y) * mix(220.0, 120.0, uP))
    * pow(max(1.0 - abs(vQ.x), 0.0), 2.0) * mix(0.55, 1.2, uP);
  float pulse = 0.93 + 0.07 * sin(uT * 2.7);
  vec3 col = mix(uColor, vec3(1.0), 0.3) * haze
    + mix(uColor, vec3(1.0), 0.6) * halo * pulse
    + uColor * 1.4 * ring
    + mix(uColor, vec3(1.0), 0.25) * streak;
  gl_FragColor = vec4(col * uI * fogVisK(0.45), 1.0);
}
`,rs=`
uniform float uT;
uniform float uP;
uniform float uDpr;
uniform vec2 uRes;
attribute vec4 aRay; // angle, seed, length factor, half-width
varying vec2 vR;
varying float vK;
${Z}
void main() {
  float hero = step(1.2, aRay.z);
  float fl = 0.62 + 0.38 * sin(uT * (0.9 + aRay.y * 2.3) + aRay.y * 40.0)
    * sin(uT * (0.37 + aRay.y) + aRay.y * 13.0);
  fl = mix(fl, 0.9 + 0.1 * sin(uT * 1.7 + aRay.x * 3.0), hero);
  float ang = aRay.x + uT * mix(0.03, 0.012, hero);
  float len = mix(7.0, 36.0, uP) * aRay.z * fl;
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 side = vec2(-dir.y, dir.x);
  // no MSAA in this pipeline: hold every ray at >= ~1.2 device px wide and dim
  // it by the same factor, so thin rays far down the corridor glow steadily
  // instead of crawling as sub-pixel slivers
  float depth = max(-(modelViewMatrix * vec4(position, 1.0)).z, 1.0);
  float px = 2.0 * depth / (projectionMatrix[1][1] * max(uRes.y * uDpr, 360.0));
  float w0 = aRay.w * mix(0.7, 1.0, uP) * (1.0 - 0.85 * uv.x);
  float w = max(w0, 0.6 * px);
  vec2 xy = dir * (1.6 + uv.x * len) + side * (uv.y * w);
  vec4 mv = modelViewMatrix * vec4(position + vec3(xy, 0.0), 1.0);
  gl_Position = projectionMatrix * mv;
  vR = uv;
  vK = mix(mix(0.45, 1.0, fract(aRay.y * 5.3)), 1.0, hero) * fl * (w0 / w);
  vFogDepth = -mv.z;
}
`,is=`
uniform float uI;
uniform vec3 uColor;
varying vec2 vR;
varying float vK;
${Q}
${Qo}
void main() {
  float a = pow(max(1.0 - vR.x, 0.0), 1.8) * max(1.0 - vR.y * vR.y, 0.0) * vK;
  vec3 col = mix(vec3(1.6), uColor * 1.3, smoothstep(0.0, 0.45, vR.x));
  gl_FragColor = vec4(col * a * uI * fogVisK(0.45), 1.0);
}
`,as=`
uniform float uT;
uniform float uI;
uniform float uDpr;
uniform vec3 uColor;
uniform vec3 uDeep;
attribute float aRadius;
attribute float aAngle;
attribute float aSpeed;
attribute float aSeed;
varying vec3 vCol;
varying float vA;
${Z}
void main() {
  float life = fract(uT * aSpeed + aSeed);
  float r = mix(26.0, 4.0, pow(life, 0.72)) * aRadius;
  float ang = aAngle + uT * 0.05 + 16.34 * life * life; // ~2.6 turns on the way in
  float h = (fract(aSeed * 17.31) - 0.5) * (0.15 + 0.05 * r);
  vec4 mv = modelViewMatrix * vec4(position + vec3(cos(ang) * r, h, sin(ang) * r), 1.0);
  gl_Position = projectionMatrix * mv;
  float inner = smoothstep(17.0, 4.0, r);
  float beam = 0.7 + 0.5 * sin(ang + 0.9); // one flank brighter, like Doppler beaming
  vec3 c = mix(uDeep, uColor, smoothstep(26.0, 14.0, r));
  c = mix(c, vec3(1.0), inner * inner * 0.7);
  vCol = c * (0.95 + 2.0 * inner) * beam * uI;
  float ps = (1.8 + 2.6 * inner + 1.6 * fract(aSeed * 7.7)) * uDpr * (60.0 / max(-mv.z, 1.0));
  vA = smoothstep(0.0, 0.06, life) * (1.0 - smoothstep(0.86, 1.0, life)) * clamp(ps, 0.0, 1.0);
  gl_PointSize = clamp(ps, 1.0, 20.0 * uDpr);
  vFogDepth = -mv.z;
}
`,os=`
varying vec3 vCol;
varying float vA;
${Q}
${Qo}
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float d2 = dot(q, q) * 4.0;
  if (d2 > 1.0) discard;
  gl_FragColor = vec4(vCol * exp(-d2 * 3.5) * vA * fogVisK(0.6), 1.0);
}
`,ss=`
uniform float uT;
uniform float uVel;
attribute float aEnd;
attribute vec4 aStreak; // angle, outer radius, speed, seed
varying float vA;
${Z}
void main() {
  float life = fract(uT * aStreak.z + aStreak.w);
  float zHead = mix(74.0, 3.0, life);
  float len = (2.5 + 7.0 * fract(aStreak.w * 9.7)) * (1.0 + 1.5 * clamp(uVel, 0.0, 2.0));
  float z = zHead + aEnd * len;
  float k = clamp(z / 74.0, 0.0, 1.0);
  float r = mix(3.4, aStreak.y, pow(k, 0.6));
  float ang = aStreak.x + z * 0.014;
  vec4 mv = modelViewMatrix * vec4(position + vec3(cos(ang) * r, sin(ang) * r, z), 1.0);
  gl_Position = projectionMatrix * mv;
  vA = (1.0 - aEnd) * smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.82, 1.0, life))
    * smoothstep(4.0, 26.0, -mv.z); // thin out as they brush past the lens
  vFogDepth = -mv.z;
}
`,cs=`
uniform float uP;
uniform float uI;
uniform vec3 uColor;
varying float vA;
${Q}
${Qo}
void main() {
  float show = smoothstep(0.2, 0.95, uP);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.4) * 0.85 * vA * show * uI * fogVisK(0.6), 1.0);
}
`;function ls(e,t){let n=t===`mobile`,r=Re(5346983),i={uT:{value:0},uP:{value:0},uI:{value:.35},uColor:{value:new N(e)},uDeep:{value:new N(`#1f5cff`)}},a=(e,t,n={})=>new M({vertexShader:e,fragmentShader:t,uniforms:{...Y,...i,...n},transparent:!0,depthWrite:!1,blending:2,toneMapped:!1,fog:!1}),o=new se(3,n?40:64,n?28:40),s=new ee(Yo*2,Yo*2),c=new Float32Array(Xo*4*3),l=new Float32Array(Xo*4*2),u=new Float32Array(Xo*4*4),d=new Uint16Array(Xo*6),f=[0,-1,0,1,1,-1,1,1];for(let e=0;e<Xo;e++){let t=e<Zo,n=t?e/Zo*Jo+.26:r()*Jo,i=r(),a=t?1.45:.35+r()*.65,o=t?.22:.05+r()*.09;for(let t=0;t<4;t++){let r=e*4+t;l[r*2]=f[t*2],l[r*2+1]=f[t*2+1],u[r*4]=n,u[r*4+1]=i,u[r*4+2]=a,u[r*4+3]=o}let s=e*4;d.set([s,s+2,s+1,s+2,s+3,s+1],e*6)}let p=new R;p.setAttribute(`position`,new A(c,3)),p.setAttribute(`uv`,new A(l,2)),p.setAttribute(`aRay`,new A(u,4)),p.setIndex(new A(d,1));let m=n?1200:3e3,h=new Float32Array(m),g=new Float32Array(m),_=new Float32Array(m),v=new Float32Array(m);for(let e=0;e<m;e++){let t=Math.floor(r()*3);g[e]=r()<.35?r()*Jo:t/3*Jo+(r()-r())*.9,h[e]=.88+r()*.24,_[e]=.018+r()*.027,v[e]=r()}let y=new R;y.setAttribute(`position`,new A(new Float32Array(m*3),3)),y.setAttribute(`aRadius`,new A(h,1)),y.setAttribute(`aAngle`,new A(g,1)),y.setAttribute(`aSpeed`,new A(_,1)),y.setAttribute(`aSeed`,new A(v,1));let b=n?120:260,x=new Float32Array(b*2),S=new Float32Array(b*2*4);for(let e=0;e<b;e++){let t=r()*Jo,n=5+r()*14,i=.08+r()*.08,a=r();for(let r=0;r<2;r++){let o=e*2+r;x[o]=r,S[o*4]=t,S[o*4+1]=n,S[o*4+2]=i,S[o*4+3]=a}}let C=new R;C.setAttribute(`position`,new A(new Float32Array(b*2*3),3)),C.setAttribute(`aEnd`,new A(x,1)),C.setAttribute(`aStreak`,new A(S,4));let w=a($o,es),T=a(ts,ns),E=a(rs,is);T.depthTest=!1,E.depthTest=!1;let D=a(as,os),O=a(ss,cs),k=[o,s,p,y,C],j=[w,T,E,D,O];return{u:i,coreGeo:o,glowGeo:s,rayGeo:p,discGeo:y,streakGeo:C,coreMat:w,glowMat:T,rayMat:E,discMat:D,streakMat:O,dispose(){for(let e of k)e.dispose();for(let e of j)e.dispose()}}}function us({station:e,position:t,accent:n,tier:r}){let i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(null),s=(0,G.useMemo)(()=>ls(n,r),[n,r]);return(0,G.useEffect)(()=>()=>s.dispose(),[s]),d(({camera:t})=>{let n=i.current;if(!n)return;if(!Ae(e,4.5)){n.visible=!1;return}n.visible=!0;let r=ke(e,2.5),c=X.time,l=s.u;l.uT.value=c,l.uP.value=r,l.uI.value=.35+.65*r**1.4,a.current?.quaternion.copy(t.quaternion),o.current?.scale.setScalar((.85+.15*r)*(1+.03*Math.sin(c*2.7)))}),(0,$.jsxs)(`group`,{ref:i,position:t,children:[(0,$.jsx)(`mesh`,{ref:o,geometry:s.coreGeo,material:s.coreMat}),(0,$.jsx)(`group`,{rotation:[.38,0,.14],children:(0,$.jsx)(`points`,{geometry:s.discGeo,material:s.discMat,frustumCulled:!1})}),(0,$.jsx)(`lineSegments`,{geometry:s.streakGeo,material:s.streakMat,frustumCulled:!1}),(0,$.jsxs)(`group`,{ref:a,children:[(0,$.jsx)(`mesh`,{geometry:s.glowGeo,material:s.glowMat}),(0,$.jsx)(`mesh`,{geometry:s.rayGeo,material:s.rayMat,frustumCulled:!1})]})]})}var ds=J.SIDE_X,fs=[{station:1,C:bt,position:[ds,1,Oe(1)],accent:`#27F2C0`},{station:2,C:Jt,position:[ds,1,Oe(2)],accent:`#7C5CFF`},{station:3,C:Kn,position:[ds+1.6,1,Oe(3)],accent:`#4EA8FF`},{station:4,C:xr,position:[ds,1,Oe(4)],accent:`#FFB36B`},{station:5,C:Kr,position:[ds,1,Oe(5)],accent:`#FF3D7F`},{station:6,C:Ei,position:[ds,1,Oe(6)],accent:`#9AE6FF`},{station:7,C:aa,position:[0,1.5,Oe(7)],accent:`#4EA8FF`},{station:8,C:Sa,position:[0,2,Oe(8)],accent:`#27F2C0`},{station:9,C:eo,position:[0,0,Oe(9)],accent:`#FFB36B`},{station:10,C:Oo,position:[0,0,Oe(10)],accent:`#27F2C0`},{station:11,C:qo,position:[0,0,Oe(11)],accent:`#9AE6FF`},{station:12,C:us,position:[0,2,Oe(12)-40],accent:`#4CF0FF`}];function ps({tier:e}){return(0,$.jsx)($.Fragment,{children:fs.map(({station:t,C:n,position:r,accent:i})=>(0,$.jsx)(n,{station:t,position:r,accent:i,tier:e},t))})}var ms=new N(`#010805`),hs=62,gs=!1,_s=typeof matchMedia<`u`?matchMedia(`(prefers-reduced-motion: reduce)`):null;function vs(){let e=r(e=>e.camera),t=r(e=>e.scene),n=(0,G.useRef)(new D),i=(0,G.useRef)(new D),a=(0,G.useRef)(new D),o=(0,G.useRef)(new N),s=(0,G.useRef)(new N),c=(0,G.useRef)(q.track),l=(0,G.useRef)(0),u=(0,G.useRef)(0);return(0,G.useEffect)(()=>{},[r(e=>e.gl),t,e]),(0,G.useEffect)(()=>{let e=new v(ms.clone(),Y.uFogDensity.value);return t.fog=e,t.background=e.color,()=>{t.fog=null,t.background=null}},[t]),d((r,d)=>{let f=Math.min(d,1/30),p=Y,m=!!_s?.matches;X.reduced=m,X.time+=f*(m?.25:1),p.uTime.value=X.time;let h=g.clamp(q.track,0,J.STATIONS),_=c.current,v=gs;gs=!1,c.current=m||v?h:g.damp(c.current,h,3.4,f);let y=c.current,b=v?0:(y-_)/Math.max(f,1e-4);l.current=v?0:g.damp(l.current,b,6,f);let x=Math.min(Math.abs(l.current),3);X.track=y,X.vel=l.current,p.uTrack.value=y,p.uVel.value=x,p.uFlow.value+=f*(1+x*1.8)*(m?.25:1),p.uDpr.value=r.viewport.dpr,p.uRes.value.set(r.size.width,r.size.height);let S=r.size.width/Math.max(1,r.size.height);X.aspect=S;let C=S<.9,w=C?25:J.D,T=-y*J.SP+w,E=+!m,D=Math.sin(y*1.3+X.time*.12)*1.3*E,O=1.7+Math.sin(y*.9+1+X.time*.17)*.55*E;n.current.set(D+q.pointerX*1.1,O-q.pointerY*.7,T),i.current.set(D*.35,O*.6-.3,T-40);let k=Math.round(y);if(k>=1&&k<=6){let e=Math.exp(-(((y-k)/.62)**2));a.current.set(C?J.SIDE_X:2.6,C?-2.2:1,Oe(k)),i.current.lerp(a.current,e)}e.position.copy(n.current),e.lookAt(i.current),u.current=g.damp(u.current,(Math.sin(y*.7)*.03-l.current*.02)*E,4,f),e.rotateZ(u.current);let ee=hs+(C?8:0)+x*5*E;Math.abs(e.fov-ee)>.02&&(e.fov=g.damp(e.fov,ee,5,f),e.updateProjectionMatrix()),o.current.set(q.divisionColor),p.uAccent.value.lerp(o.current,m?1:1-.004**f),s.current.copy(ms).lerp(p.uAccent.value,.012),p.uFogColor.value.copy(s.current);let A=.0105-g.smoothstep(y,10.2,11.8)*.0048;p.uFogDensity.value=A;let j=t.fog;j&&(j.color.copy(s.current),j.density=A)},-1),null}var ys=new H(5e-4,3e-4);function bs({tier:e}){let t=(0,G.useMemo)(()=>new l({offset:ys.clone(),radialModulation:!0,modulationOffset:.35}),[]);return(0,G.useEffect)(()=>()=>t.dispose(),[t]),d(()=>{let e=1+Y.uVel.value*2.2;t.offset.set(ys.x*e,ys.y*e)}),(0,$.jsxs)(s,{multisampling:0,children:[(0,$.jsx)(i,{mipmapBlur:!0,intensity:1,luminanceThreshold:.5,luminanceSmoothing:.4,radius:.68}),e===`desktop`?(0,$.jsx)(`primitive`,{object:t,dispose:null}):(0,$.jsx)($.Fragment,{}),e===`desktop`?(0,$.jsx)(u,{premultiply:!0,opacity:.35}):(0,$.jsx)($.Fragment,{}),(0,$.jsx)(c,{eskil:!1,offset:.24,darkness:.82})]})}function xs({webgl:e=!0}){let[t,r]=(0,G.useState)(!1),[i,a]=(0,G.useState)(!1),[o,s]=(0,G.useState)(!0),c=(0,G.useMemo)(()=>typeof window<`u`&&(window.innerWidth<760||matchMedia(`(hover: none)`).matches)?`mobile`:`desktop`,[]),[l,u]=(0,G.useState)(c===`mobile`?[1,1.25]:[1,1.5]);return(0,G.useEffect)(()=>{if(!e)return;let t=document.querySelector(`main.act2`);if(!t)return;let n=new IntersectionObserver(([e])=>{e.isIntersecting&&r(!0)},{rootMargin:`120% 0px 120% 0px`});return n.observe(t),()=>n.disconnect()},[e]),(0,G.useEffect)(()=>{if(!t)return;let e=document.querySelector(`.portal`),n=q.inAct2<=0,r=!1;s(n);let i=0,o=()=>{i=requestAnimationFrame(o);let t=q.inAct2<=0;if(t!==n&&(n=t,s(t)),e){let t=window.innerHeight,n=e.getBoundingClientRect(),i=n.top<-t*.25&&n.bottom>t;i!==r&&(r=i,a(i))}};return i=requestAnimationFrame(o),()=>cancelAnimationFrame(i)},[t]),e?(0,$.jsx)(`div`,{className:`lattice-fix${i?` is-covered`:``}`,"aria-hidden":`true`,children:t&&(0,$.jsxs)(n,{gl:{alpha:!1,antialias:!1,stencil:!1,powerPreference:`high-performance`},dpr:l,flat:!0,camera:{fov:hs,near:.3,far:1300,position:[0,1.7,J.D]},frameloop:i||o?`never`:`always`,children:[(0,$.jsx)(p,{onDecline:()=>u(1),flipflops:2}),(0,$.jsx)(vs,{}),(0,$.jsx)(Qe,{}),(0,$.jsx)(Ze,{}),(0,$.jsx)(Ve,{tier:c}),(0,$.jsx)(Ke,{tier:c}),(0,$.jsx)(ps,{tier:c}),(0,$.jsx)(bs,{tier:c})]})}):null}var Ss=`ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+=<>/`,Cs=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function ws(e,t=.3){let[n,r]=(0,G.useState)(!1);return(0,G.useEffect)(()=>{let i=e.current;if(!i||n)return;let a=new IntersectionObserver(([e])=>{e.isIntersecting&&(r(!0),a.disconnect())},{threshold:t});return a.observe(i),()=>a.disconnect()},[e,n,t]),n}function Ts({children:e,as:t=`h2`,className:n,play:r,stagger:i=34,scramble:a=420}){let o=(0,G.useRef)(null),s=ws(o),c=r===void 0?s:r!==!1,l=(0,G.useMemo)(()=>e.split(` `),[e]);return(0,G.useEffect)(()=>{let e=o.current;if(!e)return;let t=Array.from(e.querySelectorAll(`.dc`));if(!c&&r===void 0&&!Cs()){t.forEach(e=>{e.classList.remove(`on`),e.setAttribute(`data-g`,Ss[Math.random()*44|0])});return}if(!c||Cs()){t.forEach(e=>{e.removeAttribute(`data-g`),e.classList.add(`on`)});return}t.forEach(e=>{e.classList.remove(`on`),e.setAttribute(`data-g`,Ss[Math.random()*44|0])});let n=performance.now(),s=t.map((e,t)=>t*i+a+Math.random()*180),l=0,u=0,d=e=>{let r=e-n,a=e-u>48;a&&(u=e);let o=0;t.forEach((e,t)=>{e.classList.contains(`on`)||(r>=s[t]?(e.removeAttribute(`data-g`),e.classList.add(`on`)):(o++,a&&r>t*i*.35&&e.setAttribute(`data-g`,Ss[Math.random()*44|0])))}),o&&(l=requestAnimationFrame(d))};return l=requestAnimationFrame(d),()=>cancelAnimationFrame(l)},[c,r,i,a,e]),(0,G.createElement)(t,{ref:o,className:`decode ${n??``}`},(0,$.jsx)(`span`,{className:`sr-only`,children:e}),l.map((e,t)=>(0,$.jsxs)(G.Fragment,{children:[(0,$.jsx)(`span`,{className:`dw`,"aria-hidden":`true`,children:Array.from(e).map((e,t)=>(0,$.jsx)(`span`,{className:`dc`,children:e},t))}),t<l.length-1?` `:null]},t)))}function Es({lines:e,className:t}){let n=(0,G.useRef)(null),r=ws(n,.2),[i,a]=(0,G.useState)(()=>e.map(()=>``)),[o,s]=(0,G.useState)(!1);return(0,G.useEffect)(()=>{if(!r)return;if(Cs()){a(e),s(!0);return}let t=0,n=0,i=0,o=()=>{if(t>=e.length){s(!0);return}n++;let r=t,c=e[t].slice(0,n);a(e=>{let t=e.slice();return t[r]=c,t}),n>=e[t].length?(t++,n=0,i=window.setTimeout(o,260)):i=window.setTimeout(o,18+Math.random()*30)};return i=window.setTimeout(o,200),()=>window.clearTimeout(i)},[r,e]),(0,$.jsxs)(`div`,{className:`term ${t??``}`,ref:n,children:[(0,$.jsx)(`span`,{className:`sr-only`,children:e.join(`. `)}),i.map((t,n)=>(0,$.jsxs)(`p`,{className:`term-line`,"aria-hidden":`true`,"data-empty":t.length===0,"data-live":!o&&t.length>0&&t.length<e[n].length,children:[(0,$.jsx)(`span`,{className:`term-prompt`,children:`>`}),` `,t]},n)),(0,$.jsx)(`span`,{className:`term-cursor${o?` idle`:``}`,"aria-hidden":`true`})]})}W.registerPlugin(U);var Ds=K.capabilities;function Os(){let e=(0,G.useRef)(null),t=(0,G.useRef)([]),[n,r]=(0,G.useState)(0),[i,a]=(0,G.useState)(0);return(0,G.useEffect)(()=>{let n=e.current;if(!n)return;let i=Ds.length,o=0,s=U.create({trigger:n,start:`top top`,end:`bottom bottom`,scrub:!0,onEnter:()=>a(e=>e+1),onEnterBack:()=>a(e=>e+1),onUpdate:e=>{let n=e.progress*(i-1);q.galleryProgress=e.progress,t.current.forEach((e,t)=>{if(!e)return;let r=t-n,i=Math.max(0,1-Math.abs(r)*1.25)**2;e.style.setProperty(`--off`,r.toFixed(3)),e.style.setProperty(`--foc`,i.toFixed(3))});let s=Math.max(0,Math.min(i-1,Math.round(n)));q.divisionColor=Ds[s].a,q.hudLabel=Ds[s].tag,s!==o&&(o=s,r(s),a(e=>e+1))}});return()=>s.kill()},[]),(0,$.jsx)(`section`,{className:`divisions`,ref:e,"aria-label":`What we build`,"data-division":Ds[n].tag,"data-accent":Ds[n].a,children:(0,$.jsxs)(`div`,{className:`dv-stage`,children:[Ds.map((e,r)=>(0,$.jsxs)(`article`,{className:`dv-panel`,ref:e=>{t.current[r]=e},"data-on":r===n,style:{"--cap-a":e.a,"--foc":+(r===0)},children:[(0,$.jsxs)(`p`,{className:`dv-path`,children:[(0,$.jsx)(`span`,{className:`dv-path-no`,children:e.no}),(0,$.jsx)(`span`,{children:e.tag})]}),(0,$.jsx)(Ts,{as:`h3`,className:`dv-title`,play:r===n&&i>0?i:!1,stagger:26,scramble:260,children:e.title}),(0,$.jsx)(`p`,{className:`dv-blurb`,children:e.blurb}),(0,$.jsx)(`ul`,{className:`dv-specs`,children:e.bullets.map(e=>(0,$.jsx)(`li`,{children:e},e))})]},e.id)),(0,$.jsx)(`nav`,{className:`dv-index`,"aria-hidden":`true`,children:Ds.map((e,t)=>(0,$.jsxs)(`span`,{className:`dv-seg`,"data-on":t===n,"data-past":t<n,style:{"--cap-a":e.a},children:[(0,$.jsx)(`i`,{children:e.no}),(0,$.jsx)(`b`,{children:e.title})]},e.id))})]})})}var ks={portal:{kicker:`END OF THE LATTICE · YOUR MOVE`,title:[`Get your AI`,`into production.`],body:`Tell us the work you keep doing by hand. We’ll wire the voice, the agents and the automations that make it run itself. Then we’ll keep them alive. First door: a fixed-fee Signal Audit, yours to keep.`,button:`Book a 15-minute call`,email:`hanfluxai@gmail.com`,socials:[{label:`Legal`,href:`/legal`},{label:`Privacy`,href:`/privacy`},{label:`Terms`,href:`/terms`}]}};W.registerPlugin(U,de);var As=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function js({children:e,as:t=`h2`,className:n,start:r=`top 84%`,stagger:i=.018,duration:a=.9,y:o=`110%`,once:s=!0}){let c=(0,G.useRef)(null);return(0,G.useEffect)(()=>{let e=c.current;if(!e||(e.style.opacity=`1`,As()))return;let t=null,n=W.context(()=>{t=new de(e,{type:`lines,chars`,linesClass:`kline`,charsClass:`kchar`,autoSplit:!0}),W.set(e,{opacity:1}),W.from(t.chars,{yPercent:parseFloat(o),rotateX:-70,opacity:0,transformOrigin:`50% 100% -20px`,duration:a,ease:`power3.out`,stagger:i,scrollTrigger:{trigger:e,start:r,once:s}})},e);return()=>{t?.revert(),n.revert()}},[]),(0,G.createElement)(t,{ref:c,className:n,style:{opacity:0,perspective:600}},e)}function Ms({children:e,as:t=`button`,className:n,strength:r=.4,radius:i=90,...a}){let o=(0,G.useRef)(null);return(0,G.useEffect)(()=>{let e=o.current;if(!e||As()||matchMedia(`(hover: none)`).matches)return;let t=W.quickTo(e,`x`,{duration:.6,ease:`power3.out`}),n=W.quickTo(e,`y`,{duration:.6,ease:`power3.out`}),a=a=>{let o=e.getBoundingClientRect(),s=o.left+o.width/2,c=o.top+o.height/2,l=a.clientX-s,u=a.clientY-c;if(Math.hypot(l,u)>i+Math.max(o.width,o.height)/2){t(0),n(0);return}t(l*r),n(u*r)},s=()=>{t(0),n(0)};return window.addEventListener(`pointermove`,a,{passive:!0}),e.addEventListener(`pointerleave`,s),()=>{window.removeEventListener(`pointermove`,a),e.removeEventListener(`pointerleave`,s)}},[i,r]),(0,G.createElement)(t,{ref:o,className:n,"data-hover":``,...a},e)}var Ns={email:`hanfluxai@gmail.com`,phones:[{label:`+91 92346 80000`,href:`tel:+919234680000`},{label:`+91 92346 60000`,href:`tel:+919234660000`}],cal:{url:`https://cal.com/chitraksh-mayank-lhab1f/15min`,link:`chitraksh-mayank-lhab1f/15min`,namespace:`15min`,origin:`https://app.cal.com`},booking:{button:`Book a 15-minute call`,short:`Book a call`,note:`Pick a slot. Free, no prep needed.`}},{namespace:Ps,link:Fs,origin:Is}=Ns.cal,Ls={hideEventTypeDetails:!1,layout:`month_view`},Rs={layout:`month_view`,useSlotsViewOnSmallScreen:`true`},zs=!1;function Bs(){if(zs||typeof window>`u`)return;zs=!0,(function(e,t,n){let r=(e,t)=>{e.q.push(t)},i=e.document;e.Cal=e.Cal||function(){let a=e.Cal,o=arguments;if(a.loaded||=(a.ns={},a.q=a.q||[],i.head.appendChild(i.createElement(`script`)).src=t,!0),o[0]===n){let e=function(){r(e,arguments)},t=o[1];e.q=e.q||[],typeof t==`string`?(a.ns[t]=a.ns[t]||e,r(a.ns[t],o),r(a,[`initNamespace`,t])):r(a,o);return}r(a,o)}})(window,`${Is}/embed/embed.js`,`init`);let e=window.Cal;e(`init`,Ps,{origin:Is}),e.config=e.config||{},e.config.forwardQueryParams=!0,e.ns[Ps](`ui`,Ls)}function Vs(){if(zs||typeof window>`u`)return;let e=window.requestIdleCallback;e?e(Bs,{timeout:4e3}):window.setTimeout(Bs,2500)}function Hs(e){e&&(e.metaKey||e.ctrlKey||e.shiftKey||e.button===1)||(e?.preventDefault(),Bs(),window.Cal.ns[Ps](`modal`,{calLink:Fs,config:Rs}))}var Us={href:Ns.cal.url,target:`_blank`,rel:`noopener noreferrer`,onClick:Hs,onPointerEnter:Bs,onFocus:Bs},Ws=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float fbm(vec2 p){
  float s=0.0, a=0.5;
  for(int i=0;i<5;i++){ s+=a*snoise(p); p*=2.02; a*=0.5; }
  return s;
}
`,Gs=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ks=`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec2  uPointer;   // -1..1
uniform float uIntensity; // 0..1 focus
uniform float uReveal;    // 0..1 entrance wipe
${Ws}
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(1.7, 1.0);
  p += uPointer * 0.16;

  float t = uTime * 0.05;
  // domain warp
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.2, 1.7) - t));
  vec2 r = vec2(fbm(p + 1.4 * q + vec2(1.7, 9.2)), fbm(p + 1.4 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 2.0 * r);

  // weave the three brand hues through the warped field
  vec3 col = mix(uColorA, uColorB, smoothstep(-0.6, 0.8, f));
  col = mix(col, uColorC, smoothstep(0.2, 1.0, length(r) * 0.7));
  col *= 0.55 + 0.65 * uIntensity;

  // filament highlights the bloom catches
  float fil = smoothstep(0.78, 0.95, fbm(p * 2.4 + r * 1.6 - t * 2.0));
  col += fil * (uColorA + uColorC) * 0.5 * (0.4 + uIntensity);

  // vignette + entrance wipe (diagonal)
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  float wipe = smoothstep(uReveal * 1.6 - 0.3, uReveal * 1.6, (uv.x + uv.y) * 0.5 + 0.0);
  float a = vig * mix(0.0, 1.0, uReveal) * (0.85);
  // grain
  float g = (fract(sin(dot(uv * uTime, vec2(12.99, 78.23))) * 43758.5) - 0.5) * 0.04;
  gl_FragColor = vec4(col + g, a * (0.6 + 0.4 * uReveal));
}
`,qs=f({uTime:0,uColorA:new N(`#27f2c0`),uColorB:new N(`#0a1c2e`),uColorC:new N(`#7c5cff`),uPointer:new H(0,0),uIntensity:1,uReveal:0},Gs,Ks),Js=`
varying vec2 vUv;
uniform float uTime;
uniform float uHover;   // 0..1 damped
uniform float uReveal;  // 0..1
void main(){
  vUv = uv;
  vec3 pos = position;
  // a gentle bulge toward the viewer on hover + a breathing wobble
  float d = distance(uv, vec2(0.5));
  pos.z += uHover * (0.18 * (0.5 - d)) + sin(uTime * 1.2 + uv.x * 6.0) * 0.012 * uHover;
  // rise-in on reveal
  pos.y += (1.0 - uReveal) * -0.35;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,Ys=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform float uHover;     // 0..1
uniform vec2  uPointer;   // 0..1 local within the tile
uniform float uReveal;    // 0..1
uniform vec3  uTint;
uniform float uHasTex;    // 1 = sample texture, 0 = procedural tint only
${Ws}
void main(){
  vec2 uv = vUv;
  // pointer-anchored ripple
  vec2 dir = uv - uPointer;
  float dist = length(dir);
  float ripple = sin(dist * 22.0 - uTime * 3.5) * 0.012 * uHover * smoothstep(0.6, 0.0, dist);
  uv += normalize(dir + 1e-4) * ripple;

  // chromatic RGB-shift, strongest near the cursor, scaled by hover
  float amt = (0.006 + 0.02 * uHover) * (0.5 + 0.5 * smoothstep(0.7, 0.0, dist));
  vec2 off = normalize(dir + 1e-4) * amt;

  vec3 col;
  if(uHasTex > 0.5){
    float r = texture2D(uTex, uv + off).r;
    float g = texture2D(uTex, uv).g;
    float b = texture2D(uTex, uv - off).b;
    col = vec3(r, g, b);
  } else {
    // procedural fallback so a tile is never blank before its image loads
    float n = fbm(uv * 3.0 + uTime * 0.05);
    col = mix(uTint * 0.25, uTint, smoothstep(-0.4, 0.8, n));
    col += smoothstep(0.7, 1.0, fbm(uv * 6.0 - uTime * 0.1)) * uTint;
  }

  // hover lift + scanline shimmer
  col += uHover * 0.06;
  col *= 1.0 - 0.05 * sin(uv.y * 900.0) * uHover;

  // edge vignette so tiles sit in the dark
  float vig = smoothstep(1.15, 0.35, length(uv - 0.5));
  // reveal: a soft vertical wipe
  float wipe = smoothstep(uReveal - 0.25, uReveal + 0.05, uv.y * 0.5 + 0.5);
  float a = vig * uReveal;
  gl_FragColor = vec4(col * (0.85 + 0.15 * vig), a);
}
`,Xs=f({uTex:null,uTime:0,uHover:0,uPointer:new H(.5,.5),uReveal:0,uTint:new N(`#27f2c0`),uHasTex:0},Js,Ys),Zs=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Qs=`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec2  uPointer;  // -1..1
uniform float uProgress; // 0..1 how "open" the portal is
uniform float uAspect;
${Ws}
void main(){
  vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0);
  uv -= uPointer * 0.05;
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // tunnel coordinates: depth rushes toward the eye
  float depth = 0.30 / (r + 0.04) + uTime * 0.55;
  // Sample the swirl on a RING (cos a, sin a) so the noise is periodic in the
  // angle. Feeding a/PI straight in seams along the -x axis (a hard horizontal
  // line from centre to the left edge). cos/sin wrap seamlessly at ±PI.
  vec2 ring = vec2(cos(a), sin(a));
  float n = fbm(ring * 1.7 + vec2(0.0, depth) + vec2(0.0, uTime * 0.2));
  n += 0.5 * fbm(ring * 3.4 + vec2(0.0, depth * 1.6) - vec2(0.0, uTime * 0.35));

  // concentric rushing rings
  float rings = 0.5 + 0.5 * sin(depth * 6.2831 + n * 3.0);
  vec3 col = mix(uColorB * 0.15, uColorA, smoothstep(0.2, 0.95, rings * (0.6 + 0.5 * n)));
  col = mix(col, uColorC, smoothstep(0.4, 1.0, n) * 0.6);

  // hot core glow
  float core = smoothstep(0.55, 0.0, r);
  col += core * (uColorA + uColorC) * (0.6 + 0.8 * uProgress);
  col += pow(core, 3.0) * 1.4;

  // fade the rim to obsidian + entrance
  float edge = smoothstep(1.15, 0.2, r);
  vec3 final = col * edge;
  final = mix(vec3(0.02, 0.025, 0.04), final, smoothstep(0.0, 0.5, uProgress));
  gl_FragColor = vec4(final, 1.0);
}
`;a({FlowFieldMaterial:qs,ImageDistortMaterial:Xs,PortalMaterial:f({uTime:0,uColorA:new N(`#27f2c0`),uColorB:new N(`#05060a`),uColorC:new N(`#7c5cff`),uPointer:new H(0,0),uProgress:0,uAspect:1},Zs,Qs)}),W.registerPlugin(U);var $s=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function ec(){let e=(0,G.useRef)(null),t=(0,G.useRef)(null),{viewport:n,size:i}=r();return d((r,a)=>{let o=Math.min(a,1/30);e.current&&e.current.scale.set(n.width,n.height,1);let s=t.current;if(!s)return;let c=$s();s.uTime+=o,s.uAspect=i.width/i.height,s.uPointer.set(q.pointerX,q.pointerY),c?s.uProgress=q.portalProgress:s.uProgress+=(Math.max(.001,q.portalProgress)-s.uProgress)*.05}),(0,$.jsxs)(`mesh`,{ref:e,children:[(0,$.jsx)(`planeGeometry`,{args:[1,1]}),(0,$.jsx)(`portalMaterial`,{ref:t})]})}function tc(){return(0,$.jsx)(n,{gl:{alpha:!1,antialias:!1,powerPreference:`high-performance`},dpr:[1,1.25],camera:{position:[0,0,2],fov:50},style:{position:`absolute`,inset:0},children:(0,$.jsx)(ec,{})})}function nc(){return(0,$.jsxs)(`svg`,{className:`cal-glyph`,viewBox:`0 0 20 20`,"aria-hidden":`true`,children:[(0,$.jsx)(`rect`,{x:`2.5`,y:`4`,width:`15`,height:`13.5`,rx:`2.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`}),(0,$.jsx)(`path`,{d:`M2.5 8h15M6.5 2.5v3M13.5 2.5v3`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`}),(0,$.jsx)(`rect`,{className:`cal-glyph-day`,x:`11.2`,y:`10.6`,width:`3.6`,height:`3.6`,rx:`0.9`})]})}function rc({webgl:e=!0}){let t=(0,G.useRef)(null),[n,r]=(0,G.useState)(!1);(0,G.useEffect)(()=>{let e=t.current;if(!e)return;let n=U.create({trigger:e,start:`top bottom`,end:`center center`,scrub:!0,onUpdate:e=>{q.portalProgress=e.progress}});return()=>n.kill()},[]),(0,G.useEffect)(()=>{let n=t.current;if(!n)return;let i=new IntersectionObserver(([t])=>r(e&&t.isIntersecting),{rootMargin:`20% 0px 10% 0px`});return i.observe(n),()=>i.disconnect()},[e]);let{kicker:i,title:a,body:o,button:s,email:c,socials:l}=ks.portal;return(0,$.jsxs)(`section`,{className:`portal`,ref:t,id:`contact`,"data-division":`end of line`,"data-accent":`#27F2C0`,children:[(0,$.jsx)(`div`,{className:`portal-canvas`,"aria-hidden":`true`,children:n?(0,$.jsx)(tc,{}):(0,$.jsx)(`div`,{className:`portal-fallback`})}),(0,$.jsx)(`div`,{className:`portal-scrim`,"aria-hidden":`true`}),(0,$.jsxs)(`div`,{className:`portal-ui`,children:[(0,$.jsx)(`p`,{className:`kicker`,children:i}),(0,$.jsx)(js,{as:`h2`,className:`portal-title`,start:`top 88%`,stagger:.022,children:a.join(` `)}),(0,$.jsx)(`p`,{className:`portal-body`,children:o}),(0,$.jsxs)(Ms,{as:`a`,className:`portal-cta`,strength:.45,...Us,children:[(0,$.jsx)(nc,{}),(0,$.jsx)(`span`,{children:s}),(0,$.jsx)(`span`,{className:`portal-cta-ring`,"aria-hidden":`true`})]}),(0,$.jsx)(`p`,{className:`portal-cta-note`,children:Ns.booking.note}),(0,$.jsxs)(`address`,{className:`portal-contact`,children:[(0,$.jsx)(`a`,{className:`portal-email`,href:`mailto:${c}`,"data-hover":!0,children:c}),(0,$.jsx)(`span`,{className:`portal-phones`,children:Ns.phones.map(e=>(0,$.jsx)(`a`,{className:`portal-phone`,href:e.href,"data-hover":!0,children:e.label},e.href))})]}),(0,$.jsx)(`ul`,{className:`portal-socials`,children:l.map(e=>(0,$.jsx)(`li`,{children:(0,$.jsx)(`a`,{href:e.href,"data-hover":!0,target:`_blank`,rel:`noreferrer noopener`,children:e.label})},e.label))})]}),(0,$.jsxs)(`footer`,{className:`portal-foot`,children:[(0,$.jsx)(`span`,{children:`Hanflux AI`}),(0,$.jsx)(`span`,{children:`the autonomous layer`}),(0,$.jsx)(`span`,{children:`© 2026`})]})]})}if(W.registerPlugin(U),typeof document<`u`&&!document.getElementById(`lattice-fonts`)){let e=document.createElement(`link`);e.id=`lattice-fonts`,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=Doto:wght@500;800;900&family=Martian+Mono:wdth,wght@87.5,300..600&display=swap`,document.head.appendChild(e)}var ic=le.length,ac=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches,oc=e=>{let t=0,n=e;for(;n;)t+=n.offsetTop,n=n.offsetParent;return t};function sc({webgl:e=!0}){let t=(0,G.useRef)(null),n=(0,G.useRef)(null),r=(0,G.useRef)(null),i=(0,G.useRef)(null),a=(0,G.useRef)(null),o=(0,G.useRef)(null),s=(0,G.useRef)([]),c=(0,G.useRef)(-1);(0,G.useEffect)(()=>{let e=matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=new De({lerp:e?1:.09,smoothWheel:!e,wheelMultiplier:1,autoRaf:!1,prevent:e=>!!e?.closest?.(`.chatnav, cal-modal-box`)});t.current=l,l.on(`scroll`,U.update);let u=e=>l.raf(e*1e3);W.ticker.add(u),W.ticker.lagSmoothing(0),fe.driven=!0;let d=null;r.current&&(d=U.create({trigger:r.current,start:`top top`,end:`bottom bottom`,scrub:!0,onUpdate:e=>{fe.index=e.progress*(ic-1)}}));let f=()=>{let e=n.current,t=r.current;if(!e||!t)return;let i=window.innerHeight,a=[[Math.max(0,t.offsetHeight-i),0]],o=e.querySelector(`.divisions`);o&&(a.push([oc(o),1]),a.push([oc(o)+o.offsetHeight-i,6]));let c=(t,n)=>{let r=e.querySelector(t);r&&a.push([oc(r)+r.offsetHeight/2-i/2,n])};c(`.loop`,7),c(`.buildlog`,8),c(`.stack`,9),c(`.metrics`,10),c(`.engage`,11),c(`.approach`,11.6);let l=e.querySelector(`.portal`);l&&a.push([oc(l),J.STATIONS]),a.sort((e,t)=>e[1]-t[1]);for(let e=1;e<a.length;e++)a[e][0]<=a[e-1][0]&&(a[e][0]=a[e-1][0]+1);s.current=a,g()},p=e=>{let t=s.current;if(!t.length)return 0;if(e<=t[0][0])return t[0][1];for(let n=1;n<t.length;n++)if(e<=t[n][0]){let[r,i]=t[n-1],[a,o]=t[n];return i+(e-r)/(a-r)*(o-i)}return t[t.length-1][1]},m=!1,h=({scroll:e})=>{let t=window.innerHeight,n=r.current?.offsetHeight??t,o=e>n-t*.9;q.inAct2=Math.min(1,Math.max(0,(e-(n-t))/t)),o!==m&&(m=o,document.body.classList.toggle(`in-act2`,o));let s=p(e);q.track=s,q.descent=s/J.STATIONS,document.body.style.setProperty(`--lattice`,String(Math.min(1,q.inAct2*1.4)));let l=Math.round(s/J.STATIONS*100);l!==c.current&&(c.current=l,a.current&&(a.current.textContent=String(l).padStart(2,`0`))),i.current?.style.setProperty(`--trk`,s.toFixed(3))};l.on(`scroll`,h);function g(){h({scroll:window.scrollY})}f(),U.addEventListener(`refresh`,f),window.addEventListener(`resize`,f);let _=0,v=new ResizeObserver(()=>{cancelAnimationFrame(_),_=requestAnimationFrame(()=>U.refresh())});n.current&&v.observe(n.current),document.fonts?.ready.then(()=>U.refresh());let y=()=>{let e=o.current;e&&e.textContent!==q.hudLabel&&(e.textContent=q.hudLabel)};return W.ticker.add(y),()=>{d?.kill(),fe.driven=!1,W.ticker.remove(y),v.disconnect(),cancelAnimationFrame(_),U.removeEventListener(`refresh`,f),window.removeEventListener(`resize`,f),W.ticker.remove(u),l.off(`scroll`,U.update),l.destroy(),document.body.classList.remove(`in-act2`),document.body.style.removeProperty(`--lattice`),t.current=null}},[]),(0,G.useEffect)(()=>{let e=n.current;if(!e)return;let t=Array.from(e.querySelectorAll(`[data-division]`));if(!t.length)return;let r=new IntersectionObserver(e=>{for(let n of e){if(!n.isIntersecting)continue;let e=n.target;q.chapter=t.indexOf(e),q.hudLabel=e.dataset.division??q.hudLabel,e.dataset.accent&&(q.divisionColor=e.dataset.accent)}},{rootMargin:`-45% 0px -45% 0px`});return t.forEach(e=>r.observe(e)),()=>r.disconnect()},[]),(0,G.useEffect)(()=>{let e=e=>{q.pointerX=e.clientX/window.innerWidth*2-1,q.pointerY=e.clientY/window.innerHeight*2-1};return window.addEventListener(`pointermove`,e,{passive:!0}),()=>window.removeEventListener(`pointermove`,e)},[]),(0,G.useEffect)(()=>{let e=window.setTimeout(()=>{let e=ue.getState();e.loaded||(e.setIntro(1),e.setSection(`work`),e.setLoaded(!0))},7e3);return()=>window.clearTimeout(e)},[]),(0,G.useEffect)(()=>{let e=e=>{let n=e.target?.tagName;if(n===`INPUT`||n===`TEXTAREA`)return;let i=r.current,a=t.current;if(!i||!a)return;let o=Math.max(0,i.offsetHeight-window.innerHeight);if(window.scrollY>o+4)return;let s=o/Math.max(1,ic-1),c=Math.round(window.scrollY/s);if(e.key===`ArrowDown`||e.key===`ArrowRight`){e.preventDefault();let t=c>=ic-1?`#lattice`:Math.min(o,(c+1)*s);a.scrollTo(t,ac()?{immediate:!0}:{duration:.9})}else (e.key===`ArrowUp`||e.key===`ArrowLeft`)&&(e.preventDefault(),a.scrollTo(Math.max(0,(c-1)*s),ac()?{immediate:!0}:{duration:.9}))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[]),(0,G.useEffect)(()=>{Vs();let e=document.getElementById(`contact`);if(!e)return;let t=new IntersectionObserver(([e])=>document.body.classList.toggle(`portal-in`,e.isIntersecting),{threshold:.25});return t.observe(e),()=>{t.disconnect(),document.body.classList.remove(`portal-in`)}},[]),(0,G.useEffect)(()=>{let e=n.current;if(!e)return;let t=e.querySelectorAll(`[data-print]`);if(ac()){t.forEach(e=>e.classList.add(`printed`));return}let r=new IntersectionObserver(e=>{for(let t of e)t.isIntersecting&&(t.target.classList.add(`printed`),r.unobserve(t.target))},{threshold:0,rootMargin:`0px 0px -14% 0px`});return t.forEach(e=>r.observe(e)),()=>r.disconnect()},[]);let l=()=>t.current?.scrollTo(`#lattice`,ac()?{immediate:!0}:{duration:1.6}),u=()=>t.current?.scrollTo(0,ac()?{immediate:!0}:{duration:1.6}),d=K.hud,f=[d.threshold,...K.capabilities.map(e=>e.title),d.loop,d.buildLog,d.stack,d.metrics,d.engage,`end of line`];return(0,$.jsxs)(`div`,{className:`act2-root`,ref:n,children:[(0,$.jsx)(`div`,{className:`act2-aurora`,"aria-hidden":`true`}),(0,$.jsx)(xs,{webgl:e}),(0,$.jsxs)(`div`,{className:`lx-hud`,ref:i,"aria-hidden":`true`,children:[(0,$.jsxs)(`div`,{className:`lx-read`,children:[(0,$.jsx)(`span`,{className:`lx-pct`,ref:a,children:`00`}),(0,$.jsx)(`span`,{className:`lx-pct-unit`,children:`%`})]}),(0,$.jsxs)(`span`,{className:`lx-where`,children:[(0,$.jsx)(`i`,{children:`>`}),` `,(0,$.jsx)(`span`,{ref:o,children:d.threshold})]}),(0,$.jsx)(`ol`,{className:`lx-rail`,children:f.map((e,t)=>(0,$.jsx)(`li`,{style:{"--i":t}},e))})]}),(0,$.jsx)(`div`,{className:`hero-scroll`,ref:r,"aria-hidden":`true`,style:{height:`${100+(ic-1)*82}vh`}}),(0,$.jsxs)(`button`,{className:`descend`,onClick:l,"data-hover":!0,"aria-label":`Jack in: fly into the Lattice`,children:[(0,$.jsx)(`span`,{className:`descend-label`,children:K.threshold.cue}),(0,$.jsx)(`span`,{className:`descend-arrow`})]}),(0,$.jsxs)(`a`,{className:`book-dock`,"data-hover":!0,"aria-label":`${Ns.booking.button} (opens a scheduler)`,...Us,children:[(0,$.jsx)(`span`,{className:`book-dock-dot`,"aria-hidden":`true`}),(0,$.jsx)(nc,{}),(0,$.jsx)(`span`,{children:Ns.booking.short})]}),(0,$.jsxs)(`button`,{className:`ascend`,onClick:u,"data-hover":!0,"aria-label":`Back to the top`,children:[(0,$.jsx)(`span`,{className:`ascend-arrow`}),(0,$.jsx)(`span`,{children:`top`})]}),(0,$.jsxs)(`main`,{className:`act2`,children:[(0,$.jsxs)(`section`,{className:`a2 threshold`,id:`lattice`,"data-division":d.threshold,"data-accent":`#27F2C0`,children:[(0,$.jsx)(`p`,{className:`lx-prompt`,children:K.threshold.kicker}),(0,$.jsx)(Ts,{as:`h2`,className:`lx-head lx-xl`,stagger:42,scramble:520,children:K.threshold.title.join(` `)}),(0,$.jsx)(`p`,{className:`lx-lede`,children:K.threshold.sub}),(0,$.jsx)(Es,{className:`threshold-boot`,lines:K.threshold.boot})]}),(0,$.jsx)(Os,{}),(0,$.jsxs)(`section`,{className:`a2 loop`,"data-division":d.loop,"data-accent":`#4EA8FF`,children:[(0,$.jsxs)(`div`,{className:`loop-head`,children:[(0,$.jsx)(`p`,{className:`lx-prompt`,children:K.loop.kicker}),(0,$.jsx)(Ts,{as:`h2`,className:`lx-head lx-md`,children:K.loop.title})]}),(0,$.jsx)(`ol`,{className:`loop-pipe`,"data-print":!0,children:K.loop.steps.map((e,t)=>(0,$.jsxs)(`li`,{className:`lp-step`,style:{"--d":t},children:[(0,$.jsx)(`span`,{className:`lp-node`,"aria-hidden":`true`}),(0,$.jsxs)(`h3`,{className:`lp-title`,children:[(0,$.jsx)(`span`,{className:`lp-no`,children:e.no}),e.title]}),(0,$.jsx)(`p`,{className:`lp-body`,children:e.body})]},e.no))})]}),(0,$.jsxs)(`section`,{className:`a2 buildlog`,"data-division":d.buildLog,"data-accent":`#27F2C0`,children:[(0,$.jsxs)(`div`,{className:`buildlog-head`,children:[(0,$.jsx)(Ts,{as:`h2`,className:`lx-head lx-md`,children:K.buildLog.title}),(0,$.jsx)(`p`,{className:`lx-lede`,children:K.buildLog.sub})]}),(0,$.jsxs)(`div`,{className:`term-win holo`,"data-print":!0,children:[(0,$.jsxs)(`div`,{className:`tw-bar`,children:[(0,$.jsxs)(`span`,{className:`tw-path`,children:[`hanflux@lattice ~ % `,K.buildLog.kicker]}),(0,$.jsx)(`span`,{className:`tw-live`,children:`live`})]}),(0,$.jsx)(`ul`,{className:`tw-log`,children:K.buildLog.entries.map((e,t)=>(0,$.jsxs)(`li`,{className:`tw-row tw-${e.tag}`,style:{"--d":t},children:[(0,$.jsxs)(`span`,{className:`tw-tag`,children:[`[`,e.tag===`both`?`claude+n8n`:e.tag,`]`]}),(0,$.jsx)(`span`,{className:`tw-title`,children:e.title}),(0,$.jsx)(`span`,{className:`tw-body`,children:e.body})]},e.title))})]})]}),(0,$.jsxs)(`section`,{className:`a2 stack`,"data-division":d.stack,"data-accent":`#FFB36B`,children:[(0,$.jsxs)(`div`,{className:`stack-head`,children:[(0,$.jsx)(`p`,{className:`lx-prompt`,children:K.stack.kicker}),(0,$.jsx)(Ts,{as:`h2`,className:`lx-head lx-md`,children:K.stack.title})]}),(0,$.jsxs)(`div`,{className:`tree holo`,"data-print":!0,children:[(0,$.jsx)(`p`,{className:`tree-root`,children:`hanflux/`}),(0,$.jsx)(`div`,{className:`tree-grid`,children:K.stack.groups.map((e,t)=>(0,$.jsxs)(`div`,{className:`tree-branch`,style:{"--d":t},children:[(0,$.jsxs)(`p`,{className:`tree-label`,children:[(0,$.jsx)(`span`,{className:`tree-glyph`,children:t===K.stack.groups.length-1?`└──`:`├──`}),e.label.toLowerCase(),`/`]}),(0,$.jsx)(`ul`,{children:e.items.map((t,n)=>(0,$.jsxs)(`li`,{children:[(0,$.jsx)(`span`,{className:`tree-glyph`,children:n===e.items.length-1?`└─`:`├─`}),t]},t))})]},e.label))})]})]}),(0,$.jsx)(`section`,{className:`a2 metrics`,"data-division":d.metrics,"data-accent":`#27F2C0`,children:(0,$.jsx)(`div`,{className:`metrics-row`,"data-print":!0,children:K.metrics.map((e,t)=>(0,$.jsxs)(`div`,{className:`metric`,style:{"--d":t},children:[(0,$.jsx)(Ts,{as:`span`,className:`m-v`,stagger:70,scramble:600,children:e.v}),(0,$.jsx)(`span`,{className:`m-l`,children:e.l})]},e.l))})}),(0,$.jsxs)(`section`,{className:`a2 engage`,"data-division":d.engage,"data-accent":`#9AE6FF`,children:[(0,$.jsxs)(`div`,{className:`engage-head`,children:[(0,$.jsx)(`p`,{className:`lx-prompt`,children:K.engage.kicker}),(0,$.jsx)(Ts,{as:`h2`,className:`lx-head lx-md`,children:K.engage.title}),(0,$.jsx)(`p`,{className:`lx-lede`,children:K.engage.sub})]}),(0,$.jsx)(`div`,{className:`gates`,"data-print":!0,children:K.engage.tiers.map((e,t)=>(0,$.jsxs)(`article`,{className:`gate holo`,style:{"--d":t},children:[(0,$.jsx)(`span`,{className:`gate-bars`,"aria-hidden":`true`,children:Array.from({length:t+1},(e,t)=>(0,$.jsx)(`i`,{},t))}),(0,$.jsx)(`h3`,{className:`gate-name`,children:e.name}),(0,$.jsx)(`span`,{className:`gate-window`,children:e.window}),(0,$.jsx)(`span`,{className:`gate-price`,children:e.price}),(0,$.jsx)(`p`,{className:`gate-body`,children:e.body})]},e.no))}),(0,$.jsxs)(`div`,{className:`retainer holo`,children:[(0,$.jsx)(`span`,{className:`rt-pulse`,"aria-hidden":`true`}),(0,$.jsx)(`span`,{className:`rt-name`,children:K.engage.retainer.name}),(0,$.jsx)(`span`,{className:`rt-price`,children:K.engage.retainer.price}),(0,$.jsx)(`p`,{className:`rt-body`,children:K.engage.retainer.body})]}),(0,$.jsxs)(`div`,{className:`engage-book`,children:[(0,$.jsxs)(`div`,{className:`engage-book-copy`,children:[(0,$.jsx)(`p`,{className:`engage-book-line`,children:K.engage.book.line}),(0,$.jsx)(`p`,{className:`engage-book-sub`,children:K.engage.book.sub})]}),(0,$.jsxs)(Ms,{as:`a`,className:`book-btn`,strength:.3,...Us,children:[(0,$.jsx)(nc,{}),(0,$.jsx)(`span`,{children:Ns.booking.button})]})]}),(0,$.jsxs)(`div`,{className:`fineprint`,"data-print":!0,children:[(0,$.jsx)(`p`,{className:`lx-prompt`,children:K.trust.kicker}),(0,$.jsx)(`ul`,{children:K.trust.items.map((e,t)=>(0,$.jsxs)(`li`,{style:{"--d":t},children:[(0,$.jsx)(`span`,{className:`fp-ok`,"aria-hidden":`true`,children:`[ok]`}),(0,$.jsx)(`strong`,{children:e.title}),(0,$.jsx)(`span`,{children:e.body})]},e.title))})]})]}),(0,$.jsx)(`section`,{className:`approach`,"aria-hidden":`true`,"data-division":`end of line`,"data-accent":`#4CF0FF`})]}),(0,$.jsx)(rc,{webgl:e})]})}export{sc as DownwardWorld};