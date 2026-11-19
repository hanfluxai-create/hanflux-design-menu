import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{c as t,f as n,h as r,n as i,o as a,r as o,s,t as c,u as l}from"./postprocessing-B2huDWi8.js";import{s as u}from"./r3f-CO8VRv3T.js";import{C as d,D as f,E as p,F as m,G as h,I as g,P as _,T as v,U as y,W as b,a as x,c as ee,d as S,dt as C,et as w,ft as T,i as te,nt as ne,o as re,ot as ie,p as ae}from"./three-BJD5cfNI.js";import{a as oe,i as E,n as se,t as D}from"./index-DnWcs_RJ.js";import{n as O,r as k,t as ce}from"./SplitText-fg9FcGYf.js";import{t as A}from"./heroNav-Bd2Rmfeq.js";var j=e(r(),1),M=`1.3.23`;function N(e,t,n){return Math.max(e,Math.min(t,n))}function P(e,t,n){return(1-n)*e+n*t}function le(e,t,n,r){return P(e,t,1-Math.exp(-n*r))}function ue(e,t){return(e%t+t)%t}var de=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(e){if(!this.isRunning)return;let t=!1;if(this.duration&&this.easing){this.currentTime+=e;let n=N(0,this.currentTime/this.duration,1);t=n>=1;let r=t?1:this.easing(n);this.value=this.from+(this.to-this.from)*r}else this.lerp?(this.value=le(this.value,this.to,this.lerp*60,e),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,t=!0)):(this.value=this.to,t=!0);t&&this.stop(),this.onUpdate?.(this.value,t)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n,duration:r,easing:i,onStart:a,onUpdate:o}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=r,this.easing=i,this.currentTime=0,this.isRunning=!0,a?.(),this.onUpdate=o}};function F(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>{n=void 0,e.apply(this,r)},t)}}var fe=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(e,t,{autoResize:n=!0,debounce:r=250}={}){this.wrapper=e,this.content=t,n&&(this.debouncedResize=F(this.resize,r),this.wrapper instanceof Window?window.addEventListener(`resize`,this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener(`resize`,this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},I=class{events={};emit(e,...t){let n=this.events[e]||[];for(let e=0,r=n.length;e<r;e++)n[e]?.(...t)}on(e,t){return this.events[e]?this.events[e].push(t):this.events[e]=[t],()=>{this.events[e]=this.events[e]?.filter(e=>t!==e)}}off(e,t){this.events[e]=this.events[e]?.filter(e=>t!==e)}destroy(){this.events={}}},pe=100/6,L={passive:!1};function me(e,t){return e===1?pe:e===2?t:1}var he=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new I;constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){this.element=e,this.options=t,window.addEventListener(`resize`,this.onWindowResize),this.onWindowResize(),this.element.addEventListener(`wheel`,this.onWheel,L),this.element.addEventListener(`touchstart`,this.onTouchStart,L),this.element.addEventListener(`touchmove`,this.onTouchMove,L),this.element.addEventListener(`touchend`,this.onTouchEnd,L)}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener(`resize`,this.onWindowResize),this.element.removeEventListener(`wheel`,this.onWheel,L),this.element.removeEventListener(`touchstart`,this.onTouchStart,L),this.element.removeEventListener(`touchmove`,this.onTouchMove,L),this.element.removeEventListener(`touchend`,this.onTouchEnd,L)}onTouchStart=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit(`scroll`,{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,r=-(t-this.touchStart.x)*this.options.touchMultiplier,i=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:r,y:i},this.emitter.emit(`scroll`,{deltaX:r,deltaY:i,event:e})};onTouchEnd=e=>{this.emitter.emit(`scroll`,{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:n,deltaMode:r}=e,i=me(r,this.window.width),a=me(r,this.window.height);t*=i,n*=a,t*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit(`scroll`,{deltaX:t,deltaY:n,event:e})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},ge=e=>Math.min(1,1.001-2**(-10*e)),R=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new de;emitter=new I;dimensions;virtualScroll;constructor({wrapper:e=window,content:t=document.documentElement,eventsTarget:n=e,smoothWheel:r=!0,syncTouch:i=!1,syncTouchLerp:a=.075,touchInertiaExponent:o=1.7,duration:s,easing:c,lerp:l=.1,infinite:u=!1,orientation:d=`vertical`,gestureOrientation:f=d===`horizontal`?`both`:`vertical`,touchMultiplier:p=1,wheelMultiplier:m=1,autoResize:h=!0,prevent:g,virtualScroll:_,overscroll:v=!0,autoRaf:y=!1,anchors:b=!1,autoToggle:x=!1,allowNestedScroll:ee=!1,__experimental__naiveDimensions:S=!1,naiveDimensions:C=S,stopInertiaOnNavigate:w=!1}={}){window.lenisVersion=M,window.lenis||(window.lenis={}),window.lenis.version=M,d===`horizontal`&&(window.lenis.horizontal=!0),i===!0&&(window.lenis.touch=!0),(!e||e===document.documentElement)&&(e=window),typeof s==`number`&&typeof c!=`function`?c=ge:typeof c==`function`&&typeof s!=`number`&&(s=1),this.options={wrapper:e,content:t,eventsTarget:n,smoothWheel:r,syncTouch:i,syncTouchLerp:a,touchInertiaExponent:o,duration:s,easing:c,lerp:l,infinite:u,gestureOrientation:f,orientation:d,touchMultiplier:p,wheelMultiplier:m,autoResize:h,prevent:g,virtualScroll:_,overscroll:v,autoRaf:y,anchors:b,autoToggle:x,allowNestedScroll:ee,naiveDimensions:C,stopInertiaOnNavigate:w},this.dimensions=new fe(e,t,{autoResize:h}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.addEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener(`click`,this.onClick),this.options.wrapper.addEventListener(`pointerdown`,this.onPointerDown),this.virtualScroll=new he(n,{touchMultiplier:p,wheelMultiplier:m}),this.virtualScroll.on(`scroll`,this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener(`transitionend`,this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.removeEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener(`pointerdown`,this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener(`click`,this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}onScrollEnd=e=>{e instanceof CustomEvent||(this.isScrolling===`smooth`||this.isScrolling===!1)&&e.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent(`scrollend`,{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){let e=this.isHorizontal?`overflow-x`:`overflow-y`;return getComputedStyle(this.rootElement)[e]}checkOverflow(){[`hidden`,`clip`].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=e=>{e.propertyName?.includes(`overflow`)&&e.target===this.rootElement&&this.checkOverflow()};setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:`instant`}):this.options.wrapper.scrollTo({top:e,behavior:`instant`})}onClick=e=>{let t=e.composedPath().filter(e=>e instanceof HTMLAnchorElement&&e.href).map(e=>new URL(e.href)),n=new URL(window.location.href);if(this.options.anchors){let e=t.find(e=>n.host===e.host&&n.pathname===e.pathname&&e.hash);if(e){let t=typeof this.options.anchors==`object`&&this.options.anchors?this.options.anchors:void 0,n=`#${e.hash.split(`#`)[1]}`;this.scrollTo(n,t);return}}if(this.options.stopInertiaOnNavigate&&t.some(e=>n.host===e.host&&n.pathname!==e.pathname)){this.reset();return}};onPointerDown=e=>{e.button===1&&this.reset()};onVirtualScroll=e=>{if(typeof this.options.virtualScroll==`function`&&this.options.virtualScroll(e)===!1)return;let{deltaX:t,deltaY:n,event:r}=e;if(this.emitter.emit(`virtual-scroll`,{deltaX:t,deltaY:n,event:r}),r.ctrlKey||r.lenisStopPropagation)return;let i=r.type.includes(`touch`),a=r.type.includes(`wheel`);this.isTouching=r.type===`touchstart`||r.type===`touchmove`;let o=t===0&&n===0;if(this.options.syncTouch&&i&&r.type===`touchstart`&&o&&!this.isStopped&&!this.isLocked){this.reset();return}let s=this.options.gestureOrientation===`vertical`&&n===0||this.options.gestureOrientation===`horizontal`&&t===0;if(o||s)return;let c=r.composedPath();c=c.slice(0,c.indexOf(this.rootElement));let l=this.options.prevent,u=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`;if(c.find(e=>e instanceof HTMLElement&&(typeof l==`function`&&l?.(e)||e.hasAttribute?.(`data-lenis-prevent`)||u===`vertical`&&e.hasAttribute?.(`data-lenis-prevent-vertical`)||u===`horizontal`&&e.hasAttribute?.(`data-lenis-prevent-horizontal`)||i&&e.hasAttribute?.(`data-lenis-prevent-touch`)||a&&e.hasAttribute?.(`data-lenis-prevent-wheel`)||this.options.allowNestedScroll&&this.hasNestedScroll(e,{deltaX:t,deltaY:n}))))return;if(this.isStopped||this.isLocked){r.cancelable&&r.preventDefault();return}if(!(this.options.syncTouch&&i||this.options.smoothWheel&&a)){this.isScrolling=`native`,this.animate.stop(),r.lenisStopPropagation=!0;return}let d=n;this.options.gestureOrientation===`both`?d=Math.abs(n)>Math.abs(t)?n:t:this.options.gestureOrientation===`horizontal`&&(d=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(r.lenisStopPropagation=!0),r.cancelable&&r.preventDefault();let f=i&&this.options.syncTouch,p=i&&r.type===`touchend`;p&&(d=Math.sign(d)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+d,{programmatic:!1,...f?{lerp:p?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit(`scroll`,this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling===`native`){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling=`native`),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty(`overflow`);return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty(`overflow`,`clip`);return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(e,{offset:t=0,immediate:n=!1,lock:r=!1,programmatic:i=!0,lerp:a=i?this.options.lerp:void 0,duration:o=i?this.options.duration:void 0,easing:s=i?this.options.easing:void 0,onStart:c,onComplete:l,force:u=!1,userData:d}={}){if((this.isStopped||this.isLocked)&&!u)return;let f=e,p=t;if(typeof f==`string`&&[`top`,`left`,`start`,`#`].includes(f))f=0;else if(typeof f==`string`&&[`bottom`,`right`,`end`].includes(f))f=this.limit;else{let e=null;if(typeof f==`string`?(e=document.querySelector(f),e||(f===`#top`?f=0:console.warn(`Lenis: Target not found`,f))):f instanceof HTMLElement&&f?.nodeType&&(e=f),e){if(this.options.wrapper!==window){let e=this.rootElement.getBoundingClientRect();p-=this.isHorizontal?e.left:e.top}let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=this.isHorizontal?Number.parseFloat(n.scrollMarginLeft):Number.parseFloat(n.scrollMarginTop),i=getComputedStyle(this.rootElement),a=this.isHorizontal?Number.parseFloat(i.scrollPaddingLeft):Number.parseFloat(i.scrollPaddingTop);f=(this.isHorizontal?t.left:t.top)+this.animatedScroll-(Number.isNaN(r)?0:r)-(Number.isNaN(a)?0:a)}}if(typeof f==`number`){if(f+=p,this.options.infinite){if(i){this.targetScroll=this.animatedScroll=this.scroll;let e=f-this.animatedScroll;e>this.limit/2?f-=this.limit:e<-this.limit/2&&(f+=this.limit)}}else f=N(0,f,this.limit);if(f===this.targetScroll){c?.(this),l?.(this);return}if(this.userData=d??{},n){this.animatedScroll=this.targetScroll=f,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),l?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}i||(this.targetScroll=f),typeof o==`number`&&typeof s!=`function`?s=ge:typeof s==`function`&&typeof o!=`number`&&(o=1),this.animate.fromTo(this.animatedScroll,f,{duration:o,easing:s,lerp:a,onStart:()=>{r&&(this.isLocked=!0),this.isScrolling=`smooth`,c?.(this)},onUpdate:(e,t)=>{this.isScrolling=`smooth`,this.lastVelocity=this.velocity,this.velocity=e-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=e,this.setScroll(this.scroll),i&&(this.targetScroll=e),t||this.emit(),t&&(this.reset(),this.emit(),l?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(e,{deltaX:t,deltaY:n}){let r=Date.now();e._lenis||={};let i=e._lenis,a,o,s,c,l,u,d,f,p,m;if(r-(i.time??0)>2e3){i.time=Date.now();let t=window.getComputedStyle(e);if(i.computedStyle=t,a=[`auto`,`overlay`,`scroll`].includes(t.overflowX),o=[`auto`,`overlay`,`scroll`].includes(t.overflowY),l=[`auto`].includes(t.overscrollBehaviorX),u=[`auto`].includes(t.overscrollBehaviorY),i.hasOverflowX=a,i.hasOverflowY=o,!(a||o))return!1;d=e.scrollWidth,f=e.scrollHeight,p=e.clientWidth,m=e.clientHeight,s=d>p,c=f>m,i.isScrollableX=s,i.isScrollableY=c,i.scrollWidth=d,i.scrollHeight=f,i.clientWidth=p,i.clientHeight=m,i.hasOverscrollBehaviorX=l,i.hasOverscrollBehaviorY=u}else s=i.isScrollableX,c=i.isScrollableY,a=i.hasOverflowX,o=i.hasOverflowY,d=i.scrollWidth,f=i.scrollHeight,p=i.clientWidth,m=i.clientHeight,l=i.hasOverscrollBehaviorX,u=i.hasOverscrollBehaviorY;if(!(a&&s||o&&c))return!1;let h=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`,g,_,v,y,b,x;if(h===`horizontal`)g=Math.round(e.scrollLeft),_=d-p,v=t,y=a,b=s,x=l;else if(h===`vertical`)g=Math.round(e.scrollTop),_=f-m,v=n,y=o,b=c,x=u;else return!1;return!x&&(g>=_||g<=0)?!0:(v>0?g<_:g>0)&&y&&b}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?`x`:`y`]}get isHorizontal(){return this.options.orientation===`horizontal`}get actualScroll(){let e=this.options.wrapper;return this.isHorizontal?e.scrollX??e.scrollLeft:e.scrollY??e.scrollTop}get scroll(){return this.options.infinite?ue(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return this.isScrolling===`smooth`}get className(){let e=`lenis`;return this.options.autoToggle&&(e+=` lenis-autoToggle`),this.isStopped&&(e+=` lenis-stopped`),this.isLocked&&(e+=` lenis-locked`),this.isScrolling&&(e+=` lenis-scrolling`),this.isScrolling===`smooth`&&(e+=` lenis-smooth`),e}updateClassName(){this.cleanUpClassName(),this.className.split(` `).forEach(e=>{this.rootElement.classList.add(e)})}cleanUpClassName(){for(let e of Array.from(this.rootElement.classList))(e===`lenis`||e.startsWith(`lenis-`))&&this.rootElement.classList.remove(e)}},z={threshold:{kicker:`YOU ARE ENTERING THE SPIRE`,title:[`ONE MACHINE.`,`EVERY WORKFLOW.`],sub:`This is where AI stops being a demo. Voice, agents, orchestration, memory, growth, and the ops layer that keeps it all alive after launch. Descend.`,cue:`begin the descent`},capabilities:[{id:`voice`,no:`01`,tag:`VOICE DIVISION`,title:`AI Voice Agents`,blurb:`Picks up before the second ring, in any language, and books the job while your competitor’s phone is still ringing. Speed-to-lead is a solved problem here.`,bullets:[`Inbound + outbound at any volume`,`Books, routes and recaps into your CRM`,`Sub-second turn-taking, barge-in, transfer to human`],a:`#27F2C0`,b:`#0c5c5a`},{id:`foundry`,no:`02`,tag:`AGENT FOUNDRY`,title:`Custom Agents & Skills`,blurb:`Claude agents shaped to your exact workflow: they read your tools over MCP, plan multi-step work, and check their own output against a rubric before you ever see it.`,bullets:[`Bespoke skills, versioned like code`,`MCP integrations: your stack becomes their toolbox`,`Sub-agent teams: research, drafting, QA in parallel`],a:`#7C5CFF`,b:`#241a4d`},{id:`orchestration`,no:`03`,tag:`ORCHESTRATION`,title:`Workflow Automation`,blurb:`An n8n nervous system wiring your entire stack into one graph: triggers, branching, retries with backoff, and a human checkpoint before anything irreversible fires.`,bullets:[`500+ app connectors`,`Self-healing: error triggers + automatic retries`,`Human-in-the-loop gates on expensive actions`],a:`#4EA8FF`,b:`#0c2b4d`},{id:`memory`,no:`04`,tag:`MEMORY VAULT`,title:`RAG & Knowledge Systems`,blurb:`Your documents, tickets and tribal knowledge become an answer engine where every response traces to a real source. Permission-aware, current, never a guess.`,bullets:[`Vector index + long context over your corpus`,`Access control mirrored from your permissions`,`Citations on every answer`],a:`#FFB36B`,b:`#4d2c0c`},{id:`growth`,no:`05`,tag:`GROWTH ENGINE`,title:`Revenue Systems`,blurb:`Outbound that researches, personalises and books while you sleep. Inbound where no call, chat or form ever goes unanswered. Pipeline without headcount.`,bullets:[`Account research → sequence → booked meeting`,`Reply detection and intelligent routing`,`Every lead logged, scored, followed up`],a:`#FF3D7F`,b:`#4d1029`},{id:`ops`,no:`06`,tag:`SPIRE OPS · FLAGSHIP`,title:`AI Reliability Ops`,blurb:`The layer nobody else sells: we run your AI after it ships. Evals, monitoring, drift detection, cost tuning, model migrations. SRE for your agents, as a product.`,bullets:[`Continuous evals against your rubric`,`Live dashboards: latency, cost, resolution rate`,`Model migrations when a better/cheaper one lands`],a:`#9AE6FF`,b:`#12384d`}],loop:{kicker:`HOW A SYSTEM GETS BUILT`,title:`We don’t demo. We deploy, prove, and keep it alive.`,steps:[{no:`01`,title:`Map`,body:`A short recon of your real workflows. Most aren’t worth automating. We score the few that are, with ROI math attached.`},{no:`02`,title:`Build`,body:`A working system on your real data in weeks. The same people who scope it build it. No bait-and-switch.`},{no:`03`,title:`Prove`,body:`An eval harness scores every output against your rubric. It ships when the numbers clear the bar, not when the demo looks good.`},{no:`04`,title:`Run`,body:`Monitoring, drift alerts, cost tuning and upgrades. The system compounds instead of quietly rotting.`}]},buildLog:{kicker:`THE BUILD LOG`,title:`Not a menu. A running log of what gets wired.`,sub:`Pull any line. We scope it this week.`,entries:[{tag:`claude`,title:`Agent SDK builds`,body:`Multi-step agents that plan, call tools, check their own work against a rubric, and retry before you ever see the output.`},{tag:`n8n`,title:`AI Agent nodes`,body:`Claude's reasoning wired straight into n8n's graph, so a workflow stops just triggering and starts deciding.`},{tag:`claude`,title:`Custom Skills`,body:`Packaged expertise Claude loads on demand: your playbooks, your tone, your edge cases, versioned like code.`},{tag:`n8n`,title:`Self-healing workflows`,body:`Error triggers, retries with backoff, and a human-in-the-loop checkpoint before anything expensive or irreversible fires.`},{tag:`claude`,title:`MCP integrations`,body:`Your CRM, calendar and ticketing system exposed as tools Claude can call directly. No fragile screen-scraping.`},{tag:`both`,title:`Realtime voice loop`,body:`Sub-second STT → Claude → TTS, wired straight into telephony. The agent picks up before the second ring.`},{tag:`claude`,title:`Eval harnesses`,body:`Golden sets, rubric scoring and regression gates: the ship/no-ship instrument every AI build should come with, and almost none do.`},{tag:`n8n`,title:`500+ connectors`,body:`Every app in your stack wired into one graph: CRM, calendar, Slack, Stripe, your own internal APIs.`},{tag:`both`,title:`Model migrations`,body:`When a better or cheaper model lands, we re-run your evals, migrate the prompts, and cut costs without breaking behaviour.`},{tag:`claude`,title:`Computer-use QA`,body:`An agent that drives a real browser like a user would, files the bug, and attaches the repro.`},{tag:`both`,title:`RAG over your knowledge`,body:`Vector-indexed docs plus long context, so every answer traces back to a real source. Never a guess.`},{tag:`claude`,title:`Sub-agent orchestration`,body:`One orchestrator and a bench of specialists for research, drafting and QA, run in parallel and merged into a single answer.`}]},stack:{kicker:`THE STACK WE WIELD`,title:`Best-in-class parts, welded into one machine.`,groups:[{label:`Intelligence`,items:[`Claude (first-choice)`,`GPT / Gemini`,`Open-weights`,`Custom Skills`,`MCP`]},{label:`Automation`,items:[`n8n`,`Webhooks`,`Schedulers`,`Queues`,`Zapier bridge`]},{label:`Voice`,items:[`Realtime STT/TTS`,`Telephony (SIP)`,`Barge-in`,`Multilingual`]},{label:`Memory`,items:[`Vector DB / RAG`,`Postgres`,`Knowledge bases`]},{label:`Proof`,items:[`Eval harnesses`,`Live dashboards`,`Tracing & logs`]},{label:`Surfaces`,items:[`Web`,`WhatsApp`,`Email`,`Slack`,`CRM`]}]},metrics:[{v:`24/7`,l:`always-on agents`},{v:`<1s`,l:`voice response latency`},{v:`500+`,l:`app connectors on tap`},{v:`2×`,l:`ship rate of external builds vs in-house (MIT)`}],engage:{kicker:`WAYS IN`,title:`Three doors. Fixed fees. No mystery.`,sub:`MIT found 95% of enterprise AI pilots never touch the P&L, and that externally built systems reach production twice as often. Closing that gap is our entire business, so every phase is fixed-fee, and part of it can ride on the KPI we commit to.`,tiers:[{no:`01`,name:`Signal Audit`,window:`2 weeks`,price:`from $3,000`,body:`We map your workflows, find the few automations actually worth building, and hand you a scored roadmap with ROI math. Yours to keep. Build it with anyone.`},{no:`02`,name:`First Agent Live`,window:`3 to 6 weeks`,price:`from $10,000`,body:`One workflow (voice, agent or automation) wired end to end on your real data, with an eval harness proving it works before anyone relies on it.`},{no:`03`,name:`The Autonomous Layer`,window:`6 to 12 weeks`,price:`from $30,000`,body:`Voice, agents, orchestration and memory deployed across the org, with training so your team owns what we built.`}],retainer:{name:`SPIRE OPS`,price:`from $1,500/mo`,body:`The service that never sleeps: monitoring, evals, drift alerts, cost tuning, model migrations, and a new automation shipped every month.`}},trust:{kicker:`THE FINE PRINT, UP FRONT`,items:[{title:`Your data trains nothing`,body:`Never used to train anyone’s models. In the contract, in writing.`},{title:`Model-agnostic`,body:`Claude, GPT, Gemini or open weights: the best model per job. You are never locked in.`},{title:`Humans on the loop`,body:`Checkpoints before anything expensive or irreversible fires.`},{title:`Audit-ready`,body:`Logged decisions, scoped access, least-privilege keys on every build.`}]},cta:{kicker:`STREET LEVEL`,title:[`Get your AI`,`into production.`],body:`Tell us the work you keep doing by hand. We’ll wire the voice, the agents and the automations that make it run itself. Then we’ll keep them alive.`,email:`hello@hanflux.ai`,button:`Get your AI into production`}},B={galleryProgress:0,inAct2:0,pointerX:0,pointerY:0,active:-1,portalProgress:0,descent:0,chapter:0,divisionColor:`#27f2c0`,hudLabel:`THE CROWN`};function _e(){return{uTime:{value:0},uFogColor:{value:new S(`#0a1226`)},uFogDensity:{value:.0026},uAccent:{value:new S(`#27f2c0`)},uAlt:{value:0},uGlow:{value:.9},uPulse:{value:1},uVeil:{value:0}}}var V=`
float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
`,H=`
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm4(vec2 p){
  float s = 0.0, a = 0.5;
  for(int i = 0; i < 4; i++){ s += a * vnoise(p); p = p * 2.03 + vec2(17.1, 9.3); a *= 0.5; }
  return s;
}
`,U=`
uniform vec3 uFogColor;
uniform float uFogDensity;
vec3 applyFog(vec3 c, float d){
  float f = 1.0 - exp(-d * uFogDensity);
  return mix(c, uFogColor, clamp(f, 0.0, 1.0));
}
float fogExtinct(float d){ return exp(-d * uFogDensity); }
`;function W(e){return`
attribute float aSeed;
${e?`attribute float aRad; varying float vRad;`:``}
varying vec3 vW;
varying vec3 vN;
varying float vSeed;
varying vec3 vLocal;
void main(){
  vSeed = aSeed;
  vLocal = position;
  ${e?`vRad = aRad;`:``}
  vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`}function ve(e){return`
precision highp float;
varying vec3 vW;
varying vec3 vN;
varying float vSeed;
varying vec3 vLocal;
${e?`varying float vRad;`:``}
uniform float uTime;
uniform vec3 uAccent;
uniform float uGlow;
${V}
${U}
void main(){
  vec3 n = normalize(vN);
  float roof = step(0.55, abs(n.y));
  ${e?`float u = atan(vLocal.z, vLocal.x) * vRad;`:`float u = mix(vW.x, vW.z, step(0.5, abs(n.x)));`}
  float v = vW.y;
  vec2 cell = vec2(floor(u / 3.4), floor(v / 4.0));
  vec2 f = vec2(fract(u / 3.4), fract(v / 4.0));
  float rnd = hash12(cell + vSeed * 113.7);
  // mechanical floors read as dark bands
  float mech = step(0.93, hash12(vec2(cell.y, vSeed * 7.3)));
  // occupancy varies per building and per 10-floor block
  float occ = 0.32 + 0.30 * hash12(vec2(vSeed, floor(v / 40.0)));
  float lit = step(1.0 - occ, rnd) * (1.0 - mech);
  // a rare subset of windows flickers slowly (life in the building)
  float fl = hash12(cell * 1.71 + vSeed);
  lit *= mix(1.0, step(0.45, fract(fl * 67.0 + uTime * (0.10 + fl * 0.30))), step(0.94, fl));
  // window pane shape within the cell
  float win = smoothstep(0.08, 0.22, f.x) * smoothstep(0.94, 0.78, f.x)
            * smoothstep(0.14, 0.30, f.y) * smoothstep(0.90, 0.70, f.y);
  // window colour population: warm sodium / cool office / division accent
  float cw = hash12(cell + vec2(17.0, 3.0) + vSeed);
  vec3 wcol = mix(vec3(1.0, 0.80, 0.52), vec3(0.55, 0.82, 1.05), step(0.55, cw));
  wcol = mix(wcol, uAccent * 1.5, step(0.90, cw));

  vec3 base = vec3(0.012, 0.018, 0.034) * (0.55 + 0.45 * max(n.y, 0.0)) + vec3(0.008, 0.012, 0.020);
  float dist = length(vW - cameraPosition);
  // distant facades collapse to an averaged glow — kills window moiré
  float lod = smoothstep(750.0, 140.0, dist);
  vec3 winGlow = wcol * win * lit * (1.3 + 0.7 * hash12(cell + vec2(3.1, 7.7)));
  vec3 farGlow = wcol * occ * 0.20;
  vec3 col = base * (1.0 - roof * 0.35) + mix(farGlow, winGlow, lod) * (1.0 - roof) * uGlow;
  ${e?`
  // sky-lobby bands every ~62 floors + faint vertical edge light strips
  float band = pow(0.5 + 0.5 * cos((v / 250.0) * 6.28318), 180.0);
  col += uAccent * band * 0.9;
  float ang = atan(vLocal.z, vLocal.x);
  float strip = pow(0.5 + 0.5 * cos(ang * 8.0), 60.0);
  col += uAccent * strip * 0.10 * (1.0 - roof);
  `:``}
  col = applyFog(col, dist);
  gl_FragColor = vec4(col, 1.0);
}
`}function ye(e,t){return new w({uniforms:{uTime:e.uTime,uAccent:e.uAccent,uGlow:e.uGlow,uFogColor:e.uFogColor,uFogDensity:e.uFogDensity},vertexShader:W(t),fragmentShader:ve(t)})}var be=`
attribute float aPhase;
attribute float aStrand;
varying float vPhase;
varying float vStrand;
varying vec3 vN;
varying vec3 vW;
void main(){
  vPhase = aPhase;
  vStrand = aStrand;
  vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * (mat3(instanceMatrix) * normal));
  gl_Position = projectionMatrix * viewMatrix * w;
}
`,G=`
precision highp float;
varying float vPhase;
varying float vStrand;
varying vec3 vN;
varying vec3 vW;
uniform float uTime;
uniform float uPulse;
uniform vec3 uColA;
uniform vec3 uAccent;
${U}
void main(){
  vec3 base = mix(uColA, uAccent, vStrand);
  // GLSL pow() is undefined for negative bases — square manually
  float pd = (vPhase - uPulse) * 22.0;
  float pulse = exp(-pd * pd);
  float br = 0.6 + 0.4 * sin(uTime * 1.3 + vPhase * 44.0);
  vec3 V = normalize(cameraPosition - vW);
  float fr = pow(max(0.0, 1.0 - abs(dot(normalize(vN), V))), 1.6);
  vec3 col = base * (0.35 * br + 0.9 * fr) + base * pulse * 2.6 + vec3(1.0) * pulse * 0.35;
  float ext = fogExtinct(length(vW - cameraPosition));
  gl_FragColor = vec4(col * ext, 1.0);
}
`,xe=`
precision highp float;
varying float vPhase;
varying float vStrand;
varying vec3 vN;
varying vec3 vW;
uniform float uTime;
uniform float uPulse;
uniform vec3 uColA;
uniform vec3 uAccent;
${U}
void main(){
  float pd = (vPhase - uPulse) * 22.0;
  float pulse = exp(-pd * pd);
  vec3 col = mix(vec3(0.45, 0.75, 0.85), uAccent, 0.35) * (0.16 + pulse * 1.6);
  col += uColA * pulse * 0.4;
  float ext = fogExtinct(length(vW - cameraPosition));
  gl_FragColor = vec4(col * ext * (0.6 + 0.4 * sin(uTime + vStrand)), 1.0);
}
`;function Se(e){return new w({uniforms:{uTime:e.uTime,uPulse:e.uPulse,uColA:{value:new S(`#27f2c0`)},uAccent:e.uAccent,uFogColor:e.uFogColor,uFogDensity:e.uFogDensity},vertexShader:be,fragmentShader:G,blending:2,transparent:!0,depthWrite:!1})}function Ce(e){return new w({uniforms:{uTime:e.uTime,uPulse:e.uPulse,uColA:{value:new S(`#27f2c0`)},uAccent:e.uAccent,uFogColor:e.uFogColor,uFogDensity:e.uFogDensity},vertexShader:be,fragmentShader:xe,blending:2,transparent:!0,depthWrite:!1})}var we=`
attribute vec3 aStart;
attribute vec3 aDir;
attribute vec4 aParam; // x: speed (laps/sec)  y: phase  z: lane length  w: streak length
attribute vec3 aColor;
attribute float aThick;
varying vec2 vQuv;
varying vec3 vCol;
varying float vFade;
uniform float uTime;
uniform float uFogDensity;
void main(){
  float t = fract(uTime * aParam.x + aParam.y);
  vec3 center = aStart + aDir * (t * aParam.z);
  vec3 toCam = normalize(cameraPosition - center);
  vec3 side = normalize(cross(aDir, toCam));
  vec3 p = center + aDir * (position.x * aParam.w) + side * (position.y * aThick);
  vQuv = uv;
  vCol = aColor;
  vFade = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.94, t);
  vFade *= exp(-length(cameraPosition - p) * uFogDensity * 0.9);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`,K=`
precision highp float;
varying vec2 vQuv;
varying vec3 vCol;
varying float vFade;
void main(){
  float body = pow(vQuv.x, 2.0);
  float across = pow(max(0.0, 1.0 - abs(vQuv.y - 0.5) * 2.0), 1.6);
  vec3 col = mix(vCol * 0.85, vec3(1.15), pow(vQuv.x, 6.0));
  float a = across * (0.12 + body) * vFade;
  gl_FragColor = vec4(col * a, a);
}
`;function Te(e){return new w({uniforms:{uTime:e.uTime,uFogDensity:e.uFogDensity},vertexShader:we,fragmentShader:K,blending:2,transparent:!0,depthWrite:!1,side:2})}var q=`
attribute float aPhase;
attribute vec3 aCol;
varying vec3 vCol;
varying float vTw;
varying float vExt;
uniform float uTime;
uniform float uFogDensity;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.7 + aPhase * 6.283) * 2.4;
  p.x += sin(uTime * 0.23 + aPhase * 9.0) * 3.0;
  p.z += cos(uTime * 0.19 + aPhase * 7.0) * 3.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = max(0.1, -mv.z);
  gl_PointSize = clamp(300.0 / dist, 1.2, 8.0);
  vCol = aCol;
  vTw = 0.55 + 0.45 * sin(uTime * 2.6 + aPhase * 40.0);
  vTw += step(0.985, fract(uTime * 0.5 + aPhase * 3.7)) * 2.2; // strobe
  vExt = exp(-dist * uFogDensity);
  gl_Position = projectionMatrix * mv;
}
`,Ee=`
precision highp float;
varying vec3 vCol;
varying float vTw;
varying float vExt;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.05, length(c));
  gl_FragColor = vec4(vCol * vTw * a * vExt, a * vExt);
}
`;function De(e){return new w({uniforms:{uTime:e.uTime,uFogDensity:e.uFogDensity},vertexShader:q,fragmentShader:Ee,blending:2,transparent:!0,depthWrite:!1})}var J=`
varying vec2 vRuv;
varying vec3 vW;
void main(){
  vRuv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`,Y=`
precision highp float;
varying vec2 vRuv;
varying vec3 vW;
uniform float uTime;
uniform vec3 uAccent;
uniform float uCount;
uniform float uFlow;
${U}
void main(){
  float dash = pow(0.5 + 0.5 * sin((vRuv.x * uCount + uTime * uFlow) * 6.28318), 3.0);
  float dash2 = pow(0.5 + 0.5 * sin((vRuv.x * uCount * 0.5 - uTime * uFlow * 0.7) * 6.28318 + 2.1), 5.0);
  vec3 col = uAccent * (0.10 + dash * 0.85) + vec3(1.0, 0.85, 0.6) * dash2 * 0.30;
  float ext = fogExtinct(length(vW - cameraPosition));
  gl_FragColor = vec4(col * ext, 1.0);
}
`;function Oe(e,t,n){return new w({uniforms:{uTime:e.uTime,uAccent:e.uAccent,uCount:{value:t},uFlow:{value:n},uFogColor:e.uFogColor,uFogDensity:e.uFogDensity},vertexShader:J,fragmentShader:Y,blending:2,transparent:!0,depthWrite:!1})}var ke=`
varying vec2 vCuv;
void main(){
  vCuv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ae=`
precision highp float;
varying vec2 vCuv;
uniform float uTime;
uniform float uNear;
uniform float uWind;
uniform float uScale;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform vec3 uAccent;
${V}
${H}
void main(){
  vec2 p = (vCuv - 0.5) * uScale;
  float n = fbm4(p + vec2(uTime * uWind, uTime * uWind * 0.6));
  n += fbm4(p * 2.7 - vec2(uTime * uWind * 1.7, 0.0)) * 0.4;
  float radial = smoothstep(0.5, 0.18, length(vCuv - 0.5));
  float a = smoothstep(0.42, 0.9, n) * radial * uNear * 0.85;
  vec3 col = mix(uTintA, uTintB, smoothstep(0.3, 1.0, n));
  col += uAccent * 0.06;
  gl_FragColor = vec4(col, a);
}
`;function je(e,t,n,r,i){return new w({uniforms:{uTime:e.uTime,uNear:{value:1},uWind:{value:r},uScale:{value:i},uTintA:{value:new S(t)},uTintB:{value:new S(n)},uAccent:e.uAccent},vertexShader:ke,fragmentShader:Ae,transparent:!0,depthWrite:!1,side:2})}var Me=`
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`,Ne=`
precision highp float;
varying vec3 vW;
uniform float uTime;
uniform vec3 uAccent;
uniform float uAlt;
${V}
${U}
void main(){
  vec2 g = vW.xz;
  // grid: minor 26m, major 130m
  vec2 mnr = abs(fract(g / 26.0) - 0.5) * 26.0;
  float minor = smoothstep(0.55, 0.10, min(mnr.x, mnr.y));
  vec2 mjr = abs(fract(g / 130.0) - 0.5) * 130.0;
  float major = smoothstep(1.1, 0.25, min(mjr.x, mjr.y));
  vec3 col = vec3(0.010, 0.014, 0.022);
  col += vec3(0.10, 0.35, 0.45) * minor * 0.30;
  col += vec3(0.16, 0.50, 0.60) * major * 0.45;
  // arterial avenues every 260m along x, carrying moving traffic dashes
  float av = smoothstep(2.2, 0.5, abs(mod(g.x + 130.0, 260.0) - 130.0));
  float dash = pow(0.5 + 0.5 * sin(g.y * 0.11 - uTime * 2.2), 12.0);
  col += vec3(1.0, 0.72, 0.42) * dash * av * 0.55;
  float av2 = smoothstep(2.2, 0.5, abs(mod(g.y + 130.0, 260.0) - 130.0));
  float dash2 = pow(0.5 + 0.5 * sin(g.x * 0.09 + uTime * 1.7), 12.0);
  col += vec3(0.5, 0.8, 1.0) * dash2 * av2 * 0.4;
  // landing beacon — pulsing accent rings around the spire base
  float r = length(g);
  float ring = pow(0.5 + 0.5 * sin(r * 0.16 - uTime * 1.6), 6.0) * smoothstep(340.0, 40.0, r);
  col += uAccent * ring * (0.25 + 0.75 * uAlt);
  float pad = smoothstep(30.0, 26.0, r) * (0.4 + 0.3 * sin(uTime * 2.0));
  col += uAccent * pad;
  col = applyFog(col, length(vW - cameraPosition));
  gl_FragColor = vec4(col, 1.0);
}
`;function Pe(e){return new w({uniforms:{uTime:e.uTime,uAccent:e.uAccent,uAlt:e.uAlt,uFogColor:e.uFogColor,uFogDensity:e.uFogDensity},vertexShader:Me,fragmentShader:Ne})}var Fe=`
varying vec3 vDir;
void main(){
  vDir = position; // sphere is centred on the camera every frame
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ie=`
precision highp float;
varying vec3 vDir;
uniform float uTime;
uniform float uAlt;
uniform vec3 uAccent;
${V}
${H}
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 top = mix(vec3(0.010, 0.012, 0.040), vec3(0.006, 0.008, 0.022), uAlt);
  vec3 hor = mix(vec3(0.045, 0.09, 0.15), vec3(0.34, 0.17, 0.06), uAlt * uAlt);
  vec3 col = mix(hor, top, smoothstep(-0.06, 0.42, h));
  // city glow dome hugging the horizon, grows on approach
  col += vec3(0.30, 0.16, 0.05) * pow(max(0.0, 1.0 - abs(h + 0.02) * 3.2), 2.0) * uAlt * 0.7;
  // star cells (fade out as you sink into the haze)
  vec2 sc = vec2(atan(d.z, d.x) * 1.9099, asin(clamp(d.y, -1.0, 1.0)) * 3.8197);
  vec2 cell = floor(sc * 22.0);
  vec2 f = fract(sc * 22.0);
  vec2 sp = hash22(cell) * 0.8 + 0.1;
  float mag = hash12(cell + 7.7);
  float star = smoothstep(0.06 + mag * 0.05, 0.0, length(f - sp)) * step(0.72, mag);
  star *= 0.55 + 0.45 * sin(uTime * (1.0 + mag * 2.0) + mag * 40.0);
  col += vec3(0.8, 0.9, 1.0) * star * (1.0 - uAlt) * smoothstep(0.02, 0.3, h);
  // aurora ribbons (seam-free: noise fed by direction, not angle)
  vec2 ap = d.xz * 2.2 + vec2(0.0, d.y * 4.0);
  float aur = smoothstep(0.55, 0.95, fbm4(ap - uTime * 0.03)) * smoothstep(0.15, 0.55, h) * (1.0 - uAlt);
  col += mix(vec3(0.05, 0.55, 0.42), vec3(0.30, 0.20, 0.65), fbm4(ap * 0.4 + uTime * 0.02)) * aur * 0.35;
  // division accent breathing in the atmosphere
  col += uAccent * pow(max(0.0, 1.0 - abs(h) * 2.6), 3.0) * 0.05;
  // moon
  float dm = dot(d, normalize(vec3(0.55, 0.34, -0.72)));
  float disc = smoothstep(0.99930, 0.99965, dm);
  float glow = pow(max(dm, 0.0), 700.0);
  col += (disc * vec3(0.85, 0.9, 1.0) + glow * vec3(0.35, 0.45, 0.65)) * (0.35 + 0.65 * (1.0 - uAlt));
  gl_FragColor = vec4(col, 1.0);
}
`;function Le(e){return new w({uniforms:{uTime:e.uTime,uAlt:e.uAlt,uAccent:e.uAccent},vertexShader:Fe,fragmentShader:Ie,side:1,depthWrite:!1})}var Re=`
varying vec2 vVuv;
void main(){
  vVuv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,ze=`
precision highp float;
varying vec2 vVuv;
uniform float uTime;
uniform float uVeil;
${V}
${H}
void main(){
  float n = fbm4(vVuv * 3.0 + uTime * 0.35);
  float a = uVeil * (0.75 + 0.25 * n);
  gl_FragColor = vec4(vec3(0.80, 0.88, 1.0), a);
}
`;function Be(e){return new w({uniforms:{uTime:e.uTime,uVeil:e.uVeil},vertexShader:Re,fragmentShader:ze,transparent:!0,depthWrite:!1,depthTest:!1})}var X={FLOORS:250,SPIRE_H:1e3,ORBIT_R:112,CAM_TOP:1035,CAM_END:9,HELIX:{x:64,z:-10,r:15,y0:6,y1:992,n:200},CLOUDS:[795,862,918]};function Ve(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function He(e,t,n,r,i){let a=X.CAM_TOP+(X.CAM_END-X.CAM_TOP)*e,o=-.6+e*2.35,s=X.ORBIT_R+Math.sin(e*Math.PI*3)*7;t.set(Math.cos(o)*s,a,Math.sin(o)*s);let c=Math.max(a-34-e*40,10);n.set(r*16,c-i*12,0)}function Ue(e){let t=Ve(1789),n=new d,r=_e(),i=[],a=[],o=e=>(i.push(e),e),s=e=>(a.push(e),e),c=new m,l=new h,u=new T,_=new T,S=e===`mobile`?130:300,C=o(new te(1,1,1)),w=new f(C,s(ye(r,!1)),S),oe=new Float32Array(S);{let e=0,n=0;for(;e<S&&n++<S*40;){let n,r,i;if(e<10){let e=1.75+Math.PI+(t()-.5)*2.4,a=58+t()*30;n=Math.cos(e)*a,r=Math.sin(e)*a,i=34+t()*90}else{let e=t()*Math.PI*2,a=150+Math.sqrt(t())*680;n=Math.cos(e)*a,r=Math.sin(e)*a,i=46+t()**2.4*330,t()<.05&&(i=470+t()*200)}if(Math.hypot(n-X.HELIX.x,r-X.HELIX.z)<X.HELIX.r+26)continue;let a=13+t()*24,o=13+t()*24;c.compose(u.set(n,i/2,r),l,_.set(a,i,o)),w.setMatrixAt(e,c),oe[e]=t(),e++}}C.setAttribute(`aSeed`,new v(oe,1)),w.instanceMatrix.needsUpdate=!0,w.frustumCulled=!1,n.add(w);let E=[27,24,21,18,15,11],se=[.14,.17,.18,.17,.17,.17],D=o(new ae(1,1,1,18,1)),O=new f(D,s(ye(r,!0)),E.length+1),k=new Float32Array(E.length+1),ce=new Float32Array(E.length+1);{let e=0;for(let t=0;t<E.length;t++){let n=se[t]*X.SPIRE_H;c.compose(u.set(0,e+n/2,0),l,_.set(E[t],n,E[t])),O.setMatrixAt(t,c),k[t]=.31+t*.11,ce[t]=E[t],e+=n}c.compose(u.set(0,X.SPIRE_H+34,0),l,_.set(.9,68,.9)),O.setMatrixAt(E.length,c),k[E.length]=.77,ce[E.length]=.9}D.setAttribute(`aSeed`,new v(k,1)),D.setAttribute(`aRad`,new v(ce,1)),O.instanceMatrix.needsUpdate=!0,O.frustumCulled=!1,n.add(O);let A=new d;A.position.set(X.HELIX.x,0,X.HELIX.z);let j=X.HELIX,M=j.n*2,N=o(new ne(1.15,10,8)),P=new f(N,s(Se(r)),M),le=new Float32Array(M),ue=new Float32Array(M),de=Math.PI*2/64;for(let e=0;e<2;e++)for(let t=0;t<j.n;t++){let n=t/(j.n-1),r=j.y0+(j.y1-j.y0)*n,i=r*de+e*Math.PI+.9;c.compose(u.set(Math.cos(i)*j.r,r,Math.sin(i)*j.r),l,_.set(1,1,1));let a=e*j.n+t;P.setMatrixAt(a,c),le[a]=n,ue[a]=e}N.setAttribute(`aPhase`,new v(le,1)),N.setAttribute(`aStrand`,new v(ue,1)),P.instanceMatrix.needsUpdate=!0,P.frustumCulled=!1,A.add(P);let F=Math.floor(j.n/5),fe=o(new ae(.22,.22,1,6,1)),I=new f(fe,s(Ce(r)),F),pe=new Float32Array(F),L=new Float32Array(F),me=new h,he=new T(0,1,0),ge=new T;for(let e=0;e<F;e++){let t=e*5/(j.n-1),n=j.y0+(j.y1-j.y0)*t,r=n*de+.9;ge.set(Math.cos(r),0,Math.sin(r)),me.setFromUnitVectors(he,ge),c.compose(u.set(0,n,0),me,_.set(1,j.r*2-2.6,1)),I.setMatrixAt(e,c),pe[e]=t,L[e]=e%2}fe.setAttribute(`aPhase`,new v(pe,1)),fe.setAttribute(`aStrand`,new v(L,1)),I.instanceMatrix.needsUpdate=!0,I.frustumCulled=!1,A.add(I),n.add(A);let R=(e===`mobile`?60:140)+3,z=new y(1,1),B=new p;B.index=z.index,B.setAttribute(`position`,z.getAttribute(`position`)),B.setAttribute(`uv`,z.getAttribute(`uv`)),o(B),o(z);let V=new Float32Array(R*3),H=new Float32Array(R*3),U=new Float32Array(R*4),W=new Float32Array(R*3),ve=new Float32Array(R),be=(e,n,r,i,a,o,s,c,l,u,d,f)=>{let p=Math.cos(a),m=Math.sin(a);V[e*3]=n-p*o/2,V[e*3+1]=r,V[e*3+2]=i-m*o/2,H[e*3]=p,H[e*3+1]=0,H[e*3+2]=m,U[e*4]=s/o,U[e*4+1]=t(),U[e*4+2]=o,U[e*4+3]=c,W[e*3]=u,W[e*3+1]=d,W[e*3+2]=f,ve[e]=l};for(let e=0;e<R-3;e++){let n=40+t()*920,r=600+t()*900,i=t(),a=i<.62?[.81,.91,1]:i<.86?[1,.7,.42]:[.15,.95,.75];be(e,(t()-.5)*700,n,(t()-.5)*700,t()*Math.PI*2,r,14+t()*30,7+t()*10,.3+t()*.5,a[0],a[1],a[2])}let G=new T,xe=new T;[.3,.58,.86].forEach((e,t)=>{He(e,G,xe,0,0);let n=G.clone().setY(0).normalize(),r=Math.atan2(-n.x,n.z);be(R-3+t,G.x+n.x*14,G.y-3,G.z+n.z*14,r,760,64,22,1.15,1,.98,.92)}),B.setAttribute(`aStart`,new v(V,3)),B.setAttribute(`aDir`,new v(H,3)),B.setAttribute(`aParam`,new v(U,4)),B.setAttribute(`aColor`,new v(W,3)),B.setAttribute(`aThick`,new v(ve,1)),B.instanceCount=R;let we=new g(B,s(Te(r)));we.frustumCulled=!1,n.add(we);let K=(e===`mobile`?24:54)+2,q=new Float32Array(K*3),Ee=new Float32Array(K),J=new Float32Array(K*3);for(let e=0;e<K-2;e++){let n=t()*Math.PI*2,r=60+t()*360;q[e*3]=Math.cos(n)*r,q[e*3+1]=50+t()*770,q[e*3+2]=Math.sin(n)*r,Ee[e]=t();let i=t(),a=i<.3?[1,.33,.2]:i<.8?[.9,.95,1]:[.15,.95,.75];J[e*3]=a[0],J[e*3+1]=a[1],J[e*3+2]=a[2]}for(let e=0;e<2;e++){let t=K-2+e;q[t*3]=0,q[t*3+1]=X.SPIRE_H+8+e*52,q[t*3+2]=0,Ee[t]=e*.5,J[t*3]=1,J[t*3+1]=.22,J[t*3+2]=.15}let Y=o(new re);Y.setAttribute(`position`,new x(q,3)),Y.setAttribute(`aPhase`,new x(Ee,1)),Y.setAttribute(`aCol`,new x(J,3));let ke=new b(Y,s(De(r)));ke.frustumCulled=!1,n.add(ke);for(let e of[{y:250,r:46,count:22,flow:.5},{y:500,r:60,count:30,flow:-.35},{y:750,r:50,count:26,flow:.42}]){let t=new g(o(new ie(e.r,.55,6,160)),s(Oe(r,e.count,e.flow)));t.rotation.x=Math.PI/2,t.position.y=e.y,t.frustumCulled=!1,n.add(t)}let Ae=[],Me=[{y:X.CLOUDS[0],tintA:`#0c1524`,tintB:`#3a4f6e`,wind:.01,scale:7},{y:X.CLOUDS[1],tintA:`#0e1828`,tintB:`#48607f`,wind:.014,scale:9},{y:X.CLOUDS[2],tintA:`#101a2c`,tintB:`#566e8e`,wind:.008,scale:6},{y:18,tintA:`#1c1206`,tintB:`#4e3417`,wind:.006,scale:5}];for(let e of Me){let t=o(new y(1700,1700)),i=s(je(r,e.tintA,e.tintB,e.wind,e.scale)),a=new g(t,i);a.rotation.x=-Math.PI/2,a.position.y=e.y,a.frustumCulled=!1,n.add(a),Ae.push({mat:i,y:e.y})}let Ne=new g(o(new ee(1700,64)),s(Pe(r)));Ne.rotation.x=-Math.PI/2,Ne.position.y=.4,Ne.frustumCulled=!1,n.add(Ne);let Fe=new g(o(new ne(1900,24,16)),s(Le(r)));Fe.renderOrder=-1,Fe.frustumCulled=!1,n.add(Fe);let Ie=new g(o(new y(2,2)),s(Be(r)));return Ie.renderOrder=999,Ie.frustumCulled=!1,n.add(Ie),{group:n,shared:r,helixGroup:A,sky:Fe,veil:Ie,cloudMats:Ae,dispose:()=>{i.forEach(e=>e.dispose()),a.forEach(e=>e.dispose()),w.dispose(),O.dispose(),P.dispose(),I.dispose()}}}var Z=n(),We=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches,Ge=new S(`#0a1226`),Ke=new S(`#14253d`),qe=new S(`#2b1a10`),Je=e=>{let t=_.clamp(e,0,1);return t*t*(3-2*t)};function Ye({tier:e}){let n=(0,j.useMemo)(()=>Ue(e),[e]);(0,j.useEffect)(()=>()=>n.dispose(),[n]);let r=(0,j.useRef)(0),i=(0,j.useRef)(new T),a=(0,j.useRef)(new T),o=(0,j.useRef)(new S(`#0a1226`)),s=(0,j.useRef)(new S),c=(0,j.useRef)(new S(`#27f2c0`)),u=(0,j.useRef)(0),d=(0,j.useRef)(0),f=l(e=>e.camera);return(0,j.useEffect)(()=>{He(B.descent,i.current,a.current,0,0),r.current=B.descent,f.position.copy(i.current),f.lookAt(a.current)},[f]),t((e,t)=>{let l=Math.min(t,1/30),p=n.shared,m=We();p.uTime.value+=l;let h=_.clamp(B.descent,0,1);r.current=m?h:_.damp(r.current,h,7,l),He(r.current,i.current,a.current,B.pointerX,B.pointerY),f.position.copy(i.current),f.lookAt(a.current);let g=1-(f.position.y-X.CAM_END)/(X.CAM_TOP-X.CAM_END);p.uAlt.value=_.clamp(g,0,1),g<.55?s.current.copy(Ge).lerp(Ke,g/.55):s.current.copy(Ke).lerp(qe,(g-.55)/.45),c.current.set(B.divisionColor),p.uAccent.value.lerp(c.current,m?1:1-.002**l),s.current.lerp(p.uAccent.value,.1),o.current.lerp(s.current,m?1:1-.001**l),p.uFogColor.value.copy(o.current);let v=0,y=0;for(let{mat:e,y:t}of n.cloudMats){let n=Math.abs(f.position.y-t);e.uniforms.uNear.value=Je((n-10)/40),t>100&&(v=Math.max(v,Math.exp(-(((f.position.y-t)/15)**2))),y=Math.max(y,Math.exp(-(((f.position.y-t)/32)**2))))}p.uVeil.value=v*.82,n.veil.visible=p.uVeil.value>.001,p.uFogDensity.value=.0026+g*9e-4+y*.004,B.chapter!==u.current&&(u.current=B.chapter,d.current=1),d.current=Math.max(0,d.current-l*.5),p.uPulse.value-=l*(.1+d.current*.55),p.uPulse.value<-.15&&(p.uPulse.value=1.15),n.helixGroup.rotation.y+=l*.1,n.sky.position.copy(f.position)}),(0,Z.jsx)(`primitive`,{object:n.group})}function Xe({webgl:e=!0}){let[t,n]=(0,j.useState)(!1),[r,s]=(0,j.useState)(!1),[l,u]=(0,j.useState)(!0),d=(0,j.useMemo)(()=>typeof window<`u`&&(se||window.innerWidth<760||matchMedia(`(hover: none)`).matches)?`mobile`:`desktop`,[]);return(0,j.useEffect)(()=>{if(!e)return;let t=document.querySelector(`main.act2`);if(!t)return;let r=new IntersectionObserver(([e])=>{e.isIntersecting&&n(!0)},{rootMargin:`120% 0px 120% 0px`});return r.observe(t),()=>r.disconnect()},[e]),(0,j.useEffect)(()=>{if(!t)return;let e=B.inAct2>0;u(!e);let n=()=>{let t=B.inAct2>0;t!==e&&(e=t,u(!t))};return window.addEventListener(`scroll`,n,{passive:!0}),()=>window.removeEventListener(`scroll`,n)},[t]),(0,j.useEffect)(()=>{if(!t)return;let e=document.querySelectorAll(`.portal`);if(!e.length)return;let n=new Set,r=new IntersectionObserver(e=>{let t=window.innerHeight;for(let r of e)r.intersectionRect.height>t*.85?n.add(r.target):n.delete(r.target);s(n.size>0)},{threshold:[0,.05,.1,.15,.2,.25,.3,.35,.4,.5,.6,.7,.8,.9,1]});return e.forEach(e=>r.observe(e)),()=>r.disconnect()},[t]),e?(0,Z.jsx)(`div`,{className:`city-fix${r?` is-covered`:``}`,"aria-hidden":`true`,children:t&&(0,Z.jsxs)(a,{gl:{alpha:!1,antialias:!1,powerPreference:`high-performance`},dpr:se?[1,1]:D||d===`mobile`?[1,1.25]:[1,1.5],camera:{fov:55,near:.5,far:2600,position:[0,X.CAM_TOP,X.ORBIT_R]},frameloop:r||l?`never`:`always`,children:[(0,Z.jsx)(Ye,{tier:d}),(0,Z.jsxs)(c,{multisampling:0,children:[(0,Z.jsx)(o,{mipmapBlur:!0,resolutionScale:se?.5:1,intensity:.85,luminanceThreshold:.5,luminanceSmoothing:.8}),(0,Z.jsx)(i,{eskil:!1,offset:.22,darkness:.72})]})]})}):null}k.registerPlugin(O);var Q=z.capabilities;function Ze(){let e=(0,j.useRef)(null),t=(0,j.useRef)(null),n=(0,j.useRef)([]),[r,i]=(0,j.useState)(0);return(0,j.useEffect)(()=>{let r=e.current,a=t.current;if(!r||!a)return;let o=Q.length,s=k.quickSetter(a,`x`,`px`),c=O.create({trigger:r,start:`top top`,end:`bottom bottom`,scrub:!0,onUpdate:e=>{let t=e.progress;B.galleryProgress=t,s(-t*(o-1)*window.innerWidth);let r=t*(o-1);n.current.forEach((e,t)=>{if(!e)return;let n=t-r,i=Math.max(0,1-Math.abs(n)*1.1)**2.2;e.style.setProperty(`--off`,String(n)),e.style.setProperty(`--foc`,String(i))});let a=Math.max(0,Math.min(o-1,Math.round(r)));B.divisionColor=Q[a].a,B.hudLabel=Q[a].tag,i(e=>e===a?e:a)}});return()=>c.kill()},[]),(0,Z.jsx)(`section`,{className:`filmstrip`,ref:e,"aria-label":`The divisions of the Spire`,"data-division":`THE DIVISIONS`,"data-tour":`2000`,children:(0,Z.jsxs)(`div`,{className:`film-stage`,children:[(0,Z.jsx)(`div`,{className:`film-track`,ref:t,children:Q.map((e,t)=>(0,Z.jsxs)(`article`,{className:`film-panel`,ref:e=>{n.current[t]=e},"data-on":t===r,style:{"--cap-a":e.a},children:[(0,Z.jsx)(`span`,{className:`film-numeral`,"aria-hidden":`true`,children:e.no}),(0,Z.jsxs)(`div`,{className:`film-copy`,children:[(0,Z.jsx)(`span`,{className:`film-tag`,children:e.tag}),(0,Z.jsx)(`h3`,{className:`film-title`,children:e.title}),(0,Z.jsx)(`p`,{className:`film-blurb`,children:e.blurb}),(0,Z.jsx)(`ul`,{className:`film-bullets`,children:e.bullets.map(e=>(0,Z.jsx)(`li`,{children:e},e))})]})]},e.id))}),(0,Z.jsxs)(`div`,{className:`film-index`,"aria-hidden":`true`,children:[(0,Z.jsxs)(`span`,{className:`film-index-no`,children:[Q[r].no,(0,Z.jsxs)(`i`,{children:[`/ `,String(Q.length).padStart(2,`0`)]})]}),(0,Z.jsx)(`div`,{className:`film-rail`,children:(0,Z.jsx)(`span`,{className:`film-rail-fill`,style:{width:`${r/(Q.length-1)*100}%`}})}),(0,Z.jsx)(`span`,{className:`film-index-label`,children:Q[r].title})]})]})})}var Qe={portal:{kicker:`STREET LEVEL · THE DESCENT ENDS HERE`,title:[`Get your AI`,`into production.`],body:`Tell us the work you keep doing by hand. We’ll wire the voice, the agents and the automations that make it run itself. Then we’ll keep them alive. First door: a fixed-fee Signal Audit, yours to keep.`,button:`Start with a Signal Audit`,email:`hello@hanflux.ai`,socials:[{label:`Email`,href:`mailto:hello@hanflux.ai`},{label:`Legal`,href:`/legal`}]}};k.registerPlugin(O,ce);var $e=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function $({children:e,as:t=`h2`,className:n,start:r=`top 84%`,stagger:i=.018,duration:a=.9,y:o=`110%`,once:s=!0}){let c=(0,j.useRef)(null);return(0,j.useEffect)(()=>{let e=c.current;if(!e||(e.style.opacity=`1`,$e()))return;let t=null,n=k.context(()=>{t=new ce(e,{type:`lines,chars`,linesClass:`kline`,charsClass:`kchar`,autoSplit:!0}),k.set(e,{opacity:1}),k.from(t.chars,{yPercent:parseFloat(o),rotateX:-70,opacity:0,transformOrigin:`50% 100% -20px`,duration:a,ease:`power3.out`,stagger:i,scrollTrigger:{trigger:e,start:r,once:s}})},e);return()=>{t?.revert(),n.revert()}},[]),(0,j.createElement)(t,{ref:c,className:n,style:{opacity:0,perspective:600}},e)}function et({children:e,as:t=`button`,className:n,strength:r=.4,radius:i=90,...a}){let o=(0,j.useRef)(null);return(0,j.useEffect)(()=>{let e=o.current;if(!e||$e()||matchMedia(`(hover: none)`).matches)return;let t=k.quickTo(e,`x`,{duration:.6,ease:`power3.out`}),n=k.quickTo(e,`y`,{duration:.6,ease:`power3.out`}),a=a=>{let o=e.getBoundingClientRect(),s=o.left+o.width/2,c=o.top+o.height/2,l=a.clientX-s,u=a.clientY-c;if(Math.hypot(l,u)>i+Math.max(o.width,o.height)/2){t(0),n(0);return}t(l*r),n(u*r)},s=()=>{t(0),n(0)};return window.addEventListener(`pointermove`,a,{passive:!0}),e.addEventListener(`pointerleave`,s),()=>{window.removeEventListener(`pointermove`,a),e.removeEventListener(`pointerleave`,s)}},[i,r]),(0,j.createElement)(t,{ref:o,className:n,"data-hover":``,...a},e)}function tt(e,t=`.kreveal`){(0,j.useEffect)(()=>{let n=e.current;if(!n)return;let r=n.querySelectorAll(t);if(!r.length)return;if($e()){k.set(r,{opacity:1,y:0});return}let i=k.context(()=>{r.forEach(e=>k.fromTo(e,{y:44,opacity:0},{y:0,opacity:1,duration:.9,ease:`power3.out`,scrollTrigger:{trigger:e,start:`top 86%`,once:!0}}))},n);return()=>i.revert()},[])}var nt=`
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
`,rt=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,it=`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec2  uPointer;   // -1..1
uniform float uIntensity; // 0..1 focus
uniform float uReveal;    // 0..1 entrance wipe
${nt}
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
`,at=u({uTime:0,uColorA:new S(`#27f2c0`),uColorB:new S(`#0a1c2e`),uColorC:new S(`#7c5cff`),uPointer:new C(0,0),uIntensity:1,uReveal:0},rt,it),ot=`
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
`,st=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform float uHover;     // 0..1
uniform vec2  uPointer;   // 0..1 local within the tile
uniform float uReveal;    // 0..1
uniform vec3  uTint;
uniform float uHasTex;    // 1 = sample texture, 0 = procedural tint only
${nt}
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
`,ct=u({uTex:null,uTime:0,uHover:0,uPointer:new C(.5,.5),uReveal:0,uTint:new S(`#27f2c0`),uHasTex:0},ot,st),lt=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ut=`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec2  uPointer;  // -1..1
uniform float uProgress; // 0..1 how "open" the portal is
uniform float uAspect;
${nt}
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
`;s({FlowFieldMaterial:at,ImageDistortMaterial:ct,PortalMaterial:u({uTime:0,uColorA:new S(`#27f2c0`),uColorB:new S(`#05060a`),uColorC:new S(`#7c5cff`),uPointer:new C(0,0),uProgress:0,uAspect:1},lt,ut)}),k.registerPlugin(O);var dt=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function ft(){let e=(0,j.useRef)(null),n=(0,j.useRef)(null),{viewport:r,size:i}=l();return t((t,a)=>{let o=Math.min(a,1/30);e.current&&e.current.scale.set(r.width,r.height,1);let s=n.current;if(!s)return;let c=dt();s.uTime+=o,s.uAspect=i.width/i.height,s.uPointer.set(B.pointerX,B.pointerY),c?s.uProgress=B.portalProgress:s.uProgress+=(Math.max(.001,B.portalProgress)-s.uProgress)*.05}),(0,Z.jsxs)(`mesh`,{ref:e,children:[(0,Z.jsx)(`planeGeometry`,{args:[1,1]}),(0,Z.jsx)(`portalMaterial`,{ref:n})]})}function pt(){return(0,Z.jsx)(a,{gl:{alpha:!1,antialias:!1,powerPreference:`high-performance`},dpr:D||se?[1,1]:[1,1.25],camera:{position:[0,0,2],fov:50},style:{position:`absolute`,inset:0},children:(0,Z.jsx)(ft,{})})}function mt({webgl:e=!0}){let t=(0,j.useRef)(null),[n,r]=(0,j.useState)(!1);(0,j.useEffect)(()=>{let e=t.current;if(!e)return;let n=O.create({trigger:e,start:`top bottom`,end:`center center`,scrub:!0,onUpdate:e=>{B.portalProgress=e.progress}});return()=>n.kill()},[]),(0,j.useEffect)(()=>{let n=t.current;if(!n)return;let i=new IntersectionObserver(([t])=>r(e&&t.isIntersecting),{rootMargin:`20% 0px 10% 0px`});return i.observe(n),()=>i.disconnect()},[e]);let{kicker:i,title:a,body:o,button:s,email:c,socials:l}=Qe.portal;return(0,Z.jsxs)(`section`,{className:`portal`,ref:t,id:`contact`,"data-tour":`3200`,"data-division":`STREET LEVEL`,"data-accent":`#27F2C0`,children:[(0,Z.jsx)(`div`,{className:`portal-canvas`,"aria-hidden":`true`,children:n?(0,Z.jsx)(pt,{}):(0,Z.jsx)(`div`,{className:`portal-fallback`})}),(0,Z.jsx)(`div`,{className:`portal-scrim`,"aria-hidden":`true`}),(0,Z.jsxs)(`div`,{className:`portal-ui`,children:[(0,Z.jsx)(`p`,{className:`kicker`,children:i}),(0,Z.jsx)($,{as:`h2`,className:`portal-title`,start:`top 88%`,stagger:.022,children:a.join(` `)}),(0,Z.jsx)(`p`,{className:`portal-body`,children:o}),(0,Z.jsxs)(et,{as:`a`,className:`portal-cta`,href:`mailto:${c}`,strength:.45,children:[(0,Z.jsx)(`span`,{children:s}),(0,Z.jsx)(`span`,{className:`portal-cta-ring`,"aria-hidden":`true`})]}),(0,Z.jsx)(`a`,{className:`portal-email`,href:`mailto:${c}`,"data-hover":!0,children:c}),(0,Z.jsx)(`ul`,{className:`portal-socials`,children:l.map(e=>(0,Z.jsx)(`li`,{children:(0,Z.jsx)(`a`,{href:e.href,"data-hover":!0,target:`_blank`,rel:`noreferrer noopener`,children:e.label})},e.label))})]}),(0,Z.jsxs)(`footer`,{className:`portal-foot`,children:[(0,Z.jsx)(`span`,{children:`Hanflux AI`}),(0,Z.jsx)(`span`,{children:`the autonomous layer`}),(0,Z.jsx)(`span`,{children:`© 2026`})]})]})}k.registerPlugin(O);var ht=E.length,gt=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function _t({webgl:e=!0}){let t=(0,j.useRef)(null),n=(0,j.useRef)(null),r=(0,j.useRef)(null),i=(0,j.useRef)(null),a=(0,j.useRef)(null),o=(0,j.useRef)(null),s=(0,j.useRef)(-1);return(0,j.useEffect)(()=>{let e=matchMedia(`(prefers-reduced-motion: reduce)`).matches,n=new R({lerp:e?1:.09,smoothWheel:!e,wheelMultiplier:1,autoRaf:!1,prevent:e=>!!e?.closest?.(`.chatnav`)});t.current=n,window.__lenis=n,n.on(`scroll`,O.update);let c=e=>n.raf(e*1e3);k.ticker.add(c),k.ticker.lagSmoothing(0),A.driven=!0;let l=null;r.current&&(l=O.create({trigger:r.current,start:`top top`,end:`bottom bottom`,scrub:!0,onUpdate:e=>{A.index=e.progress*(ht-1)}}));let u=!1;return n.on(`scroll`,({scroll:e})=>{let t=window.innerHeight,n=r.current?.offsetHeight??t,c=e>n-t*.9;B.inAct2=Math.min(1,Math.max(0,(e-(n-t))/t)),c!==u&&(u=c,document.body.classList.toggle(`in-act2`,c));let l=Math.max(0,n-t),d=document.body.scrollHeight-t-l,f=d>0?Math.min(1,Math.max(0,(e-l)/d)):0;B.descent=f,document.body.style.setProperty(`--city`,String(Math.min(1,B.inAct2*1.4)));let p=Math.round(f*100);p!==s.current&&(s.current=p,i.current&&(i.current.textContent=`${p}%`)),a.current&&a.current.textContent!==B.hudLabel&&(a.current.textContent=B.hudLabel),o.current&&(o.current.style.top=`${(f*100).toFixed(2)}%`)}),()=>{l?.kill(),A.driven=!1,k.ticker.remove(c),n.off(`scroll`,O.update),n.destroy(),delete window.__lenis,document.body.classList.remove(`in-act2`),document.body.style.removeProperty(`--city`),t.current=null}},[]),(0,j.useEffect)(()=>{let e=n.current;if(!e)return;let t=Array.from(e.querySelectorAll(`[data-division]`));if(!t.length)return;let r=new IntersectionObserver(e=>{for(let n of e){if(!n.isIntersecting)continue;let e=n.target;B.chapter=t.indexOf(e),B.hudLabel=e.dataset.division??B.hudLabel,a.current&&a.current.textContent!==B.hudLabel&&(a.current.textContent=B.hudLabel),e.dataset.accent&&(B.divisionColor=e.dataset.accent)}},{rootMargin:`-45% 0px -45% 0px`});return t.forEach(e=>r.observe(e)),()=>r.disconnect()},[]),(0,j.useEffect)(()=>{let e=e=>{B.pointerX=e.clientX/window.innerWidth*2-1,B.pointerY=e.clientY/window.innerHeight*2-1};return window.addEventListener(`pointermove`,e,{passive:!0}),()=>window.removeEventListener(`pointermove`,e)},[]),(0,j.useEffect)(()=>{let e=window.setTimeout(()=>{let e=oe.getState();e.loaded||(e.setIntro(1),e.setSection(`work`),e.setLoaded(!0))},7e3);return()=>window.clearTimeout(e)},[]),(0,j.useEffect)(()=>{let e=e=>{let n=e.target?.tagName;if(n===`INPUT`||n===`TEXTAREA`)return;let i=r.current,a=t.current;if(!i||!a)return;let o=Math.max(0,i.offsetHeight-window.innerHeight);if(window.scrollY>o+4)return;let s=o/Math.max(1,ht-1),c=Math.round(window.scrollY/s);e.key===`ArrowDown`||e.key===`ArrowRight`?(e.preventDefault(),a.scrollTo(Math.min(o,(c+1)*s),gt()?{immediate:!0}:{duration:.9})):(e.key===`ArrowUp`||e.key===`ArrowLeft`)&&(e.preventDefault(),a.scrollTo(Math.max(0,(c-1)*s),gt()?{immediate:!0}:{duration:.9}))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[]),tt(n,`.kreveal`),(0,Z.jsxs)(`div`,{className:`act2-root`,ref:n,children:[(0,Z.jsx)(`div`,{className:`act2-aurora`,"aria-hidden":`true`}),(0,Z.jsx)(Xe,{webgl:e}),(0,Z.jsxs)(`div`,{className:`spire-hud`,"aria-hidden":`true`,children:[(0,Z.jsxs)(`div`,{className:`hud-floor`,children:[(0,Z.jsx)(`span`,{className:`hud-floor-no`,ref:i,children:`0%`}),(0,Z.jsx)(`span`,{className:`hud-floor-label`,children:`DOWN`})]}),(0,Z.jsx)(`div`,{className:`hud-meta`,children:(0,Z.jsx)(`span`,{className:`hud-division`,ref:a,children:`THE CROWN`})}),(0,Z.jsxs)(`div`,{className:`hud-rail`,children:[(0,Z.jsxs)(`svg`,{className:`hud-helix`,viewBox:`0 0 24 300`,preserveAspectRatio:`none`,children:[(0,Z.jsx)(`path`,{d:`M6 0 C 20 25, 20 50, 6 75 C -8 100, -8 125, 6 150 C 20 175, 20 200, 6 225 C -8 250, -8 275, 6 300`}),(0,Z.jsx)(`path`,{d:`M18 0 C 4 25, 4 50, 18 75 C 32 100, 32 125, 18 150 C 4 175, 4 200, 18 225 C 32 250, 32 275, 18 300`})]}),(0,Z.jsx)(`span`,{className:`hud-dot`,ref:o})]})]}),(0,Z.jsx)(`div`,{className:`hero-scroll`,ref:r,"data-tour":`2600`,"aria-hidden":`true`,style:{height:`${100+(ht-1)*82}vh`}}),(0,Z.jsxs)(`button`,{className:`descend`,onClick:()=>t.current?.scrollTo(`#descent`,gt()?{immediate:!0}:{duration:1.6}),"data-hover":!0,"aria-label":`Begin the descent`,children:[(0,Z.jsx)(`span`,{className:`descend-label`,children:z.threshold.cue}),(0,Z.jsx)(`span`,{className:`descend-arrow`})]}),(0,Z.jsxs)(`button`,{className:`ascend`,onClick:()=>t.current?.scrollTo(0,gt()?{immediate:!0}:{duration:1.6}),"data-hover":!0,"aria-label":`Back to the surface`,children:[(0,Z.jsx)(`span`,{className:`ascend-arrow`}),(0,Z.jsx)(`span`,{children:`surface`})]}),(0,Z.jsxs)(`main`,{className:`act2`,children:[(0,Z.jsxs)(`section`,{className:`a2 threshold`,id:`descent`,"data-tour":`2400`,"data-division":`THE CROWN`,"data-accent":`#27F2C0`,children:[(0,Z.jsx)(`p`,{className:`kicker kreveal`,children:z.threshold.kicker}),(0,Z.jsx)($,{as:`h2`,className:`k-head k-xl`,start:`top 85%`,children:z.threshold.title.join(` `)}),(0,Z.jsx)(`p`,{className:`lede kreveal`,children:z.threshold.sub})]}),(0,Z.jsx)(Ze,{}),(0,Z.jsxs)(`section`,{className:`a2 loop`,"data-tour":`2200`,"data-division":`THE BUILD LOOP`,"data-accent":`#4EA8FF`,children:[(0,Z.jsxs)(`div`,{className:`loop-head`,children:[(0,Z.jsx)(`p`,{className:`kicker kreveal`,children:z.loop.kicker}),(0,Z.jsx)($,{as:`h2`,className:`k-head k-sm`,children:z.loop.title})]}),(0,Z.jsx)(`div`,{className:`loop-grid`,children:z.loop.steps.map(e=>(0,Z.jsxs)(`article`,{className:`loop-step glass kreveal`,children:[(0,Z.jsx)(`span`,{className:`ls-no`,children:e.no}),(0,Z.jsx)(`h3`,{className:`ls-title`,children:e.title}),(0,Z.jsx)(`p`,{className:`ls-body`,children:e.body})]},e.no))})]}),(0,Z.jsxs)(`section`,{className:`a2 buildlog`,"data-tour":`2200`,"data-division":`THE BUILD LOG`,"data-accent":`#7C5CFF`,children:[(0,Z.jsxs)(`div`,{className:`buildlog-head`,children:[(0,Z.jsx)(`p`,{className:`kicker kreveal`,children:z.buildLog.kicker}),(0,Z.jsx)($,{as:`h2`,className:`k-head k-sm`,children:z.buildLog.title}),(0,Z.jsx)(`p`,{className:`lede kreveal`,children:z.buildLog.sub})]}),(0,Z.jsx)(`ul`,{className:`buildlog-list`,children:z.buildLog.entries.map(e=>(0,Z.jsxs)(`li`,{className:`bl-row bl-${e.tag} kreveal`,children:[(0,Z.jsx)(`span`,{className:`bl-tag`,children:e.tag===`both`?`CLAUDE + N8N`:e.tag}),(0,Z.jsx)(`span`,{className:`bl-title`,children:e.title}),(0,Z.jsx)(`span`,{className:`bl-body`,children:e.body})]},e.title))})]}),(0,Z.jsxs)(`section`,{className:`a2 stack`,"data-tour":`2200`,"data-division":`THE STACK`,"data-accent":`#FFB36B`,children:[(0,Z.jsxs)(`div`,{className:`stack-head`,children:[(0,Z.jsx)(`p`,{className:`kicker kreveal`,children:z.stack.kicker}),(0,Z.jsx)($,{as:`h2`,className:`k-head k-sm`,children:z.stack.title})]}),(0,Z.jsx)(`div`,{className:`stack-grid`,children:z.stack.groups.map(e=>(0,Z.jsxs)(`div`,{className:`stack-group kreveal`,children:[(0,Z.jsx)(`span`,{className:`sg-label`,children:e.label}),(0,Z.jsx)(`ul`,{className:`sg-items`,children:e.items.map(e=>(0,Z.jsx)(`li`,{children:e},e))})]},e.label))})]}),(0,Z.jsx)(`section`,{className:`a2 metrics`,"data-tour":`2200`,"data-division":`PROOF BAND`,"data-accent":`#27F2C0`,children:(0,Z.jsx)(`div`,{className:`metrics-row`,children:z.metrics.map(e=>(0,Z.jsxs)(`div`,{className:`metric kreveal`,children:[(0,Z.jsx)(`span`,{className:`m-v`,children:e.v}),(0,Z.jsx)(`span`,{className:`m-l`,children:e.l})]},e.l))})}),(0,Z.jsxs)(`section`,{className:`a2 engage`,"data-tour":`2200`,"data-division":`WAYS IN`,"data-accent":`#9AE6FF`,children:[(0,Z.jsxs)(`div`,{className:`engage-head`,children:[(0,Z.jsx)(`p`,{className:`kicker kreveal`,children:z.engage.kicker}),(0,Z.jsx)($,{as:`h2`,className:`k-head k-sm`,children:z.engage.title}),(0,Z.jsx)(`p`,{className:`lede kreveal`,children:z.engage.sub})]}),(0,Z.jsx)(`div`,{className:`engage-tiers`,children:z.engage.tiers.map(e=>(0,Z.jsxs)(`article`,{className:`tier glass kreveal`,children:[(0,Z.jsx)(`span`,{className:`tier-no`,children:e.no}),(0,Z.jsxs)(`div`,{className:`tier-top`,children:[(0,Z.jsx)(`h3`,{className:`tier-name`,children:e.name}),(0,Z.jsx)(`span`,{className:`tier-window`,children:e.window})]}),(0,Z.jsx)(`span`,{className:`tier-price`,children:e.price}),(0,Z.jsx)(`p`,{className:`tier-body`,children:e.body})]},e.no))}),(0,Z.jsxs)(`div`,{className:`engage-retainer glass kreveal`,children:[(0,Z.jsx)(`span`,{className:`er-name`,children:z.engage.retainer.name}),(0,Z.jsx)(`span`,{className:`er-price`,children:z.engage.retainer.price}),(0,Z.jsx)(`p`,{className:`er-body`,children:z.engage.retainer.body})]}),(0,Z.jsx)(`div`,{className:`trust-head kreveal`,children:(0,Z.jsx)(`p`,{className:`kicker`,children:z.trust.kicker})}),(0,Z.jsx)(`ul`,{className:`trust-strip`,children:z.trust.items.map(e=>(0,Z.jsxs)(`li`,{className:`trust-item kreveal`,children:[(0,Z.jsx)(`strong`,{children:e.title}),(0,Z.jsx)(`span`,{children:e.body})]},e.title))})]})]}),(0,Z.jsx)(mt,{webgl:e})]})}export{_t as DownwardWorld};