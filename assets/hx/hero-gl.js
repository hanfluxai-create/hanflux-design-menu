/* Hanflux Design Menu · hero scene: three liquid light forms over a neon lattice.
   Plain WebGL, one full-screen shader, rendered at reduced resolution and paused offscreen. */
(function () {
  'use strict';
  var canvas = document.querySelector('[data-hero-gl]');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  if (!gl) { canvas.classList.add('no-gl'); return; }
  var phone = window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;uniform float uSteps;uniform vec3 uOff;uniform float uSize;',
    'vec3 C0=vec3(0.153,0.949,0.753);vec3 C1=vec3(0.486,0.361,1.0);vec3 C2=vec3(1.0,0.239,0.498);',
    'vec3 b0;vec3 b1;vec3 b2;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}',
    'float wob(vec3 p,float s){return .06*sin(p.x*3.1+uTime*.9+s)*sin(p.y*2.7+uTime*.7)*sin(p.z*3.3+uTime*.8+s);}',
    'float map(vec3 p){',
    '  float d0=length(p-b0)-.62*uSize+wob(p,0.);float d1=length(p-b1)-.52*uSize+wob(p,2.);float d2=length(p-b2)-.42*uSize+wob(p,4.);',
    '  return smin(smin(d0,d1,.26),d2,.24);}',
    'vec3 tint(vec3 p){float w0=exp(-3.*max(length(p-b0)-.5,0.));float w1=exp(-3.*max(length(p-b1)-.45,0.));float w2=exp(-3.*max(length(p-b2)-.35,0.));return (C0*w0+C1*w1+C2*w2)/(w0+w1+w2+1e-4);}',
    'vec3 nrm(vec3 p){vec2 e=vec2(.0025,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}',
    'void main(){',
    '  vec2 uv=(gl_FragCoord.xy*2.-uRes)/min(uRes.x,uRes.y);',
    '  float t=uTime;float s=uScroll;',
    '  b0=uOff+vec3((sin(t*.31)*.28-.78)*uSize+uMouse.x*.15,(cos(t*.27)*.2-.05)*uSize+uMouse.y*.08,sin(t*.23)*.3);',
    '  b1=uOff+vec3((cos(t*.23)*.26+.78)*uSize+uMouse.x*.12,(sin(t*.29)*.22-.12)*uSize,cos(t*.19)*.3-.05);',
    '  b2=uOff+vec3((sin(t*.17+2.)*.3+.02)*uSize,(cos(t*.21+1.)*.18+.62)*uSize+uMouse.y*.1,sin(t*.25+.5)*.3-.45);',
    '  vec3 ro=vec3(uMouse.x*.25,.25-s*1.1,4.3-s*2.2);',
    '  vec3 ta=vec3(0.,.05-s*1.3,0.);',
    '  vec3 fw=normalize(ta-ro);vec3 rt=normalize(cross(fw,vec3(0.,1.,0.)));vec3 up=cross(rt,fw);',
    '  vec3 rd=normalize(uv.x*rt+uv.y*up+1.75*fw);',
    '  vec3 col=mix(vec3(.02,.024,.04),vec3(.008,.01,.02),clamp(uv.y*.5+.5,0.,1.));',
    '  vec2 sp2=uv*38.;vec2 sc=floor(sp2);float st=hash(sc);vec2 so=vec2(hash(sc+7.1),hash(sc+3.3));',
    '  float sd=length(fract(sp2)-so);col+=vec3(.8,.88,1.)*step(.93,st)*smoothstep(.09,0.,sd)*(.35+.65*sin(t*1.7+st*40.))*.9;',
    '  float fy=-1.05;float tf=-1.;',
    '  if(rd.y<-.001){tf=(fy-ro.y)/rd.y;}',
    '  float tt=0.;float hit=0.;vec3 p;',
    '  for(int i=0;i<64;i++){if(float(i)>=uSteps)break;p=ro+rd*tt;float d=map(p);if(d<.0015){hit=1.;break;}tt+=d*.9;if(tt>9.)break;}',
    '  if(hit>.5&&(tf<0.||tt<tf)){',
    '    vec3 n=nrm(p);vec3 v=-rd;vec3 c=tint(p);vec3 l=normalize(vec3(-.4,.8,.6));',
    '    float fr=pow(1.-max(dot(n,v),0.),3.);',
    '    float df=.25+.75*max(dot(n,l),0.);',
    '    float sp=pow(max(dot(reflect(-l,n),v),0.),48.);',
    '    vec3 r=reflect(rd,n);vec3 env=mix(vec3(.03,.035,.06),c*.9+.1,smoothstep(-.2,.9,r.y));',
    '    col=c*df*.78+env*.18+fr*c*1.25+sp*vec3(.95);',
    '    col+=c*.3*exp(-3.*max(0.,dot(n,l)));col=mix(vec3(dot(col,vec3(.3333))),col,1.25);',
    '  } else if(tf>0.){',
    '    vec3 q=ro+rd*tf;vec2 g=q.xz*vec2(1.25,1.25)+vec2(0.,t*.55+s*3.);',
    '    vec2 gf=abs(fract(g)-.5);float lw=.018+tf*.0045;',
    '    float line=max(smoothstep(.5-lw,.5,gf.x),smoothstep(.5-lw,.5,gf.y));',
    '    float fog=exp(-tf*.16);',
    '    vec3 gc=mix(C0,vec3(.55,.95,1.),.25)*line*fog*.9;',
    '    float pool=0.;vec3 pc=vec3(0.);',
    '    float e0=exp(-dot(q.xz-b0.xz,q.xz-b0.xz)*1.6);float e1=exp(-dot(q.xz-b1.xz,q.xz-b1.xz)*1.6);float e2=exp(-dot(q.xz-b2.xz,q.xz-b2.xz)*1.6);',
    '    pc=C0*e0+C1*e1+C2*e2;',
    '    col=col*.4+gc+pc*.22*fog+vec3(.01,.03,.03)*fog;',
    '  }',
    '  float hz=exp(-abs(rd.y+.02)*14.);col+=mix(C1,C0,.5+.5*sin(t*.2))*hz*.16;',
    '  col*=1.-.35*dot(uv*.45,uv*.45);',
    '  col=pow(col,vec3(.92));',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { canvas.classList.add('no-gl'); return; }
  var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.classList.add('no-gl'); return; }
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uRes', 'uTime', 'uMouse', 'uScroll', 'uSteps', 'uOff', 'uSize'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  var scale = phone ? 0.55 : 0.8, steps = phone ? 40 : 56;
  var mx = 0, my = 0, tmx = 0, tmy = 0, sc = 0;
  function resize() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, phone ? 2 : 1.5);
    var w = Math.max(2, Math.round(r.width * dpr * scale)), h = Math.max(2, Math.round(r.height * dpr * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });

  var visible = true, raf = 0, t0 = performance.now(), slow = 0, last = t0;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(canvas);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });

  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    resize();
    var dt = now - last; last = now;
    if (dt > 40) slow++; else slow = Math.max(0, slow - 1);
    if (slow > 30 && scale > 0.3) { scale -= 0.08; slow = 0; resize(); }
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    var r = canvas.getBoundingClientRect();
    sc += (Math.max(0, Math.min(1, -r.top / Math.max(1, r.height))) - sc) * 0.12;
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, reduce ? 12 : (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mx, my);
    gl.uniform1f(U.uScroll, sc);
    gl.uniform1f(U.uSteps, steps);
    var asp = canvas.width / Math.max(1, canvas.height);
    if (asp > 1.15) { gl.uniform3f(U.uOff, Math.min(2.7, 0.95 + asp * 0.85), 0.02, 0); gl.uniform1f(U.uSize, 1.0); }
    else { gl.uniform3f(U.uOff, 0.0, 2.75, -0.6); gl.uniform1f(U.uSize, 1.05); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!canvas.classList.contains('on')) canvas.classList.add('on');
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
})();
