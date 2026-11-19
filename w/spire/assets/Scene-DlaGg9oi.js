import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{a as t,c as n,f as r,h as i,i as a,n as o,o as s,r as c,t as l,u}from"./postprocessing-B2huDWi8.js";import{a as d,i as f,n as p,o as m,r as h,t as g}from"./r3f-CO8VRv3T.js";import{$ as _,I as v,P as y,Q as b,S as x,U as S,V as ee,Z as C,a as w,d as T,dt as te,et as ne,ft as E,h as re,o as ie,q as ae,s as oe,tt as D,w as se,x as O,z as k}from"./three-BJD5cfNI.js";import{a as A,i as j,n as ce,r as M,t as le}from"./index-DnWcs_RJ.js";import{t as N}from"./heroNav-Bd2Rmfeq.js";import{r as ue,t as de}from"./CameraRig-DhIvPcRB.js";var P=e(i()),F=r();function fe(e,t,n){return Math.max(t,Math.min(e,n))}var I={toVector(e,t){return e===void 0&&(e=t),Array.isArray(e)?e:[e,e]},add(e,t){return[e[0]+t[0],e[1]+t[1]]},sub(e,t){return[e[0]-t[0],e[1]-t[1]]},addTo(e,t){e[0]+=t[0],e[1]+=t[1]},subTo(e,t){e[0]-=t[0],e[1]-=t[1]}};function pe(e,t,n){return t===0||Math.abs(t)===1/0?e**(n*5):e*t*n/(t+n*e)}function me(e,t,n,r=.15){return r===0?fe(e,t,n):e<t?-pe(t-e,n-t,r)+t:e>n?+pe(e-n,n-t,r)+n:e}function he(e,[t,n],[r,i]){let[[a,o],[s,c]]=e;return[me(t,a,o,r),me(n,s,c,i)]}function ge(e,t){if(typeof e!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(typeof r!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function _e(e){var t=ge(e,`string`);return typeof t==`symbol`?t:String(t)}function L(e,t,n){return t=_e(t),t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function ve(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function R(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?ve(Object(n),!0).forEach(function(t){L(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ve(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var ye={pointer:{start:`down`,change:`move`,end:`up`},mouse:{start:`down`,change:`move`,end:`up`},touch:{start:`start`,change:`move`,end:`end`},gesture:{start:`start`,change:`change`,end:`end`}};function be(e){return e?e[0].toUpperCase()+e.slice(1):``}var xe=[`enter`,`leave`];function Se(e=!1,t){return e&&!xe.includes(t)}function Ce(e,t=``,n=!1){let r=ye[e],i=r&&r[t]||t;return`on`+be(e)+be(i)+(Se(n,i)?`Capture`:``)}var we=[`gotpointercapture`,`lostpointercapture`];function Te(e){let t=e.substring(2).toLowerCase(),n=!!~t.indexOf(`passive`);n&&(t=t.replace(`passive`,``));let r=we.includes(t)?`capturecapture`:`capture`,i=!!~t.indexOf(r);return i&&(t=t.replace(`capture`,``)),{device:t,capture:i,passive:n}}function Ee(e,t=``){let n=ye[e];return e+(n&&n[t]||t)}function z(e){return`touches`in e}function De(e){return z(e)?`touch`:`pointerType`in e?e.pointerType:`mouse`}function Oe(e){return Array.from(e.touches).filter(t=>{var n,r;return t.target===e.currentTarget||((n=e.currentTarget)==null||(r=n.contains)==null?void 0:r.call(n,t.target))})}function ke(e){return e.type===`touchend`||e.type===`touchcancel`?e.changedTouches:e.targetTouches}function Ae(e){return z(e)?ke(e)[0]:e}function B(e,t){try{let n=t.clientX-e.clientX,r=t.clientY-e.clientY,i=(t.clientX+e.clientX)/2,a=(t.clientY+e.clientY)/2,o=Math.hypot(n,r);return{angle:-(Math.atan2(n,r)*180)/Math.PI,distance:o,origin:[i,a]}}catch{}return null}function je(e){return Oe(e).map(e=>e.identifier)}function Me(e,t){let[n,r]=Array.from(e.touches).filter(e=>t.includes(e.identifier));return B(n,r)}function V(e){let t=Ae(e);return z(e)?t.identifier:t.pointerId}function H(e){let t=Ae(e);return[t.clientX,t.clientY]}var Ne=40,Pe=800;function Fe(e){let{deltaX:t,deltaY:n,deltaMode:r}=e;return r===1?(t*=Ne,n*=Ne):r===2&&(t*=Pe,n*=Pe),[t,n]}function Ie(e){let{scrollX:t,scrollY:n,scrollLeft:r,scrollTop:i}=e.currentTarget;return[t??r??0,n??i??0]}function Le(e){let t={};if(`buttons`in e&&(t.buttons=e.buttons),`shiftKey`in e){let{shiftKey:n,altKey:r,metaKey:i,ctrlKey:a}=e;Object.assign(t,{shiftKey:n,altKey:r,metaKey:i,ctrlKey:a})}return t}function U(e,...t){return typeof e==`function`?e(...t):e}function Re(){}function ze(...e){return e.length===0?Re:e.length===1?e[0]:function(){let t;for(let n of e)t=n.apply(this,arguments)||t;return t}}function Be(e,t){return Object.assign({},t,e||{})}var Ve=32,He=class{constructor(e,t,n){this.ctrl=e,this.args=t,this.key=n,this.state||(this.state={},this.computeValues([0,0]),this.computeInitial(),this.init&&this.init(),this.reset())}get state(){return this.ctrl.state[this.key]}set state(e){this.ctrl.state[this.key]=e}get shared(){return this.ctrl.state.shared}get eventStore(){return this.ctrl.gestureEventStores[this.key]}get timeoutStore(){return this.ctrl.gestureTimeoutStores[this.key]}get config(){return this.ctrl.config[this.key]}get sharedConfig(){return this.ctrl.config.shared}get handler(){return this.ctrl.handlers[this.key]}reset(){let{state:e,shared:t,ingKey:n,args:r}=this;t[n]=e._active=e.active=e._blocked=e._force=!1,e._step=[!1,!1],e.intentional=!1,e._movement=[0,0],e._distance=[0,0],e._direction=[0,0],e._delta=[0,0],e._bounds=[[-1/0,1/0],[-1/0,1/0]],e.args=r,e.axis=void 0,e.memo=void 0,e.elapsedTime=e.timeDelta=0,e.direction=[0,0],e.distance=[0,0],e.overflow=[0,0],e._movementBound=[!1,!1],e.velocity=[0,0],e.movement=[0,0],e.delta=[0,0],e.timeStamp=0}start(e){let t=this.state,n=this.config;t._active||(this.reset(),this.computeInitial(),t._active=!0,t.target=e.target,t.currentTarget=e.currentTarget,t.lastOffset=n.from?U(n.from,t):t.offset,t.offset=t.lastOffset,t.startTime=t.timeStamp=e.timeStamp)}computeValues(e){let t=this.state;t._values=e,t.values=this.config.transform(e)}computeInitial(){let e=this.state;e._initial=e._values,e.initial=e.values}compute(e){let{state:t,config:n,shared:r}=this;t.args=this.args;let i=0;if(e&&(t.event=e,n.preventDefault&&e.cancelable&&t.event.preventDefault(),t.type=e.type,r.touches=this.ctrl.pointerIds.size||this.ctrl.touchIds.size,r.locked=!!document.pointerLockElement,Object.assign(r,Le(e)),r.down=r.pressed=r.buttons%2==1||r.touches>0,i=e.timeStamp-t.timeStamp,t.timeStamp=e.timeStamp,t.elapsedTime=t.timeStamp-t.startTime),t._active){let e=t._delta.map(Math.abs);I.addTo(t._distance,e)}this.axisIntent&&this.axisIntent(e);let[a,o]=t._movement,[s,c]=n.threshold,{_step:l,values:u}=t;if(n.hasCustomTransform?(l[0]===!1&&(l[0]=Math.abs(a)>=s&&u[0]),l[1]===!1&&(l[1]=Math.abs(o)>=c&&u[1])):(l[0]===!1&&(l[0]=Math.abs(a)>=s&&Math.sign(a)*s),l[1]===!1&&(l[1]=Math.abs(o)>=c&&Math.sign(o)*c)),t.intentional=l[0]!==!1||l[1]!==!1,!t.intentional)return;let d=[0,0];if(n.hasCustomTransform){let[e,t]=u;d[0]=l[0]===!1?0:e-l[0],d[1]=l[1]===!1?0:t-l[1]}else d[0]=l[0]===!1?0:a-l[0],d[1]=l[1]===!1?0:o-l[1];this.restrictToAxis&&!t._blocked&&this.restrictToAxis(d);let f=t.offset,p=t._active&&!t._blocked||t.active;p&&(t.first=t._active&&!t.active,t.last=!t._active&&t.active,t.active=r[this.ingKey]=t._active,e&&(t.first&&(`bounds`in n&&(t._bounds=U(n.bounds,t)),this.setup&&this.setup()),t.movement=d,this.computeOffset()));let[m,h]=t.offset,[[g,_],[v,y]]=t._bounds;t.overflow=[m<g?-1:+(m>_),h<v?-1:+(h>y)],t._movementBound[0]=t.overflow[0]?t._movementBound[0]===!1?t._movement[0]:t._movementBound[0]:!1,t._movementBound[1]=t.overflow[1]?t._movementBound[1]===!1?t._movement[1]:t._movementBound[1]:!1;let b=t._active&&n.rubberband||[0,0];if(t.offset=he(t._bounds,t.offset,b),t.delta=I.sub(t.offset,f),this.computeMovement(),p&&(!t.last||i>Ve)){t.delta=I.sub(t.offset,f);let e=t.delta.map(Math.abs);I.addTo(t.distance,e),t.direction=t.delta.map(Math.sign),t._direction=t._delta.map(Math.sign),!t.first&&i>0&&(t.velocity=[e[0]/i,e[1]/i],t.timeDelta=i)}}emit(){let e=this.state,t=this.shared,n=this.config;if(e._active||this.clean(),(e._blocked||!e.intentional)&&!e._force&&!n.triggerAllEvents)return;let r=this.handler(R(R(R({},t),e),{},{[this.aliasKey]:e.values}));r!==void 0&&(e.memo=r)}clean(){this.eventStore.clean(),this.timeoutStore.clean()}};function Ue([e,t],n){let r=Math.abs(e),i=Math.abs(t);if(r>i&&r>n)return`x`;if(i>r&&i>n)return`y`}var W=class extends He{constructor(...e){super(...e),L(this,`aliasKey`,`xy`)}reset(){super.reset(),this.state.axis=void 0}init(){this.state.offset=[0,0],this.state.lastOffset=[0,0]}computeOffset(){this.state.offset=I.add(this.state.lastOffset,this.state.movement)}computeMovement(){this.state.movement=I.sub(this.state.offset,this.state.lastOffset)}axisIntent(e){let t=this.state,n=this.config;if(!t.axis&&e){let r=typeof n.axisThreshold==`object`?n.axisThreshold[De(e)]:n.axisThreshold;t.axis=Ue(t._movement,r)}t._blocked=(n.lockDirection||!!n.axis)&&!t.axis||!!n.axis&&n.axis!==t.axis}restrictToAxis(e){if(this.config.axis||this.config.lockDirection)switch(this.state.axis){case`x`:e[1]=0;break;case`y`:e[0]=0;break}}},We=e=>e,Ge=.15,Ke={enabled(e=!0){return e},eventOptions(e,t,n){return R(R({},n.shared.eventOptions),e)},preventDefault(e=!1){return e},triggerAllEvents(e=!1){return e},rubberband(e=0){switch(e){case!0:return[Ge,Ge];case!1:return[0,0];default:return I.toVector(e)}},from(e){if(typeof e==`function`)return e;if(e!=null)return I.toVector(e)},transform(e,t,n){let r=e||n.shared.transform;return this.hasCustomTransform=!!r,r||We},threshold(e){return I.toVector(e,0)}},qe=0,G=R(R({},Ke),{},{axis(e,t,{axis:n}){if(this.lockDirection=n===`lock`,!this.lockDirection)return n},axisThreshold(e=qe){return e},bounds(e={}){if(typeof e==`function`)return t=>G.bounds(e(t));if(`current`in e)return()=>e.current;if(typeof HTMLElement==`function`&&e instanceof HTMLElement)return e;let{left:t=-1/0,right:n=1/0,top:r=-1/0,bottom:i=1/0}=e;return[[t,n],[r,i]]}}),Je={ArrowRight:(e,t=1)=>[e*t,0],ArrowLeft:(e,t=1)=>[-1*e*t,0],ArrowUp:(e,t=1)=>[0,-1*e*t],ArrowDown:(e,t=1)=>[0,e*t]},Ye=class extends W{constructor(...e){super(...e),L(this,`ingKey`,`dragging`)}reset(){super.reset();let e=this.state;e._pointerId=void 0,e._pointerActive=!1,e._keyboardActive=!1,e._preventScroll=!1,e._delayed=!1,e.swipe=[0,0],e.tap=!1,e.canceled=!1,e.cancel=this.cancel.bind(this)}setup(){let e=this.state;if(e._bounds instanceof HTMLElement){let t=e._bounds.getBoundingClientRect(),n=e.currentTarget.getBoundingClientRect(),r={left:t.left-n.left+e.offset[0],right:t.right-n.right+e.offset[0],top:t.top-n.top+e.offset[1],bottom:t.bottom-n.bottom+e.offset[1]};e._bounds=G.bounds(r)}}cancel(){let e=this.state;e.canceled||(e.canceled=!0,e._active=!1,setTimeout(()=>{this.compute(),this.emit()},0))}setActive(){this.state._active=this.state._pointerActive||this.state._keyboardActive}clean(){this.pointerClean(),this.state._pointerActive=!1,this.state._keyboardActive=!1,super.clean()}pointerDown(e){let t=this.config,n=this.state;if(e.buttons!=null&&(Array.isArray(t.pointerButtons)?!t.pointerButtons.includes(e.buttons):t.pointerButtons!==-1&&t.pointerButtons!==e.buttons))return;let r=this.ctrl.setEventIds(e);t.pointerCapture&&e.target.setPointerCapture(e.pointerId),!(r&&r.size>1&&n._pointerActive)&&(this.start(e),this.setupPointer(e),n._pointerId=V(e),n._pointerActive=!0,this.computeValues(H(e)),this.computeInitial(),t.preventScrollAxis&&De(e)!==`mouse`?(n._active=!1,this.setupScrollPrevention(e)):t.delay>0?(this.setupDelayTrigger(e),t.triggerAllEvents&&(this.compute(e),this.emit())):this.startPointerDrag(e))}startPointerDrag(e){let t=this.state;t._active=!0,t._preventScroll=!0,t._delayed=!1,this.compute(e),this.emit()}pointerMove(e){let t=this.state,n=this.config;if(!t._pointerActive)return;let r=V(e);if(t._pointerId!==void 0&&r!==t._pointerId)return;let i=H(e);if(document.pointerLockElement===e.target?t._delta=[e.movementX,e.movementY]:(t._delta=I.sub(i,t._values),this.computeValues(i)),I.addTo(t._movement,t._delta),this.compute(e),t._delayed&&t.intentional){this.timeoutStore.remove(`dragDelay`),t.active=!1,this.startPointerDrag(e);return}if(n.preventScrollAxis&&!t._preventScroll)if(t.axis)if(t.axis===n.preventScrollAxis||n.preventScrollAxis===`xy`){t._active=!1,this.clean();return}else{this.timeoutStore.remove(`startPointerDrag`),this.startPointerDrag(e);return}else return;this.emit()}pointerUp(e){this.ctrl.setEventIds(e);try{this.config.pointerCapture&&e.target.hasPointerCapture(e.pointerId)&&e.target.releasePointerCapture(e.pointerId)}catch{}let t=this.state,n=this.config;if(!t._active||!t._pointerActive)return;let r=V(e);if(t._pointerId!==void 0&&r!==t._pointerId)return;this.state._pointerActive=!1,this.setActive(),this.compute(e);let[i,a]=t._distance;if(t.tap=i<=n.tapsThreshold&&a<=n.tapsThreshold,t.tap&&n.filterTaps)t._force=!0;else{let[e,r]=t._delta,[i,a]=t._movement,[o,s]=n.swipe.velocity,[c,l]=n.swipe.distance,u=n.swipe.duration;if(t.elapsedTime<u){let n=Math.abs(e/t.timeDelta),u=Math.abs(r/t.timeDelta);n>o&&Math.abs(i)>c&&(t.swipe[0]=Math.sign(e)),u>s&&Math.abs(a)>l&&(t.swipe[1]=Math.sign(r))}}this.emit()}pointerClick(e){!this.state.tap&&e.detail>0&&(e.preventDefault(),e.stopPropagation())}setupPointer(e){let t=this.config,n=t.device;t.pointerLock&&e.currentTarget.requestPointerLock(),t.pointerCapture||(this.eventStore.add(this.sharedConfig.window,n,`change`,this.pointerMove.bind(this)),this.eventStore.add(this.sharedConfig.window,n,`end`,this.pointerUp.bind(this)),this.eventStore.add(this.sharedConfig.window,n,`cancel`,this.pointerUp.bind(this)))}pointerClean(){this.config.pointerLock&&document.pointerLockElement===this.state.currentTarget&&document.exitPointerLock()}preventScroll(e){this.state._preventScroll&&e.cancelable&&e.preventDefault()}setupScrollPrevention(e){this.state._preventScroll=!1,Xe(e);let t=this.eventStore.add(this.sharedConfig.window,`touch`,`change`,this.preventScroll.bind(this),{passive:!1});this.eventStore.add(this.sharedConfig.window,`touch`,`end`,t),this.eventStore.add(this.sharedConfig.window,`touch`,`cancel`,t),this.timeoutStore.add(`startPointerDrag`,this.startPointerDrag.bind(this),this.config.preventScrollDelay,e)}setupDelayTrigger(e){this.state._delayed=!0,this.timeoutStore.add(`dragDelay`,()=>{this.state._step=[0,0],this.startPointerDrag(e)},this.config.delay)}keyDown(e){let t=Je[e.key];if(t){let n=this.state,r=e.shiftKey?10:e.altKey?.1:1;this.start(e),n._delta=t(this.config.keyboardDisplacement,r),n._keyboardActive=!0,I.addTo(n._movement,n._delta),this.compute(e),this.emit()}}keyUp(e){e.key in Je&&(this.state._keyboardActive=!1,this.setActive(),this.compute(e),this.emit())}bind(e){let t=this.config.device;e(t,`start`,this.pointerDown.bind(this)),this.config.pointerCapture&&(e(t,`change`,this.pointerMove.bind(this)),e(t,`end`,this.pointerUp.bind(this)),e(t,`cancel`,this.pointerUp.bind(this)),e(`lostPointerCapture`,``,this.pointerUp.bind(this))),this.config.keys&&(e(`key`,`down`,this.keyDown.bind(this)),e(`key`,`up`,this.keyUp.bind(this))),this.config.filterTaps&&e(`click`,``,this.pointerClick.bind(this),{capture:!0,passive:!1})}};function Xe(e){`persist`in e&&typeof e.persist==`function`&&e.persist()}var K=typeof window<`u`&&window.document&&window.document.createElement;function Ze(){return K&&`ontouchstart`in window}function Qe(){return Ze()||K&&window.navigator.maxTouchPoints>1}function $e(){return K&&`onpointerdown`in window}function et(){return K&&`exitPointerLock`in window.document}function tt(){try{return`constructor`in GestureEvent}catch{return!1}}var q={isBrowser:K,gesture:tt(),touch:Ze(),touchscreen:Qe(),pointer:$e(),pointerLock:et()},nt=250,rt=180,it=.5,at=50,ot=250,st=10,ct={mouse:0,touch:0,pen:8},lt=R(R({},G),{},{device(e,t,{pointer:{touch:n=!1,lock:r=!1,mouse:i=!1}={}}){return this.pointerLock=r&&q.pointerLock,q.touch&&n?`touch`:this.pointerLock?`mouse`:q.pointer&&!i?`pointer`:q.touch?`touch`:`mouse`},preventScrollAxis(e,t,{preventScroll:n}){if(this.preventScrollDelay=typeof n==`number`?n:n||n===void 0&&e?nt:void 0,!(!q.touchscreen||n===!1))return e||(n===void 0?void 0:`y`)},pointerCapture(e,t,{pointer:{capture:n=!0,buttons:r=1,keys:i=!0}={}}){return this.pointerButtons=r,this.keys=i,!this.pointerLock&&this.device===`pointer`&&n},threshold(e,t,{filterTaps:n=!1,tapsThreshold:r=3,axis:i=void 0}){let a=I.toVector(e,n?r:+!!i);return this.filterTaps=n,this.tapsThreshold=r,a},swipe({velocity:e=it,distance:t=at,duration:n=ot}={}){return{velocity:this.transform(I.toVector(e)),distance:this.transform(I.toVector(t)),duration:n}},delay(e=0){switch(e){case!0:return rt;case!1:return 0;default:return e}},axisThreshold(e){return e?R(R({},ct),e):ct},keyboardDisplacement(e=st){return e}});function ut(e){let[t,n]=e.overflow,[r,i]=e._delta,[a,o]=e._direction;(t<0&&r>0&&a<0||t>0&&r<0&&a>0)&&(e._movement[0]=e._movementBound[0]),(n<0&&i>0&&o<0||n>0&&i<0&&o>0)&&(e._movement[1]=e._movementBound[1])}var dt=30,ft=100,pt=class extends He{constructor(...e){super(...e),L(this,`ingKey`,`pinching`),L(this,`aliasKey`,`da`)}init(){this.state.offset=[1,0],this.state.lastOffset=[1,0],this.state._pointerEvents=new Map}reset(){super.reset();let e=this.state;e._touchIds=[],e.canceled=!1,e.cancel=this.cancel.bind(this),e.turns=0}computeOffset(){let{type:e,movement:t,lastOffset:n}=this.state;e===`wheel`?this.state.offset=I.add(t,n):this.state.offset=[(1+t[0])*n[0],t[1]+n[1]]}computeMovement(){let{offset:e,lastOffset:t}=this.state;this.state.movement=[e[0]/t[0],e[1]-t[1]]}axisIntent(){let e=this.state,[t,n]=e._movement;if(!e.axis){let r=Math.abs(t)*dt-Math.abs(n);r<0?e.axis=`angle`:r>0&&(e.axis=`scale`)}}restrictToAxis(e){this.config.lockDirection&&(this.state.axis===`scale`?e[1]=0:this.state.axis===`angle`&&(e[0]=0))}cancel(){let e=this.state;e.canceled||setTimeout(()=>{e.canceled=!0,e._active=!1,this.compute(),this.emit()},0)}touchStart(e){this.ctrl.setEventIds(e);let t=this.state,n=this.ctrl.touchIds;if(t._active&&t._touchIds.every(e=>n.has(e))||n.size<2)return;this.start(e),t._touchIds=Array.from(n).slice(0,2);let r=Me(e,t._touchIds);r&&this.pinchStart(e,r)}pointerStart(e){if(e.buttons!=null&&e.buttons%2!=1)return;this.ctrl.setEventIds(e),e.target.setPointerCapture(e.pointerId);let t=this.state,n=t._pointerEvents,r=this.ctrl.pointerIds;if(t._active&&Array.from(n.keys()).every(e=>r.has(e))||(n.size<2&&n.set(e.pointerId,e),t._pointerEvents.size<2))return;this.start(e);let i=B(...Array.from(n.values()));i&&this.pinchStart(e,i)}pinchStart(e,t){let n=this.state;n.origin=t.origin,this.computeValues([t.distance,t.angle]),this.computeInitial(),this.compute(e),this.emit()}touchMove(e){if(!this.state._active)return;let t=Me(e,this.state._touchIds);t&&this.pinchMove(e,t)}pointerMove(e){let t=this.state._pointerEvents;if(t.has(e.pointerId)&&t.set(e.pointerId,e),!this.state._active)return;let n=B(...Array.from(t.values()));n&&this.pinchMove(e,n)}pinchMove(e,t){let n=this.state,r=n._values[1],i=t.angle-r,a=0;Math.abs(i)>270&&(a+=Math.sign(i)),this.computeValues([t.distance,t.angle-360*a]),n.origin=t.origin,n.turns=a,n._movement=[n._values[0]/n._initial[0]-1,n._values[1]-n._initial[1]],this.compute(e),this.emit()}touchEnd(e){this.ctrl.setEventIds(e),this.state._active&&this.state._touchIds.some(e=>!this.ctrl.touchIds.has(e))&&(this.state._active=!1,this.compute(e),this.emit())}pointerEnd(e){let t=this.state;this.ctrl.setEventIds(e);try{e.target.releasePointerCapture(e.pointerId)}catch{}t._pointerEvents.has(e.pointerId)&&t._pointerEvents.delete(e.pointerId),t._active&&t._pointerEvents.size<2&&(t._active=!1,this.compute(e),this.emit())}gestureStart(e){e.cancelable&&e.preventDefault();let t=this.state;t._active||(this.start(e),this.computeValues([e.scale,e.rotation]),t.origin=[e.clientX,e.clientY],this.compute(e),this.emit())}gestureMove(e){if(e.cancelable&&e.preventDefault(),!this.state._active)return;let t=this.state;this.computeValues([e.scale,e.rotation]),t.origin=[e.clientX,e.clientY];let n=t._movement;t._movement=[e.scale-1,e.rotation],t._delta=I.sub(t._movement,n),this.compute(e),this.emit()}gestureEnd(e){this.state._active&&(this.state._active=!1,this.compute(e),this.emit())}wheel(e){let t=this.config.modifierKey;t&&(Array.isArray(t)?!t.find(t=>e[t]):!e[t])||(this.state._active?this.wheelChange(e):this.wheelStart(e),this.timeoutStore.add(`wheelEnd`,this.wheelEnd.bind(this)))}wheelStart(e){this.start(e),this.wheelChange(e)}wheelChange(e){`uv`in e||e.cancelable&&e.preventDefault();let t=this.state;t._delta=[-Fe(e)[1]/ft*t.offset[0],0],I.addTo(t._movement,t._delta),ut(t),this.state.origin=[e.clientX,e.clientY],this.compute(e),this.emit()}wheelEnd(){this.state._active&&(this.state._active=!1,this.compute(),this.emit())}bind(e){let t=this.config.device;t&&(e(t,`start`,this[t+`Start`].bind(this)),e(t,`change`,this[t+`Move`].bind(this)),e(t,`end`,this[t+`End`].bind(this)),e(t,`cancel`,this[t+`End`].bind(this)),e(`lostPointerCapture`,``,this[t+`End`].bind(this))),this.config.pinchOnWheel&&e(`wheel`,``,this.wheel.bind(this),{passive:!1})}},mt=R(R({},Ke),{},{device(e,t,{shared:n,pointer:{touch:r=!1}={}}){if(n.target&&!q.touch&&q.gesture)return`gesture`;if(q.touch&&r)return`touch`;if(q.touchscreen){if(q.pointer)return`pointer`;if(q.touch)return`touch`}},bounds(e,t,{scaleBounds:n={},angleBounds:r={}}){let i=e=>{let t=Be(U(n,e),{min:-1/0,max:1/0});return[t.min,t.max]},a=e=>{let t=Be(U(r,e),{min:-1/0,max:1/0});return[t.min,t.max]};return typeof n!=`function`&&typeof r!=`function`?[i(),a()]:e=>[i(e),a(e)]},threshold(e,t,n){return this.lockDirection=n.axis===`lock`,I.toVector(e,this.lockDirection?[.1,3]:0)},modifierKey(e){return e===void 0?`ctrlKey`:e},pinchOnWheel(e=!0){return e}}),ht=class extends W{constructor(...e){super(...e),L(this,`ingKey`,`moving`)}move(e){this.config.mouseOnly&&e.pointerType!==`mouse`||(this.state._active?this.moveChange(e):this.moveStart(e),this.timeoutStore.add(`moveEnd`,this.moveEnd.bind(this)))}moveStart(e){this.start(e),this.computeValues(H(e)),this.compute(e),this.computeInitial(),this.emit()}moveChange(e){if(!this.state._active)return;let t=H(e),n=this.state;n._delta=I.sub(t,n._values),I.addTo(n._movement,n._delta),this.computeValues(t),this.compute(e),this.emit()}moveEnd(e){this.state._active&&(this.state._active=!1,this.compute(e),this.emit())}bind(e){e(`pointer`,`change`,this.move.bind(this)),e(`pointer`,`leave`,this.moveEnd.bind(this))}},gt=R(R({},G),{},{mouseOnly:(e=!0)=>e}),_t=class extends W{constructor(...e){super(...e),L(this,`ingKey`,`scrolling`)}scroll(e){this.state._active||this.start(e),this.scrollChange(e),this.timeoutStore.add(`scrollEnd`,this.scrollEnd.bind(this))}scrollChange(e){e.cancelable&&e.preventDefault();let t=this.state,n=Ie(e);t._delta=I.sub(n,t._values),I.addTo(t._movement,t._delta),this.computeValues(n),this.compute(e),this.emit()}scrollEnd(){this.state._active&&(this.state._active=!1,this.compute(),this.emit())}bind(e){e(`scroll`,``,this.scroll.bind(this))}},vt=G,yt=class extends W{constructor(...e){super(...e),L(this,`ingKey`,`wheeling`)}wheel(e){this.state._active||this.start(e),this.wheelChange(e),this.timeoutStore.add(`wheelEnd`,this.wheelEnd.bind(this))}wheelChange(e){let t=this.state;t._delta=Fe(e),I.addTo(t._movement,t._delta),ut(t),this.compute(e),this.emit()}wheelEnd(){this.state._active&&(this.state._active=!1,this.compute(),this.emit())}bind(e){e(`wheel`,``,this.wheel.bind(this))}},bt=G,xt=class extends W{constructor(...e){super(...e),L(this,`ingKey`,`hovering`)}enter(e){this.config.mouseOnly&&e.pointerType!==`mouse`||(this.start(e),this.computeValues(H(e)),this.compute(e),this.emit())}leave(e){if(this.config.mouseOnly&&e.pointerType!==`mouse`)return;let t=this.state;if(!t._active)return;t._active=!1;let n=H(e);t._movement=t._delta=I.sub(n,t._values),this.computeValues(n),this.compute(e),t.delta=t.movement,this.emit()}bind(e){e(`pointer`,`enter`,this.enter.bind(this)),e(`pointer`,`leave`,this.leave.bind(this))}},St=R(R({},G),{},{mouseOnly:(e=!0)=>e}),Ct=new Map,J=new Map;function wt(e){Ct.set(e.key,e.engine),J.set(e.key,e.resolver)}var Tt={key:`drag`,engine:Ye,resolver:lt},Et={key:`hover`,engine:xt,resolver:St},Dt={key:`move`,engine:ht,resolver:gt},Ot={key:`pinch`,engine:pt,resolver:mt},kt={key:`scroll`,engine:_t,resolver:vt},At={key:`wheel`,engine:yt,resolver:bt};function jt(e,t){if(e==null)return{};var n={},r=Object.keys(e),i,a;for(a=0;a<r.length;a++)i=r[a],!(t.indexOf(i)>=0)&&(n[i]=e[i]);return n}function Mt(e,t){if(e==null)return{};var n=jt(e,t),r,i;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)r=a[i],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var Nt={target(e){if(e)return()=>`current`in e?e.current:e},enabled(e=!0){return e},window(e=q.isBrowser?window:void 0){return e},eventOptions({passive:e=!0,capture:t=!1}={}){return{passive:e,capture:t}},transform(e){return e}},Pt=[`target`,`eventOptions`,`window`,`enabled`,`transform`];function Y(e={},t){let n={};for(let[r,i]of Object.entries(t))switch(typeof i){case`function`:n[r]=i.call(n,e[r],r,e);break;case`object`:n[r]=Y(e[r],i);break;case`boolean`:i&&(n[r]=e[r]);break}return n}function Ft(e,t,n={}){let r=e,{target:i,eventOptions:a,window:o,enabled:s,transform:c}=r,l=Mt(r,Pt);if(n.shared=Y({target:i,eventOptions:a,window:o,enabled:s,transform:c},Nt),t){let e=J.get(t);n[t]=Y(R({shared:n.shared},l),e)}else for(let e in l){let t=J.get(e);t&&(n[e]=Y(R({shared:n.shared},l[e]),t))}return n}var It=class{constructor(e,t){L(this,`_listeners`,new Set),this._ctrl=e,this._gestureKey=t}add(e,t,n,r,i){let a=this._listeners,o=Ee(t,n),s=R(R({},this._gestureKey?this._ctrl.config[this._gestureKey].eventOptions:{}),i);e.addEventListener(o,r,s);let c=()=>{e.removeEventListener(o,r,s),a.delete(c)};return a.add(c),c}clean(){this._listeners.forEach(e=>e()),this._listeners.clear()}},Lt=class{constructor(){L(this,`_timeouts`,new Map)}add(e,t,n=140,...r){this.remove(e),this._timeouts.set(e,window.setTimeout(t,n,...r))}remove(e){let t=this._timeouts.get(e);t&&window.clearTimeout(t)}clean(){this._timeouts.forEach(e=>void window.clearTimeout(e)),this._timeouts.clear()}},Rt=class{constructor(e){L(this,`gestures`,new Set),L(this,`_targetEventStore`,new It(this)),L(this,`gestureEventStores`,{}),L(this,`gestureTimeoutStores`,{}),L(this,`handlers`,{}),L(this,`config`,{}),L(this,`pointerIds`,new Set),L(this,`touchIds`,new Set),L(this,`state`,{shared:{shiftKey:!1,metaKey:!1,ctrlKey:!1,altKey:!1}}),zt(this,e)}setEventIds(e){if(z(e))return this.touchIds=new Set(je(e)),this.touchIds;if(`pointerId`in e)return e.type===`pointerup`||e.type===`pointercancel`?this.pointerIds.delete(e.pointerId):e.type===`pointerdown`&&this.pointerIds.add(e.pointerId),this.pointerIds}applyHandlers(e,t){this.handlers=e,this.nativeHandlers=t}applyConfig(e,t){this.config=Ft(e,t,this.config)}clean(){this._targetEventStore.clean();for(let e of this.gestures)this.gestureEventStores[e].clean(),this.gestureTimeoutStores[e].clean()}effect(){return this.config.shared.target&&this.bind(),()=>this._targetEventStore.clean()}bind(...e){let t=this.config.shared,n={},r;if(!(t.target&&(r=t.target(),!r))){if(t.enabled){for(let t of this.gestures){let i=this.config[t],a=Bt(n,i.eventOptions,!!r);i.enabled&&new(Ct.get(t))(this,e,t).bind(a)}let i=Bt(n,t.eventOptions,!!r);for(let t in this.nativeHandlers)i(t,``,n=>this.nativeHandlers[t](R(R({},this.state.shared),{},{event:n,args:e})),void 0,!0)}for(let e in n)n[e]=ze(...n[e]);if(!r)return n;for(let e in n){let{device:t,capture:i,passive:a}=Te(e);this._targetEventStore.add(r,t,``,n[e],{capture:i,passive:a})}}}};function X(e,t){e.gestures.add(t),e.gestureEventStores[t]=new It(e,t),e.gestureTimeoutStores[t]=new Lt}function zt(e,t){t.drag&&X(e,`drag`),t.wheel&&X(e,`wheel`),t.scroll&&X(e,`scroll`),t.move&&X(e,`move`),t.pinch&&X(e,`pinch`),t.hover&&X(e,`hover`)}var Bt=(e,t,n)=>(r,i,a,o={},s=!1)=>{let c=o.capture??t.capture,l=o.passive??t.passive,u=s?r:Ce(r,i,c);n&&l&&(u+=`Passive`),e[u]=e[u]||[],e[u].push(a)},Vt=/^on(Drag|Wheel|Scroll|Move|Pinch|Hover)/;function Ht(e){let t={},n={},r=new Set;for(let i in e)Vt.test(i)?(r.add(RegExp.lastMatch),n[i]=e[i]):t[i]=e[i];return[n,t,r]}function Z(e,t,n,r,i,a){if(!e.has(n)||!Ct.has(r))return;let o=n+`Start`,s=n+`End`;i[r]=e=>{let r;return e.first&&o in t&&t[o](e),n in t&&(r=t[n](e)),e.last&&s in t&&t[s](e),r},a[r]=a[r]||{}}function Ut(e,t){let[n,r,i]=Ht(e),a={};return Z(i,n,`onDrag`,`drag`,a,t),Z(i,n,`onWheel`,`wheel`,a,t),Z(i,n,`onScroll`,`scroll`,a,t),Z(i,n,`onPinch`,`pinch`,a,t),Z(i,n,`onMove`,`move`,a,t),Z(i,n,`onHover`,`hover`,a,t),{handlers:a,config:t,nativeHandlers:r}}function Wt(e,t={},n,r){let i=P.useMemo(()=>new Rt(e),[]);if(i.applyHandlers(e,r),i.applyConfig(t,n),P.useEffect(i.effect.bind(i)),P.useEffect(()=>i.clean.bind(i),[]),t.target===void 0)return i.bind.bind(i)}function Gt(e){return e.forEach(wt),function(e,t){let{handlers:n,nativeHandlers:r,config:i}=Ut(e,t||{});return Wt(n,i,void 0,r)}}function Kt(e,t){return Gt([Tt,Ot,kt,At,Dt,Et])(e,t||{})}function qt(e){return 2**Math.ceil(Math.log2(Math.ceil(Math.sqrt(Math.max(1,e)))))}var Jt=`
precision highp float;

uniform sampler2D uPosition;   // ping-pong: previous positions (xyz) + age (w)
uniform sampler2D uSeed;       // immutable home positions (xyz) + lifespan (w)
uniform float uTime;
uniform float uDelta;
uniform vec2  uMouse;          // world-space cursor on the z=0 plane
uniform float uScroll;         // 0..1 page scroll
uniform float uRadius;
uniform float uPointerInfluence;

varying vec2 vUv;

/* ---- Simplex-ish 3D noise (Ashima webgl-noise, MIT) ---------------------- */
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
    + i.y+vec4(0.0,i1.y,i2.y,1.0))
    + i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

/* analytic curl of a 3D noise field => divergence-free flow */
vec3 curlNoise(vec3 p){
  const float e=0.1;
  vec3 dx=vec3(e,0.0,0.0);
  vec3 dy=vec3(0.0,e,0.0);
  vec3 dz=vec3(0.0,0.0,e);
  float x0=snoise(p-dx),x1=snoise(p+dx);
  float y0=snoise(p-dy),y1=snoise(p+dy);
  float z0=snoise(p-dz),z1=snoise(p+dz);
  // sample an offset field for the other two components
  vec3 o=vec3(123.4,567.8,-901.2);
  float ax0=snoise(p-dy+o),ax1=snoise(p+dy+o);
  float ay0=snoise(p-dz+o),ay1=snoise(p+dz+o);
  float az0=snoise(p-dx+o),az1=snoise(p+dx+o);
  float curlX=(z1-z0)-(ax1-ax0);
  float curlY=(ay1-ay0)-(x1-x0);
  float curlZ=(y1-y0)-(az1-az0);
  return normalize(vec3(curlX,curlY,curlZ)+1e-5)/(2.0*e);
}

void main(){
  vec4 prev = texture2D(uPosition, vUv);
  vec4 seed = texture2D(uSeed, vUv);
  vec3 pos  = prev.xyz;
  float age = prev.w;
  float life = seed.w;            // per-particle lifespan (0.6..1.4)

  // --- flow field: scale & time-evolve the noise domain ---
  float scrollSwirl = mix(0.18, 0.6, uScroll);
  vec3 flow = curlNoise(pos * 0.28 + vec3(0.0, uTime * 0.05, uTime * 0.03));
  flow += curlNoise(pos * 0.9 - uTime * 0.08) * 0.35; // fine detail octave

  vec3 vel = flow * (0.55 + scrollSwirl);

  // --- gentle global rotation tied to scroll ---
  float ang = (0.08 + uScroll * 0.5) * uDelta;
  float c = cos(ang), s = sin(ang);
  vel.xz = mat2(c, -s, s, c) * vel.xz * 0.6 + vel.xz * 0.4;

  // --- mouse repulsion in the z~0 slab ---
  vec3 toMouse = pos - vec3(uMouse, 0.0);
  float md = length(toMouse.xy);
  float push = uPointerInfluence * exp(-md * md * 0.6);
  vel += normalize(vec3(toMouse.xy, 0.0001)) * push * 6.0;

  // --- containment: pull back toward the seed home, stronger past radius ---
  vec3 toHome = seed.xyz - pos;
  float dist = length(pos);
  float pull = smoothstep(uRadius * 0.7, uRadius * 1.25, dist);
  vel += toHome * (0.4 + pull * 2.2);

  pos += vel * uDelta;

  // --- age & respawn ---
  age += uDelta / life;
  if (age >= 1.0) {
    pos = seed.xyz;             // teleport home, reset age (recycle)
    age = fract(age);
  }

  gl_FragColor = vec4(pos, age);
}
`,Yt=`
precision highp float;

uniform sampler2D uPosition;
uniform float uSize;
uniform float uTime;
uniform float uScroll;
uniform float uDpr;
uniform float uIntro;      // 0 = cold/small, 1 = fully ignited (intro swell-in)

attribute vec2 aRef;       // UV into the simulation texture
attribute float aRand;     // per-particle 0..1 for variation / pink flares

varying float vAge;
varying float vRand;
varying float vDepth;

void main(){
  vec4 sim = texture2D(uPosition, aRef);
  vec3 pos = sim.xyz;
  vAge  = sim.w;
  vRand = aRand;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;

  // size attenuation (∝ 1/dist) + subtle twinkle + scroll-driven swell
  float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + aRand * 40.0);
  float swell = 1.0 + uScroll * 0.4;
  // ignition: points grow from 55% -> 100% as the intro fires
  gl_PointSize = uSize * uDpr * swell * twinkle * (0.55 + 0.45 * uIntro) * (300.0 / max(vDepth, 0.001));
}
`,Xt=`
precision highp float;

uniform vec3 uColorA;   // teal
uniform vec3 uColorB;   // ultraviolet
uniform vec3 uColorC;   // signal pink
uniform float uSparkChance;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3  uFogColor;
uniform float uIntro;   // 0..1 ignition fade-in

varying float vAge;
varying float vRand;
varying float vDepth;

void main(){
  // round, soft-edged sprite
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d);
  alpha *= alpha; // tighter glow core

  // color: teal -> violet over age, sparse pink flares
  vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 1.0, vAge));
  float isPink = step(1.0 - uSparkChance, vRand);
  col = mix(col, uColorC, isPink * (0.6 + 0.4 * vRand));

  // fade in at birth, fade out near death (so recycling is invisible)
  float lifeFade = smoothstep(0.0, 0.12, vAge) * (1.0 - smoothstep(0.85, 1.0, vAge));
  alpha *= lifeFade;

  // linear fog toward the void color (we use additive blend so fog = darken)
  float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
  col *= fog;
  alpha *= fog;

  // ignition fade-in
  alpha *= uIntro;

  gl_FragColor = vec4(col, alpha);
}
`,Zt=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;function Qt(){let{gl:e,pointer:t,viewport:r}=u(),i=(0,P.useMemo)(()=>qt(M.runtime.particleCount),[]),a=i*i,o=(0,P.useMemo)(()=>({type:se,minFilter:k,magFilter:k,wrapS:C,wrapT:C,depthBuffer:!1,stencilBuffer:!1}),[]),s=d(i,i,o),c=d(i,i,o),l=(0,P.useRef)(s),f=(0,P.useRef)(c),p=(0,P.useMemo)(()=>{let{radius:e}=M.particles,t=new Float32Array(a*4);for(let n=0;n<a;n++){let r=e*Math.cbrt(Math.random())*(.55+Math.random()*.45),i=Math.random()*Math.PI*2,a=Math.acos(2*Math.random()-1);t[n*4+0]=r*Math.sin(a)*Math.cos(i),t[n*4+1]=r*Math.sin(a)*Math.sin(i),t[n*4+2]=r*Math.cos(a),t[n*4+3]=.6+Math.random()*.8}let n=new re(t,i,i,ae,x);return n.needsUpdate=!0,n.minFilter=k,n.magFilter=k,n},[a,i]),m=(0,P.useMemo)(()=>{let e=new _,t=new ee(-1,1,1,-1,0,1),n=new ne({vertexShader:Zt,fragmentShader:Jt,uniforms:{uPosition:{value:p},uSeed:{value:p},uTime:{value:0},uDelta:{value:0},uMouse:{value:new te(999,999)},uScroll:{value:0},uRadius:{value:M.particles.radius},uPointerInfluence:{value:M.particles.pointerInfluence}}}),r=new v(new S(2,2),n);return r.frustumCulled=!1,e.add(r),{scene:e,camera:t,material:n}},[p]),h=(0,P.useRef)(!1),g=()=>{m.material.uniforms.uPosition.value=p,m.material.uniforms.uDelta.value=0,e.setRenderTarget(l.current),e.render(m.scene,m.camera),e.setRenderTarget(f.current),e.render(m.scene,m.camera),e.setRenderTarget(null)},y=(0,P.useMemo)(()=>{let e=new Float32Array(a*2),t=new Float32Array(a);for(let n=0;n<a;n++){let r=n%i,a=Math.floor(n/i);e[n*2+0]=(r+.5)/i,e[n*2+1]=(a+.5)/i,t[n]=Math.random()}let n=new ie;return n.setAttribute(`position`,new w(new Float32Array(a*3),3)),n.setAttribute(`aRef`,new w(e,2)),n.setAttribute(`aRand`,new w(t,1)),n.setDrawRange(0,a),n},[a,i]),b=(0,P.useRef)(null),oe=(0,P.useMemo)(()=>({uPosition:{value:s.texture},uSize:{value:M.particles.size},uTime:{value:0},uScroll:{value:0},uDpr:{value:Math.min(r.dpr??1,2)},uColorA:{value:new T(M.colors.particleA)},uColorB:{value:new T(M.colors.particleB)},uColorC:{value:new T(M.colors.particleC)},uSparkChance:{value:M.particles.sparkChance},uFogNear:{value:M.fog.near},uFogFar:{value:M.fog.far},uFogColor:{value:new T(M.colors.fog)},uIntro:{value:0}}),[]),D=(0,P.useMemo)(()=>new E,[]);return(0,P.useEffect)(()=>{let e=s,t=c;return()=>{p.dispose(),y.dispose(),m.material.dispose(),m.scene.traverse(e=>{e instanceof v&&e.geometry.dispose()}),e.dispose(),t.dispose()}},[p,y,m,s,c]),n((n,i)=>{if(h.current||=(g(),!0),M.runtime.reducedMotion){if(b.current){let e=b.current.uniforms;e.uPosition.value=l.current.texture,e.uIntro.value=A.getState().intro,e.uSize.value=M.particles.size}return}let a=Math.min(i,1/30),o=m.material.uniforms;D.set(t.x*(r.width/2),t.y*(r.height/2),0),o.uMouse.value.set(D.x,D.y),o.uTime.value=n.clock.elapsedTime,o.uDelta.value=a,o.uScroll.value=A.getState().progress,o.uRadius.value=M.particles.radius,o.uPointerInfluence.value=M.particles.pointerInfluence,o.uPosition.value=l.current.texture,e.setRenderTarget(f.current),e.render(m.scene,m.camera),e.setRenderTarget(null);let s=l.current;if(l.current=f.current,f.current=s,b.current){let e=b.current.uniforms;e.uPosition.value=f.current.texture,e.uTime.value=n.clock.elapsedTime,e.uScroll.value=o.uScroll.value,e.uSize.value=M.particles.size,e.uDpr.value=Math.min(r.dpr??1,2),e.uIntro.value=A.getState().intro}},-1),(0,F.jsx)(`points`,{geometry:y,frustumCulled:!1,children:(0,F.jsx)(`shaderMaterial`,{ref:b,vertexShader:Yt,fragmentShader:Xt,uniforms:oe,transparent:!0,depthWrite:!1,depthTest:!1,blending:2})})}function $t(e,t){let n=1024,r=document.createElement(`canvas`);r.width=n,r.height=648;let i=r.getContext(`2d`),a=i.createLinearGradient(0,0,n,648);a.addColorStop(0,e.colorA),a.addColorStop(1,e.colorB),i.fillStyle=a,i.fillRect(0,0,n,648);let o=i.createLinearGradient(0,0,0,648);o.addColorStop(0,`rgba(5,6,10,0)`),o.addColorStop(1,`rgba(5,6,10,0.72)`),i.fillStyle=o,i.fillRect(0,0,n,648);let s=i.createRadialGradient(n*.28,648*.3,0,n*.28,648*.3,n*.7);s.addColorStop(0,`rgba(255,255,255,0.16)`),s.addColorStop(1,`rgba(255,255,255,0)`),i.fillStyle=s,i.fillRect(0,0,n,648),i.strokeStyle=`rgba(255,255,255,0.06)`,i.lineWidth=1;for(let e=64;e<n;e+=64)i.beginPath(),i.moveTo(e,0),i.lineTo(e,648),i.stroke();for(let e=64;e<648;e+=64)i.beginPath(),i.moveTo(0,e),i.lineTo(n,e),i.stroke();let c=String(t+1).padStart(2,`0`);i.font=`900 360px "Clash Display", system-ui, sans-serif`,i.textAlign=`right`,i.textBaseline=`alphabetic`,i.fillStyle=`rgba(255,255,255,0.10)`,i.fillText(c,n-36,628),i.font=`600 30px "Satoshi", system-ui, sans-serif`,i.textAlign=`left`,i.fillStyle=`rgba(255,255,255,0.92)`,i.fillText(e.kicker.toUpperCase(),44,66),i.font=`700 58px "Clash Display", system-ui, sans-serif`,i.fillStyle=`#ffffff`;let l=e.title.split(` `),u=[],d=``;for(let e of l){let t=d?`${d} ${e}`:e;i.measureText(t).width>n-88&&d?(u.push(d),d=e):d=t}u.push(d);let f=592-(u.length-1)*64;for(let e of u)i.fillText(e,44,f),f+=64;i.strokeStyle=`rgba(255,255,255,0.18)`,i.lineWidth=2,i.strokeRect(10,10,n-20,628);let p=new oe(r);return p.colorSpace=b,p.needsUpdate=!0,p}var en=`
attribute vec2 aUv;
attribute float aRand;
attribute vec3 aDir;
uniform float uProgress, uSize, uPointScale, uPixelRatio;
varying vec2 vUv;
varying float vProgress;
float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
  vUv=aUv;
  float p=clamp((uProgress-aRand*0.35)/0.65,0.0,1.0);
  vProgress=p;
  vec3 pos=position;
  float n=noise(position*3.0+aRand*10.0);
  vec3 wob=vec3(noise(position.yzx*2.5+p*2.0)-0.5,noise(position.zxy*2.5-p*2.0)-0.5,noise(position.xyz*2.5+p*3.0)-0.5);
  float push=pow(p,1.5);
  pos+=aDir*push*(0.6+aRand*1.4);
  pos+=wob*push*0.9;
  pos.z+=(n-0.5)*push*1.2;
  vec4 mv=modelViewMatrix*vec4(pos,1.0);
  float size=uSize*(1.0+p*1.2*(1.0-p)*4.0)*uPixelRatio;
  if(projectionMatrix[2][3]!=0.0)size*=(uPointScale/-mv.z);
  gl_PointSize=max(size,0.0);
  gl_Position=projectionMatrix*mv;
}`,tn=`
uniform sampler2D uTexture;
uniform float uAdditive;
varying vec2 vUv;
varying float vProgress;
void main(){
  vec2 c=gl_PointCoord-0.5;
  float d=dot(c,c);
  if(d>0.25)discard;
  float soft=smoothstep(0.25,0.06,d);
  vec4 tex=texture2D(uTexture,vUv);
  float alpha=tex.a*soft*(1.0-smoothstep(0.55,1.0,vProgress));
  vec3 col=tex.rgb+tex.rgb*uAdditive*vProgress*0.6;
  if(alpha<0.003)discard;
  gl_FragColor=vec4(col,alpha);
}`;function nn(e,t,n,r){let i=e*t,a=new Float32Array(i*3),o=new Float32Array(i*2),s=new Float32Array(i),c=new Float32Array(i*3),l=0;for(let i=0;i<t;i++)for(let u=0;u<e;u++){let d=e===1?.5:u/(e-1),f=t===1?.5:i/(t-1);a[l*3]=(d-.5)*n,a[l*3+1]=(f-.5)*r,a[l*3+2]=0,o[l*2]=d,o[l*2+1]=f,s[l]=Math.random();let p=Math.random()*Math.PI*2,m=.35+Math.random()*.65,h=(d-.5)*1.4+Math.cos(p)*m,g=(f-.5)*1.4+Math.sin(p)*m,_=(Math.random()-.5)*1.2,v=Math.hypot(h,g,_)||1;c[l*3]=h/v,c[l*3+1]=g/v,c[l*3+2]=_/v,l++}let u=new ie;return u.setAttribute(`position`,new O(a,3)),u.setAttribute(`aUv`,new O(o,2)),u.setAttribute(`aRand`,new O(s,1)),u.setAttribute(`aDir`,new O(c,3)),u.boundingSphere=new D(new E(0,0,0),Math.max(n,r)*2),u}var rn=(e,t,n,r)=>Math.max(e,t)/Math.max(n,r)*36,an={high:[120,76],medium:[88,56],low:[48,30]},on=1.5,Q=(e,t,n)=>Math.min(n,Math.max(t,e)),sn=(e,t,n,r)=>y.lerp(e,t,1-Math.exp(-n*r));function cn(){let e=M.carousel,{gl:t,viewport:r}=u(),i=j.length-1,a=(0,P.useRef)([]),o=(0,P.useRef)([]),s=(0,P.useRef)(null),c=(0,P.useRef)(0),l=(0,P.useRef)(0),d=(0,P.useRef)(0),f=(0,P.useRef)(!1),p=A(e=>e.setSelected),m=A(e=>e.setSection),h=A(e=>e.setActiveIndex),g=A(e=>e.quality),_=A(e=>e.section),v=ue(),y=(0,P.useRef)(-1),[b,x]=v?[44,28]:an[g],S=(0,P.useMemo)(()=>nn(b,x,e.planeW,e.planeH),[b,x,e.planeW,e.planeH]);(0,P.useEffect)(()=>()=>S.dispose(),[S]),(0,P.useEffect)(()=>{_!==`work`&&p(null)},[_,p]),(0,P.useEffect)(()=>{let e=e=>{let t=e.target?.tagName;t===`INPUT`||t===`TEXTAREA`||N.driven||(e.key===`ArrowLeft`?(l.current=Q(l.current-1,0,i),d.current=0):e.key===`ArrowRight`&&(l.current=Q(l.current+1,0,i),d.current=0))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[i]);let[ee,C]=(0,P.useState)(0);(0,P.useEffect)(()=>{let e=!0;return document.fonts?.ready.then(()=>{e&&C(e=>e+1)}),()=>{e=!1}},[]);let w=(0,P.useMemo)(()=>j.map((e,t)=>$t(e,t)),[ee]);(0,P.useEffect)(()=>()=>w.forEach(e=>e.dispose()),[w]);let T=Math.min(r.dpr??1,2),te=(0,P.useMemo)(()=>w.map(t=>({uTexture:{value:t},uProgress:{value:1},uSize:{value:rn(e.planeW,e.planeH,b,x)},uPointScale:{value:300},uPixelRatio:{value:T},uAdditive:{value:.3}})),[w,e.planeW,e.planeH,T,b,x]);Kt({onDragStart:()=>{N.driven||(f.current=!0,d.current=0)},onDrag:({delta:[t],down:n})=>{N.driven||(l.current=Q(l.current-t*e.dragSpeed,0,i),d.current=-t*e.dragSpeed,f.current=n)},onDragEnd:({velocity:[e],direction:[t]})=>{N.driven||(f.current=!1,l.current=Q(l.current-t*e*.9,0,i))},onWheel:({delta:[,t],event:n})=>{N.driven||(n.preventDefault?.(),f.current=!1,l.current=Q(l.current+t*e.wheelSpeed,0,i))}},{target:t.domElement,drag:{filterTaps:!0,pointer:{touch:!0}},wheel:{eventOptions:{passive:!1}},eventOptions:{passive:!1}});let ne=e=>n=>{n.stopPropagation(),s.current=e,t.domElement.style.cursor=`pointer`},E=e=>n=>{n.stopPropagation(),s.current===e&&(s.current=null),t.domElement.style.cursor=``},re=e=>t=>{if(t.stopPropagation(),A.getState().selected===e){p(null);return}p(e),m(`work`),l.current=e};return n((t,n)=>{let r=Math.min(n,1/30),u=A.getState().selected,p=(t,n,i=e.damp)=>v?n:sn(t,n,i,r);N.driven&&u===null?(l.current=Q(N.index,0,i),d.current=0):f.current||(!v&&Math.abs(d.current)>5e-4&&u===null?(l.current=Q(l.current+d.current,0,i),d.current*=.92):(d.current=0,l.current=Math.round(l.current))),c.current=p(c.current,l.current);let m=Q(Math.round(c.current),0,i);m!==y.current&&(y.current=m,h(m));for(let t=0;t<=i;t++){let n=a.current[t],r=o.current[t];if(!n)continue;let i=t-c.current,l=u===t,d=s.current===t&&u===null,f=l?0:i*e.gap,m=l?e.focusZ:-Math.abs(i)*e.arc*e.gap,h=l?0:-i*e.yawPerStep,g=l?1.18:d?e.hoverScale:1;if(n.position.x=p(n.position.x,f),n.position.y=p(n.position.y,0),n.position.z=p(n.position.z,m),n.rotation.y=p(n.rotation.y,h),n.scale.setScalar(p(n.scale.x,g)),n.visible=l||Math.abs(i)<2.6,r){let t=l?0:Q((Math.abs(i)-.12)/on,0,1);r.uniforms.uProgress.value=p(r.uniforms.uProgress.value,t,e.damp*1.4)}}}),(0,F.jsx)(`group`,{children:j.map((t,n)=>(0,F.jsxs)(`group`,{ref:e=>{a.current[n]=e},children:[(0,F.jsx)(`points`,{geometry:S,raycast:()=>null,children:(0,F.jsx)(`shaderMaterial`,{ref:e=>{o.current[n]=e},vertexShader:en,fragmentShader:tn,uniforms:te[n],transparent:!0,depthWrite:!1,depthTest:!0,blending:1,toneMapped:!1})}),(0,F.jsxs)(`mesh`,{onPointerOver:ne(n),onPointerOut:E(n),onClick:re(n),children:[(0,F.jsx)(`planeGeometry`,{args:[e.planeW,e.planeH]}),(0,F.jsx)(`meshBasicMaterial`,{transparent:!0,opacity:0,depthWrite:!1,colorWrite:!1})]})]},t.id))})}var ln=`/w/spire/assets/hero-CLDdwZDr.png`;function un(){return m(ln),null}function dn(){let e=A(e=>e.quality),n=M.tiers[e];return(0,F.jsxs)(l,{children:[n.bloom?(0,F.jsx)(c,{intensity:M.bloom.intensity,luminanceThreshold:M.bloom.luminanceThreshold,luminanceSmoothing:M.bloom.luminanceSmoothing,mipmapBlur:M.bloom.mipmapBlur}):(0,F.jsx)(F.Fragment,{}),n.chromaticAberration?(0,F.jsx)(a,{blendFunction:t.NORMAL,offset:new te(M.chromaticAberration.offset,M.chromaticAberration.offset),radialModulation:!1,modulationOffset:0}):(0,F.jsx)(F.Fragment,{}),(0,F.jsx)(o,{offset:M.vignette.offset,darkness:M.vignette.darkness,eskil:!1})]},e)}function fn(e){if(le)return ce?`medium`:`high`;let t=f();return e?`low`:t.isMobile?t.tier>=3?`medium`:`low`:t.tier<=1?`low`:t.tier===2?`medium`:`high`}function $(e){let t=M.tiers[e];M.runtime.quality=e,M.runtime.particleCount=t.particleCount,M.runtime.chromaticAberration=t.chromaticAberration,M.runtime.bloomEnabled=t.bloom}function pn({onTier:e}){let t=fn(ue());return(0,P.useMemo)(()=>$(t),[t]),(0,P.useEffect)(()=>{e(t)},[t,e]),null}function mn(){let[e,t]=(0,P.useState)(`high`),n=A(e=>e.setQuality),r=M.tiers[e],[i,a]=(0,P.useState)(!1);(0,P.useEffect)(()=>{if(!le)return;let e=new MutationObserver(()=>a(document.body.classList.contains(`in-act2`)));return e.observe(document.body,{attributes:!0,attributeFilter:[`class`]}),()=>e.disconnect()},[]);let o=(0,P.useCallback)(e=>{$(e),t(e),n(e)},[n]),c=(0,P.useCallback)(()=>t(e=>{let t=e===`high`?`medium`:`low`;return $(t),n(t),t}),[n]),l=(0,P.useCallback)(()=>t(e=>{let t=e===`low`?`medium`:`high`;return $(t),n(t),t}),[n]);return(0,F.jsxs)(s,{className:`canvas`,dpr:ce?[1,1]:r.dpr,performance:{min:.5,max:1,debounce:200},frameloop:i?`never`:`always`,gl:{antialias:!le&&e!==`low`,alpha:!1,powerPreference:`high-performance`},camera:{position:M.camera.position,fov:M.camera.fov},children:[(0,F.jsx)(`color`,{attach:`background`,args:[M.colors.background]}),(0,F.jsx)(`fog`,{attach:`fog`,args:[M.colors.fog,M.fog.near,M.fog.far]}),(0,F.jsxs)(P.Suspense,{fallback:null,children:[(0,F.jsx)(pn,{onTier:o}),(0,F.jsx)(un,{}),(0,F.jsx)(Qt,{},e),(0,F.jsx)(cn,{})]}),(0,F.jsx)(de,{}),(0,F.jsx)(dn,{}),(0,F.jsx)(g,{onDecline:c,onIncline:l,flipflops:3,onFallback:()=>o(`low`)}),(0,F.jsx)(h,{pixelated:!1}),(0,F.jsx)(p,{})]})}export{mn as default};