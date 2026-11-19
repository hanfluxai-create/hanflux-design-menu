import{r as f,j as u}from"./vendor-Cn_kbzMn.js";import{C as ee,u as C,B as _,a as R,S as te,V as oe,b as S,c as D,M as L,d as K,D as U,e as X,f as ae,N as re}from"./three-BFHcPM1x.js";import{s as J,a as ne,g as N}from"./index-CwKXSQmN.js";import"./ui-Qn413-ph.js";const y=(a,o)=>a+Math.random()*(o-a);function se(a){const o=new Float32Array(a*3),i=[{radius:2,tilt:-14,share:.42,thick:.1,yJitter:.03},{radius:2.55,tilt:-14,share:.34,thick:.08,yJitter:.03},{radius:3.05,tilt:-14,share:.24,thick:.06,yJitter:.025}];let t=0;for(const e of i){const r=Math.floor(a*e.share),n=e.tilt*Math.PI/180,l=Math.cos(n),s=Math.sin(n);for(let c=0;c<r&&t<a;c++,t++){const d=c/r*Math.PI*2+y(-.02,.02),p=e.radius+y(-e.thick,e.thick),x=Math.cos(d)*p,m=Math.sin(d)*p,v=y(-e.yJitter,e.yJitter);o[t*3]=x,o[t*3+1]=v*l-m*s,o[t*3+2]=v*s+m*l}}for(;t<a;t++){const e=Math.random()*Math.PI*2;o[t*3]=Math.cos(e)*2,o[t*3+1]=y(-.03,.03),o[t*3+2]=Math.sin(e)*2}return o}function ie(a){const o=new Float32Array(a*3),i=16;for(let t=0;t<a;t++){const r=-2.6+Math.floor(Math.random()*i)/(i-1)*5.2;o[t*3]=y(-9,9),o[t*3+1]=r+y(-.07,.07),o[t*3+2]=y(-3.5,.8)}return o}function ce(a){const o=new Float32Array(a*3),i=24,t=14,e=16,r=.52,n=.5,l=.5,s=i*t*e;for(let c=0;c<a;c++)if(c<s){const d=c%i,p=Math.floor(c/i)%t,x=Math.floor(c/(i*t))%e;o[c*3]=(d-(i-1)/2)*r+y(-.03,.03),o[c*3+1]=(p-(t-1)/2)*n+y(-.03,.03),o[c*3+2]=(x-(e-1)/2)*l-2.5+y(-.03,.03)}else o[c*3]=y(-7,7),o[c*3+1]=y(-4,4),o[c*3+2]=y(-6,-2);return o}function le(a){const o=new Float32Array(a*3),i=96;for(let t=0;t<a;t++){const r=-7+t%i/(i-1)*14,l=.25+Math.exp(-(r*r)/26)*2.3,s=y(-1,1)*l*Math.pow(Math.random(),.4);o[t*3]=r+y(-.05,.05),o[t*3+1]=s,o[t*3+2]=y(-1.6,.4)}return o}function ue(a){const o=new Float32Array(a*3),i=Math.floor(a*.72),t=Math.PI*(3-Math.sqrt(5));for(let e=0;e<i;e++){const r=e/i,n=Math.acos(1-2*r),l=t*e,s=2.9+y(-.04,.04);o[e*3]=s*Math.sin(n)*Math.cos(l),o[e*3+1]=s*Math.cos(n),o[e*3+2]=s*Math.sin(n)*Math.sin(l)-.5}for(let e=i;e<a;e++){const r=y(.4,1.7),n=Math.random()*Math.PI*2,l=Math.acos(y(-1,1));o[e*3]=r*Math.sin(l)*Math.cos(n),o[e*3+1]=r*Math.sin(l)*Math.sin(n),o[e*3+2]=r*Math.cos(l)-.5}return o}function me(a){const o=new Float32Array(a*3),i=Math.floor(a*.78);for(let t=0;t<i;t++){const e=Math.random()*Math.PI*2,r=Math.acos(Math.pow(Math.random(),.65)),n=3.3+y(-.05,.05);o[t*3]=n*Math.sin(r)*Math.cos(e),o[t*3+1]=n*Math.cos(r)-1.4,o[t*3+2]=n*Math.sin(r)*Math.sin(e)-.8}for(let t=i;t<a;t++){const e=Math.random()*Math.PI*2,r=3.3+y(-.12,.12);o[t*3]=Math.cos(e)*r,o[t*3+1]=-1.4+y(-.04,.04),o[t*3+2]=Math.sin(e)*r-.8}return o}function de(a){const o=new Float32Array(a*3),i=3;for(let t=0;t<a;t++){const e=t%i,r=Math.pow(Math.random(),.7),n=.9+r*4.4,l=r*2.6,s=e/i*Math.PI*2+l+y(-.22,.22);o[t*3]=Math.cos(s)*n,o[t*3+1]=Math.sin(s)*n*.42+y(-.12,.12),o[t*3+2]=y(-.5,.5)-1.2}return o}const fe=[se,ie,ce,le,ue,me,de],ve=`
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
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
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
`,pe=`
attribute vec3 aP0;
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute vec3 aP6;
attribute vec4 aRand; // x: phase, y: speed, z: size, w: color pick

uniform float uTime;
uniform float uFormation; // continuous 0..6
uniform float uSize;
uniform float uPixelRatio;
uniform float uWobble;
uniform float uVelocity; // smoothed scroll velocity (warp factor)
uniform float uDeep;     // 0..1 deep-space factor
uniform float uLane;     // phones: 0..1 - keep the dust in edge lanes, clear of the text column

varying float vAlpha;
varying vec3 vColor;

const vec3 CYAN    = vec3(0.024, 0.714, 0.831); // #06b6d4
const vec3 VIOLET  = vec3(0.545, 0.361, 0.965); // #8b5cf6
const vec3 MAGENTA = vec3(0.926, 0.282, 0.600); // #ec4899
const vec3 INDIGO  = vec3(0.310, 0.275, 0.898); // #4f46e5

float easeT(float t){ return t*t*(3.0-2.0*t); }

void main() {
  float idx = clamp(floor(uFormation), 0.0, 6.0);
  float t = easeT(clamp(uFormation - idx, 0.0, 1.0));

  vec3 a; vec3 b;
  if      (idx < 0.5) { a = aP0; b = aP1; }
  else if (idx < 1.5) { a = aP1; b = aP2; }
  else if (idx < 2.5) { a = aP2; b = aP3; }
  else if (idx < 3.5) { a = aP3; b = aP4; }
  else if (idx < 4.5) { a = aP4; b = aP5; }
  else if (idx < 5.5) { a = aP5; b = aP6; }
  else                { a = aP6; b = aP6; }

  // particles take individual flight paths during a morph (staggered + arced)
  float lt = clamp(t * (1.15 + aRand.x * 0.25) - aRand.x * 0.2, 0.0, 1.0);
  vec3 pos = mix(a, b, lt);
  float arc = sin(lt * 3.14159) * aRand.y * 0.9;
  pos.y += arc * 0.5;
  pos.x += arc * (aRand.w - 0.5);

  // ambient organic drift
  float ph = aRand.x * 6.28318;
  float spd = 0.4 + aRand.y * 0.8;
  pos += vec3(
    sin(uTime * spd + ph),
    cos(uTime * spd * 0.83 + ph * 1.4),
    sin(uTime * spd * 0.61 + ph * 2.1)
  ) * uWobble * (0.04 + aRand.z * 0.07);

  // formation 1: speed streak flow (wrap around x)
  float m1 = 1.0 - min(abs(uFormation - 1.0), 1.0);
  if (m1 > 0.001) {
    float flow = mod(pos.x + uTime * (2.2 + aRand.y * 3.0), 18.0) - 9.0;
    pos.x = mix(pos.x, flow, m1);
  }

  // formation 3: live equalizer pulse
  float m3 = 1.0 - min(abs(uFormation - 3.0), 1.0);
  if (m3 > 0.001) {
    float env = exp(-(pos.x * pos.x) / 26.0);
    pos.y += sin(uTime * 3.2 + pos.x * 1.9 + ph) * (0.18 + env * 0.55) * m3;
  }

  // formation 6: slow vortex rotation
  float m6 = 1.0 - min(abs(uFormation - 6.0), 1.0);
  if (m6 > 0.001) {
    float ang = uTime * 0.12 * (0.6 + aRand.y * 0.5) * m6;
    float ca = cos(ang); float sa = sin(ang);
    pos.xy = vec2(pos.x * ca - pos.y * sa, pos.x * sa + pos.y * ca) * m6 + pos.xy * (1.0 - m6);
  }

  // hyperspace warp: scroll velocity stretches the universe vertically
  float warp = clamp(uVelocity * 0.012, -1.4, 1.4);
  pos.y -= warp * (1.2 + aRand.y * 2.2);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // crisp dust: ~2-7 css px at the focal plane
  gl_PointSize = uSize * uPixelRatio * (0.5 + aRand.z) * (38.0 / max(1.0, -mvPosition.z));

  // color: saturated brand palette (reads crisply on white)
  vec3 col;
  if      (aRand.w < 0.32) col = CYAN;
  else if (aRand.w < 0.60) col = VIOLET;
  else if (aRand.w < 0.84) col = MAGENTA;
  else                     col = INDIGO;
  // in deep space the dust brightens toward starlight
  col = mix(col, vec3(0.85, 0.89, 1.0), uDeep * 0.55);
  vColor = col;

  // depth fade keeps far particles whisper-quiet
  float depthFade = smoothstep(-14.0, 2.5, mvPosition.z);
  vAlpha = (0.45 + aRand.z * 0.55) * depthFade;
  // phones, past the hero: the centre column belongs to the text, so the dust
  // gathers into luminous lanes along both screen edges
  float laneX = abs(gl_Position.x / max(gl_Position.w, 1e-4));
  vAlpha *= mix(1.0, smoothstep(0.5, 0.92, laneX) * 1.35, uLane);
  // shimmer during morph flight + warp glow
  vAlpha *= 1.0 + sin(lt * 3.14159) * 0.3 + abs(warp) * 0.4;
}
`,he=`
uniform float uOpacity;
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  // hard core, thin soft edge - a dot, not a glow ball
  float soft = smoothstep(0.5, 0.32, d);
  gl_FragColor = vec4(vColor, soft * vAlpha * uOpacity);
}
`,Z=`
${ve}
uniform float uTime;
uniform float uDistort;
uniform float uSeed;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vNoise;

float blobNoise(vec3 p) {
  return snoise(p * 1.05 + uTime * 0.20 + uSeed) * 0.78
       + snoise(p * 2.4 - uTime * 0.14 + uSeed * 2.0) * 0.22;
}

void main() {
  float n = blobNoise(position);
  vec3 displaced = position + normal * n * uDistort;
  vNoise = n;

  // perturb the normal from the noise gradient so lighting follows the liquid
  float eps = 0.12;
  vec3 grad = vec3(
    blobNoise(position + vec3(eps, 0.0, 0.0)) - n,
    blobNoise(position + vec3(0.0, eps, 0.0)) - n,
    blobNoise(position + vec3(0.0, 0.0, eps)) - n
  ) / eps;
  vec3 tangentGrad = grad - dot(grad, normal) * normal;
  vec3 newNormal = normalize(normal - tangentGrad * uDistort * 1.6);

  vNormal = normalize(mat3(modelMatrix) * newNormal);
  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`,q=`
uniform float uTime;
uniform float uOpacity;
uniform vec3 uCameraPos;
uniform float uSeed;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vNoise;

const vec3 CYAN    = vec3(0.024, 0.714, 0.831);
const vec3 VIOLET  = vec3(0.545, 0.361, 0.965);
const vec3 MAGENTA = vec3(0.926, 0.282, 0.600);
const vec3 INDIGO  = vec3(0.245, 0.220, 0.820);
const vec3 SKY     = vec3(0.490, 0.827, 0.988); // #7dd3fc

void main() {
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPos - vWorldPos);

  // --- flowing mesh-gradient base color ---
  float band1 = sin(vNoise * 2.6 + uTime * 0.35 + n.x * 2.2 + uSeed) * 0.5 + 0.5;
  float band2 = cos(vNoise * 2.0 - uTime * 0.28 + n.y * 2.8 + uSeed * 1.7) * 0.5 + 0.5;
  float band3 = sin(n.z * 3.0 + uTime * 0.22 + vNoise * 1.5) * 0.5 + 0.5;

  vec3 col = mix(CYAN, VIOLET, band1 * 0.85);
  col = mix(col, MAGENTA, band2 * 0.75);
  col = mix(col, INDIGO, band3 * 0.18);
  col = mix(col, SKY, smoothstep(0.2, 0.95, n.y) * 0.50);

  // --- studio lighting ---
  vec3 keyDir  = normalize(vec3(0.55, 0.85, 0.65));
  vec3 fillDir = normalize(vec3(-0.7, -0.2, 0.4));
  float key  = dot(n, keyDir) * 0.5 + 0.5;       // half-lambert
  float fill = max(dot(n, fillDir), 0.0);
  col *= 0.52 + key * 0.62 + fill * 0.10;

  // specular highlights - wet liquid feel
  vec3 h = normalize(keyDir + viewDir);
  float spec = pow(max(dot(n, h), 0.0), 64.0);
  col += spec * 0.85;
  vec3 h2 = normalize(fillDir + viewDir);
  col += pow(max(dot(n, h2), 0.0), 90.0) * 0.25 * MAGENTA;

  // luminous rim against the white page
  float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.6);
  col = mix(col, vec3(0.97, 0.95, 1.0), fresnel * 0.55);

  gl_FragColor = vec4(col, uOpacity);
}
`,xe=`
attribute float aTwinkle;
uniform float uTime;
uniform float uPixelRatio;
varying float vTwinkle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float tw = 0.6 + 0.4 * sin(uTime * (0.4 + aTwinkle * 1.2) + aTwinkle * 40.0);
  vTwinkle = tw;
  gl_PointSize = uPixelRatio * (1.0 + aTwinkle * 2.4) * tw * (30.0 / max(1.0, -mvPosition.z));
}
`,ye=`
uniform float uDeep; // 0..1
varying float vTwinkle;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.15, d);
  // cool slate dust by day, silver starlight at night
  vec3 day = vec3(0.55, 0.60, 0.72);
  vec3 night = vec3(0.96, 0.97, 1.0);
  vec3 col = mix(day, night, uDeep);
  float alpha = soft * vTwinkle * mix(0.18, 0.95, uDeep);
  gl_FragColor = vec4(col, alpha);
}
`,ge=`
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,we=`
uniform vec3 uTop;      // sRGB 0..1
uniform vec3 uBottom;   // sRGB 0..1
uniform float uDeep;    // 0..1
uniform vec3 uGlow;     // phone hero glow: xy = centre in CSS px from the canvas top-left, z = strength (0 on desktop)
uniform vec2 uRes;      // canvas size in CSS px
varying vec2 vUv;

float grainHash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  vec3 col = mix(uBottom, uTop, vUv.y);

  // radial-gradient(circle at 78% 3%-of-the-document, rgba(139,92,246,.13), transparent 28rem)
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  float d = distance(px, uGlow.xy);
  float glow = clamp(1.0 - d / 448.0, 0.0, 1.0) * 0.13 * uGlow.z;
  col = mix(col, vec3(0.545, 0.361, 0.965), glow);

  float n = grainHash(floor(gl_FragCoord.xy));
  vec3 day = col * (1.0 - 0.025 * (1.0 - n));
  vec3 night = col + (1.0 - col) * 0.04 * n;
  gl_FragColor = vec4(uDeep > 0.5 ? night : day, 1.0);
}
`,be=`
attribute vec3 aPrev;
attribute vec3 aNext;
attribute float aSide;  // -1 / +1 across the strip
attribute float aT;     // 0 head -> 1 tail
uniform float uRadius;
varying vec2 vUv;
varying float vSide;

void main() {
  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
  vec3 prev = (modelViewMatrix * vec4(aPrev, 1.0)).xyz;
  vec3 next = (modelViewMatrix * vec4(aNext, 1.0)).xyz;
  vec3 dir = next - prev;
  dir = length(dir) > 1e-5 ? normalize(dir) : vec3(1.0, 0.0, 0.0);
  vec3 side = normalize(cross(dir, vec3(0.0, 0.0, 1.0)) + vec3(1e-6));
  viewPos.xyz += side * aSide * uRadius;
  vUv = vec2(aT, aSide * 0.5 + 0.5);
  vSide = aSide;
  gl_Position = projectionMatrix * viewPos;
}
`,Me=`
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
uniform float uTime;
varying vec2 vUv;
varying float vSide;

void main() {
  // uv.x runs head (0) -> tail (1)
  vec3 col = mix(uColorA, uColorB, vUv.x);
  float sheen = pow(0.5 + 0.5 * sin(vUv.x * 14.0 - uTime * 2.4), 3.0);
  col += sheen * 0.28;
  // rounded "tube" shading across the strip
  float facing = sqrt(max(0.0, 1.0 - vSide * vSide));
  col *= 0.7 + facing * 0.45;
  float alpha = pow(1.0 - vUv.x, 1.6) * smoothstep(0.0, 0.04, vUv.x);
  alpha *= smoothstep(0.0, 0.35, facing);
  gl_FragColor = vec4(col, alpha * uOpacity);
}
`,E=[{orb:[2.7,.1,0],scale:1.3,distort:.3,particleOpacity:.9,wobble:.35,camZ:8},{orb:[-3.3,.35,-.6],scale:.95,distort:.44,particleOpacity:.85,wobble:1.6,camZ:8.4},{orb:[3.1,-.4,-1.6],scale:.68,distort:.22,particleOpacity:.8,wobble:.7,camZ:8.9},{orb:[-3.1,0,-.6],scale:.88,distort:.4,particleOpacity:.9,wobble:1.2,camZ:8.2},{orb:[0,.25,-1.6],scale:.58,distort:.2,particleOpacity:.85,wobble:.8,camZ:9.2},{orb:[0,-1.05,-.9],scale:.8,distort:.16,particleOpacity:.8,wobble:.6,camZ:8.8},{orb:[0,.15,-1.1],scale:1.15,distort:.3,particleOpacity:.85,wobble:.9,camZ:8.3}],b=(a,o,i)=>a+(o-a)*i,F=a=>a*a*(3-2*a);function Y(a){const o=L.clamp(a,0,E.length-1),i=Math.min(E.length-1,Math.floor(o)),t=Math.min(E.length-1,i+1);return{A:E[i],B:E[t],t:F(o-i)}}const O={high:{name:"high",dpr:2,minDpr:1.25,orbSeg:128,smallSeg:48},mid:{name:"mid",dpr:1.5,minDpr:1,orbSeg:96,smallSeg:32},low:{name:"low",dpr:1.5,minDpr:1,orbSeg:88,smallSeg:24}};function Pe(){var a;try{const o=document.createElement("canvas"),i=o.getContext("webgl2")||o.getContext("webgl");if(!i)return{ok:!1,renderer:""};const t=i.getExtension("WEBGL_debug_renderer_info"),e=t?String(i.getParameter(t.UNMASKED_RENDERER_WEBGL)||""):"";return(a=i.getExtension("WEBGL_lose_context"))==null||a.loseContext(),{ok:!0,renderer:e}}catch{return{ok:!1,renderer:""}}}function Te(a){const o=window.matchMedia("(hover: none), (pointer: coarse)").matches,i=navigator,t=navigator.hardwareConcurrency||4,e=i.deviceMemory||4,r=a.renderer,n=/iPhone|iPad|iPod/.test(navigator.userAgent)||/Mac/.test(navigator.userAgent)&&navigator.maxTouchPoints>1;return/swiftshader|llvmpipe|software|basic render/i.test(r)?{...O.low,dpr:1}:o||window.innerWidth<768?{...O.low,dpr:n?1.5:1.3}:t<=4||e<=4||/intel(?!.*(arc|iris xe))/i.test(r)||/mali|adreno [1-5]/i.test(r)?O.mid:O.high}const Se=()=>({priority:0,enabled:!1,handlers:{},connected:void 0,compute:()=>{},connect:()=>{},disconnect:()=>{},update:()=>{}});function ze({tier:a,onFirstFrame:o}){const i=C(l=>l.advance),t=C(l=>l.gl),e=C(l=>l.scene),r=C(l=>l.camera),n=C(l=>l.setDpr);return f.useEffect(()=>{let l=0,s=!0,c=!1,d=0,p=0,x=!1;const m=[];let v=1,g=0,w=0,P=Math.min(window.devicePixelRatio||1,a.dpr);const h=[];let M=0,A=0;const T=()=>document.hidden||document.body.classList.contains("demo-open"),k=j=>{if(!s)return;if(l=requestAnimationFrame(k),w&&m.length<40&&(m.push(j-w),m.length===40)){const H=[...m].sort((I,V)=>I-V);v=a.name==="low"&&H[20]<10?2:1}if(w=j,g++,v>1&&g%v!==0)return;if(T()){d=j;return}const G=d?j-d:16.7;if(d=j,p+=Math.min(G,50)/1e3,i(p,!0),!x){x=!0,A=j+2500,o();return}if(!(j<A||G>250)&&(h.push(G*(v>1?.5:1)),h.length>=90)){const I=[...h].sort((V,Q)=>V-Q)[45];h.length=0,I>21?M++:M=0,M>=2&&P>a.minDpr&&(M=0,P=Math.max(a.minDpr,Math.round((P-.25)*100)/100),n(P),A=j+1500)}},z=()=>{c||!s||(c=!0,l=requestAnimationFrame(k))};try{t.compileAsync(e,r).then(z,z)}catch{z()}const B=window.setTimeout(z,1500);return()=>{s=!1,window.clearTimeout(B),cancelAnimationFrame(l)}},[i,t,e,r,n,a,o]),null}function je({glow:a}){const o=C(e=>e.size),{geometry:i,material:t}=f.useMemo(()=>{const e=new _;e.setAttribute("position",new R(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));const r=new te({vertexShader:ge,fragmentShader:we,uniforms:{uTop:{value:new S(1,1,1)},uBottom:{value:new S(.957,.965,.992)},uDeep:{value:0},uGlow:{value:new S(0,-9999,0)},uRes:{value:new oe(1,1)}},depthTest:!1,depthWrite:!1});return{geometry:e,material:r}},[]);return f.useEffect(()=>()=>{i.dispose(),t.dispose()},[i,t]),f.useEffect(()=>{t.uniforms.uRes.value.set(o.width,o.height)},[t,o]),D(e=>{const r=N(),n=t.uniforms;n.uTop.value.set(r.skyTop[0]/255,r.skyTop[1]/255,r.skyTop[2]/255),n.uBottom.value.set(r.skyBottom[0]/255,r.skyBottom[1]/255,r.skyBottom[2]/255),n.uDeep.value=r.deep,n.uGlow.value.set(.78*e.size.width,.03*r.docHeight-r.scroll,a?1:0)}),u.jsx("mesh",{geometry:i,material:t,frustumCulled:!1,renderOrder:-1e3})}const Re=new S(2.7,.1,0),$=1.15;function Ae({count:a,isMobile:o}){const i=f.useRef(null),t=f.useRef(0),{geometry:e,uniforms:r}=f.useMemo(()=>{const n=new _;fe.forEach((c,d)=>{const p=c(a);if(d===0){const x=o?.42:1,m=o?0:2.7,v=o?$:.1,g=o?.3:0;for(let w=0;w<a;w++)p[w*3]=p[w*3]*x+m,p[w*3+1]=p[w*3+1]*x+v,p[w*3+2]=p[w*3+2]*x+g}n.setAttribute(`aP${d}`,new R(p,3))}),n.setAttribute("position",n.getAttribute("aP0"));const l=new Float32Array(a*4);for(let c=0;c<a*4;c++)l[c]=Math.random();return n.setAttribute("aRand",new R(l,4)),n.boundingSphere=new K(new S(0,0,0),30),{geometry:n,uniforms:{uTime:{value:0},uFormation:{value:0},uSize:{value:1},uPixelRatio:{value:1},uWobble:{value:.35},uOpacity:{value:.9},uVelocity:{value:0},uDeep:{value:0},uLane:{value:0}}}},[a,o]);return f.useEffect(()=>()=>e.dispose(),[e]),D((n,l)=>{var m;const s=(m=i.current)==null?void 0:m.uniforms;if(!s)return;const c=N();s.uPixelRatio.value=n.viewport.dpr,s.uTime.value=n.clock.elapsedTime,t.current=b(t.current,c.chapter,Math.min(1,l*3.2)),s.uFormation.value=t.current,s.uVelocity.value=c.velocity,s.uDeep.value=c.deep,s.uLane.value=o?F(Math.min(1,Math.max(0,(t.current-.35)/.5))):0;const{A:d,B:p,t:x}=Y(t.current);s.uWobble.value=b(d.wobble,p.wobble,x),s.uOpacity.value=b(d.particleOpacity,p.particleOpacity,x)}),u.jsx("points",{geometry:e,frustumCulled:!1,children:u.jsx("shaderMaterial",{ref:i,uniforms:r,vertexShader:pe,fragmentShader:he,transparent:!0,depthWrite:!1,blending:re})})}function ke({count:a}){const o=f.useRef(null),{geometry:i,uniforms:t}=f.useMemo(()=>{const e=new _,r=new Float32Array(a*3),n=new Float32Array(a);for(let s=0;s<a;s++)r[s*3]=(Math.random()*2-1)*17,r[s*3+1]=(Math.random()*2-1)*10,r[s*3+2]=-9-Math.random()*14,n[s]=Math.random();return e.setAttribute("position",new R(r,3)),e.setAttribute("aTwinkle",new R(n,1)),e.boundingSphere=new K(new S(0,0,-16),40),{geometry:e,uniforms:{uTime:{value:0},uPixelRatio:{value:1},uDeep:{value:0}}}},[a]);return f.useEffect(()=>()=>i.dispose(),[i]),D(e=>{var n;const r=(n=o.current)==null?void 0:n.uniforms;r&&(r.uPixelRatio.value=e.viewport.dpr,r.uTime.value=e.clock.elapsedTime,r.uDeep.value=N().deep)}),u.jsx("points",{geometry:i,frustumCulled:!1,children:u.jsx("shaderMaterial",{ref:o,uniforms:t,vertexShader:xe,fragmentShader:ye,transparent:!0,depthWrite:!1})})}function W({radius:a,speed:o,phase:i,tilt:t,size:e,seed:r,segments:n}){const l=f.useRef(null),s=f.useRef(null),c=f.useMemo(()=>({uTime:{value:0},uDistort:{value:.25},uOpacity:{value:1},uSeed:{value:r},uCameraPos:{value:new S}}),[r]);return D(d=>{const p=l.current;if(!p)return;const x=d.clock.elapsedTime*o+i,m=Math.cos(x)*a,v=Math.sin(x)*a,g=Math.sin(x*1.3)*a*.25;p.position.set(m,g*Math.cos(t)-v*Math.sin(t),g*Math.sin(t)+v*Math.cos(t)),s.current&&(s.current.uniforms.uTime.value=d.clock.elapsedTime,s.current.uniforms.uCameraPos.value.copy(d.camera.position))}),u.jsxs("mesh",{ref:l,scale:e,children:[u.jsx("sphereGeometry",{args:[1,n,n]}),u.jsx("shaderMaterial",{ref:s,uniforms:c,vertexShader:Z,fragmentShader:q})]})}function Ce({position:a,scale:o,seed:i,ring:t,segments:e}){const r=f.useRef(null),n=f.useRef(null),l=f.useMemo(()=>({uTime:{value:0},uDistort:{value:.05},uOpacity:{value:1},uSeed:{value:i},uCameraPos:{value:new S}}),[i]);return D((s,c)=>{r.current&&(r.current.rotation.y+=c*.04),n.current&&(n.current.uniforms.uTime.value=s.clock.elapsedTime*.3,n.current.uniforms.uCameraPos.value.copy(s.camera.position))}),u.jsxs("group",{position:a,scale:o,children:[u.jsxs("mesh",{ref:r,children:[u.jsx("sphereGeometry",{args:[1,e,e]}),u.jsx("shaderMaterial",{ref:n,uniforms:l,vertexShader:Z,fragmentShader:q})]}),t&&u.jsxs("mesh",{rotation:[1.35,.25,0],children:[u.jsx("torusGeometry",{args:[1.7,.04,6,96]}),u.jsx("meshBasicMaterial",{color:"#8b5cf6",transparent:!0,opacity:.35,depthWrite:!1})]})]})}const De=26;function Ee(){const a=f.useRef(null),o=f.useRef(null),i=f.useRef(null),t=f.useMemo(()=>new S,[]),e=f.useRef(!1),{geometry:r,history:n,uniforms:l}=f.useMemo(()=>{const s=De,c=new _,d=new Float32Array(s*2*3),p=new Float32Array(s*2*3),x=new Float32Array(s*2*3),m=new Float32Array(s*2),v=new Float32Array(s*2);for(let h=0;h<s;h++)m[h*2]=-1,m[h*2+1]=1,v[h*2]=v[h*2+1]=h/(s-1);const g=[];for(let h=0;h<s-1;h++){const M=h*2;g.push(M,M+1,M+2,M+1,M+3,M+2)}c.setAttribute("position",new R(d,3).setUsage(U)),c.setAttribute("aPrev",new R(p,3).setUsage(U)),c.setAttribute("aNext",new R(x,3).setUsage(U)),c.setAttribute("aSide",new R(m,1)),c.setAttribute("aT",new R(v,1)),c.setIndex(g);const w=[];for(let h=0;h<s;h++)w.push(new S);const P={uColorA:{value:new X("#eef2ff")},uColorB:{value:new X("#a5b4fc")},uOpacity:{value:.55},uTime:{value:0},uRadius:{value:.03}};return{geometry:c,history:w,uniforms:P}},[]);return f.useEffect(()=>()=>r.dispose(),[r]),D((s,c)=>{var P;const d=s.clock.elapsedTime%24,p=d<5.5;if(a.current&&(a.current.visible=p),o.current&&(o.current.visible=p),!p){e.current=!1;return}const x=d/5.5;t.set(-17+x*34,6.5-x*7.5,-12),(P=a.current)==null||P.position.copy(t),e.current||(e.current=!0,n.forEach(h=>h.copy(t))),n[0].lerp(t,Math.min(1,c*16));for(let h=1;h<n.length;h++)n[h].lerp(n[h-1],Math.min(1,c*11));const m=r.getAttribute("position"),v=r.getAttribute("aPrev"),g=r.getAttribute("aNext"),w=n.length;for(let h=0;h<w;h++){const M=n[h],A=n[Math.max(0,h-1)],T=n[Math.min(w-1,h+1)];for(let k=0;k<2;k++){const z=h*2+k;m.setXYZ(z,M.x,M.y,M.z),v.setXYZ(z,A.x,A.y,A.z),g.setXYZ(z,T.x,T.y,T.z)}}m.needsUpdate=!0,v.needsUpdate=!0,g.needsUpdate=!0,i.current&&(i.current.uniforms.uTime.value=s.clock.elapsedTime)}),u.jsxs(u.Fragment,{children:[u.jsxs("mesh",{ref:a,scale:.07,visible:!1,children:[u.jsx("sphereGeometry",{args:[1,16,16]}),u.jsx("meshBasicMaterial",{color:"#eef2ff"})]}),u.jsx("mesh",{ref:o,geometry:r,frustumCulled:!1,visible:!1,children:u.jsx("shaderMaterial",{ref:i,uniforms:l,vertexShader:be,fragmentShader:Me,transparent:!0,depthWrite:!1,side:ae})})]})}function Fe({isMobile:a,segments:o,satSegments:i}){const t=f.useRef(null),e=f.useRef(null),r=f.useRef(null),n=f.useRef(null),l=f.useMemo(()=>({uTime:{value:0},uDistort:{value:.3},uOpacity:{value:1},uSeed:{value:0},uCameraPos:{value:new S}}),[]);return D((s,c)=>{const d=t.current;if(!d)return;const p=N().chapter,{A:x,B:m,t:v}=Y(p),g=Math.min(1,Math.max(0,p)),w=a?b($-.07,.12,F(g)):0,P=a?F(g):1,h=b(x.orb[0],m.orb[0],v)*(a?.36*P:1),M=b(x.orb[1],m.orb[1],v)*(a?.72:1)+Math.sin(s.clock.elapsedTime*.5)*.1+w,A=b(x.orb[2],m.orb[2],v)+(a?.55:0),T=Math.min(1,c*2.8);d.position.x=b(d.position.x,h,T),d.position.y=b(d.position.y,M,T),d.position.z=b(d.position.z,A,T);const k=1-Math.min(Math.abs(p-3),1),z=1+Math.sin(s.clock.elapsedTime*5.5)*.05*k,B=a?b(.42,.54,F(g)):1,j=b(x.scale,m.scale,v)*B*z;d.scale.setScalar(b(d.scale.x,j,T)),Re.copy(d.position),d.scale.x,e.current&&(e.current.rotation.y+=c*.12,e.current.rotation.x=Math.sin(s.clock.elapsedTime*.08)*.2),r.current&&(r.current.uniforms.uTime.value=s.clock.elapsedTime,r.current.uniforms.uDistort.value=b(r.current.uniforms.uDistort.value,b(x.distort,m.distort,v),T),r.current.uniforms.uCameraPos.value.copy(s.camera.position)),n.current&&(n.current.rotation.z+=c*.06,n.current.rotation.x=Math.sin(s.clock.elapsedTime*.1)*.18)}),u.jsxs("group",{ref:t,children:[u.jsxs("mesh",{ref:e,children:[u.jsx("sphereGeometry",{args:[1.05,o,o]}),u.jsx("shaderMaterial",{ref:r,uniforms:l,vertexShader:Z,fragmentShader:q})]}),u.jsx(W,{radius:1.85,speed:.55,phase:0,tilt:.45,size:.16,seed:3.1,segments:i}),u.jsx(W,{radius:2.3,speed:.38,phase:2.1,tilt:-.3,size:.11,seed:7.7,segments:i}),u.jsx(W,{radius:2.75,speed:.28,phase:4.4,tilt:.9,size:.085,seed:12.3,segments:i}),u.jsxs("group",{ref:n,rotation:[1.25,.2,0],children:[u.jsxs("mesh",{children:[u.jsx("torusGeometry",{args:[1.85,.0045,8,160]}),u.jsx("meshBasicMaterial",{color:"#8b5cf6",transparent:!0,opacity:.35,depthWrite:!1})]}),u.jsxs("mesh",{rotation:[.3,.5,0],children:[u.jsx("torusGeometry",{args:[2.3,.0038,8,160]}),u.jsx("meshBasicMaterial",{color:"#6366f1",transparent:!0,opacity:.3,depthWrite:!1})]}),u.jsxs("mesh",{rotation:[-.25,-.4,.3],children:[u.jsx("torusGeometry",{args:[2.75,.003,8,160]}),u.jsx("meshBasicMaterial",{color:"#94a3b8",transparent:!0,opacity:.22,depthWrite:!1})]})]})]})}function Ne({parallax:a,calm:o=!1}){const i=f.useRef({x:0,y:0}),t=C(n=>n.size),e=C(n=>n.camera),r=f.useRef(42);return f.useEffect(()=>{e.manual=!0;const n=t.width,l=t.height,s=Math.min(l,ne()),c=Math.max(0,l-s);c>1?(e.aspect=n/(l+c),e.setViewOffset(n,l+c,0,c,n,l),r.current=L.radToDeg(2*Math.atan(Math.tan(L.degToRad(21))*(l+c)/s))):(e.clearViewOffset(),e.aspect=n/l,r.current=42),e.fov=r.current,e.updateProjectionMatrix()},[e,t.width,t.height]),f.useEffect(()=>{if(!a)return;const n=l=>{i.current.x=l.clientX/window.innerWidth*2-1,i.current.y=l.clientY/window.innerHeight*2-1};return window.addEventListener("pointermove",n,{passive:!0}),()=>window.removeEventListener("pointermove",n)},[a]),D((n,l)=>{const s=N(),{A:c,B:d,t:p}=Y(s.chapter),x=b(c.camZ,d.camZ,p),m=Math.min(1,l*2.5);e.position.x=b(e.position.x,i.current.x*.5,m),e.position.y=b(e.position.y,-i.current.y*.35,m),e.position.z=b(e.position.z,x,m);const v=r.current+(o?0:Math.min(9,Math.abs(s.velocity)*.02)),g=b(e.fov,v,Math.min(1,l*4));Math.abs(g-e.fov)>.001&&(e.fov=g,e.updateProjectionMatrix()),e.lookAt(0,0,-1)}),null}function Oe(){return u.jsxs("div",{"aria-hidden":!0,className:"oraya-scene-fallback fixed inset-0 z-0 pointer-events-none overflow-hidden",children:[u.jsx("div",{className:"absolute top-[8%] right-[12%] w-[44rem] h-[44rem] rounded-full bg-gradient-to-br from-cyan-200/40 via-violet-200/30 to-pink-200/30 blur-3xl"}),u.jsx("div",{className:"absolute bottom-[10%] left-[6%] w-[34rem] h-[34rem] rounded-full bg-gradient-to-tr from-violet-200/30 to-cyan-200/30 blur-3xl"}),u.jsxs("div",{className:"persistent-orb-fallback",children:[u.jsx("i",{}),u.jsx("i",{}),u.jsx("i",{})]})]})}function Ve(){var x;const[a]=f.useState(()=>{const m=window.matchMedia("(prefers-reduced-motion: reduce)").matches,v=Pe();return{reduced:m,gfx:v,tier:Te(v)}}),[o,i]=f.useState(()=>window.matchMedia("(max-width: 1023px)").matches),[t]=f.useState(()=>window.matchMedia("(hover: hover) and (pointer: fine)").matches),[e,r]=f.useState(!1),[n,l]=f.useState(!1);f.useEffect(()=>{const m=window.matchMedia("(max-width: 1023px)"),v=g=>i(g.matches);return m.addEventListener("change",v),()=>m.removeEventListener("change",v)},[]),f.useEffect(()=>{if(!e||n)return;document.documentElement.setAttribute("data-oraya-webgl","ready");const m=window.setTimeout(()=>J("webgl"),750);return()=>{window.clearTimeout(m),J("css"),document.documentElement.removeAttribute("data-oraya-webgl")}},[e,n]);const s=f.useMemo(()=>()=>{r(!0),window.setTimeout(()=>{var m,v;return(v=(m=window.HX)==null?void 0:m.ready)==null?void 0:v.call(m)},900)},[]);if(!a.gfx.ok||n)return u.jsx(Oe,{});const{tier:c}=a,d=!!((x=window.HX)!=null&&x.lite),p=(o?1800:3200)/(d?2:1);return u.jsx("div",{"aria-hidden":!0,className:`oraya-canvas-shell${e?" is-shown":""}`,children:u.jsxs(ee,{frameloop:"never",dpr:Math.min(window.devicePixelRatio||1,c.dpr),resize:{scroll:!1,debounce:{scroll:50,resize:150}},events:Se,style:{pointerEvents:"none"},camera:{fov:42,position:[0,0,8],near:.1,far:60},gl:{alpha:!1,antialias:!0,stencil:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1},onCreated:({gl:m})=>{m.setClearColor(16054013,1),m.domElement.addEventListener("webglcontextlost",v=>{v.preventDefault(),l(!0)},{once:!0})},children:[u.jsx(ze,{tier:c,onFirstFrame:s}),u.jsx(je,{glow:o}),u.jsx(Ne,{parallax:t&&!a.reduced,calm:a.reduced}),u.jsx(ke,{count:(o?400:750)/(d?2:1)}),u.jsx(Ce,{position:[10,-3.2,-17],scale:1.15,seed:33.8,ring:!0,segments:c.smallSeg}),u.jsx(Ee,{}),u.jsx(Ae,{count:p,isMobile:o}),u.jsx(Fe,{isMobile:o,segments:o?Math.min(c.orbSeg,88):c.orbSeg,satSegments:c.smallSeg})]})})}export{Ve as default};
