import{m as t,q as U,o as X,s as Y,T as W,z as H,a as J,c as $,i as N,p as Q}from"./vendor.24cce9d5.js";const Z=function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function f(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerpolicy&&(l.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?l.credentials="include":r.crossorigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(r){if(r.ep)return;r.ep=!0;const l=f(r);fetch(r.href,l)}};Z();const ee="modulepreload",R={},te="/kata-clusters/",ne=function(i,f){return!f||f.length===0?i():Promise.all(f.map(s=>{if(s=`${te}${s}`,s in R)return;R[s]=!0;const r=s.endsWith(".css"),l=r?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${l}`))return;const c=document.createElement("link");if(c.rel=r?"stylesheet":ee,r||(c.as="script",c.crossOrigin=""),c.href=s,document.head.appendChild(c),r)return new Promise((a,g)=>{c.addEventListener("load",a),c.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${s}`)))})})).then(()=>i())};t.object({id:t.string(),name:t.string(),approved:t.boolean(),tags:t.array(t.string())});const re=t.object({id:t.string(),name:t.string(),group:t.number(),index:t.number(),x:t.number(),y:t.number()}),oe=t.object({width:t.number().int(),height:t.number().int(),nodes:t.array(t.tuple([t.string(),t.string(),t.number().int(),t.number().int(),t.number().int()])),links:t.array(t.tuple([t.number().int(),t.number().int()]))}),ie=t.object({nodes:t.array(re),links:t.array(t.tuple([t.number().int(),t.number().int()])),maxX:t.number(),maxY:t.number()}),k=1,se=6,ce=4,I="#18181B",le=p=>p.group===k?p.id:p.name;function ae(p){const{nodes:i,links:f,maxX:s,maxY:r}=ie.parse(p),l=U(i,e=>e.x,e=>e.y),c=[];for(let e=0;e<i.length;++e)c[e]=new Set;for(const[e,o]of f)c[e].add(o);let a=null;const g=new Set;let m=null;const L=X(Y(i.map(e=>e.group)),W);let y=N;const _=q(),A=J("#canvas").call(_).on("mousemove",E(V,100)).on("click",j).on("auxclick",B);document.addEventListener("keydown",F),window.addEventListener("resize",E(C,500));const u=A.node(),n=u.getContext("2d");C();function K(){const e=Math.min(u.width/s,u.height/r)*.8,[o,d]=[(u.width-e*s)/2,(u.height-e*r)/2];A.transition().duration(250).call(_.transform,N.translate(o,d).scale(e))}function C(){u.width=window.innerWidth,u.height=window.innerHeight,u.style.width=u.width,u.style.height=u.height,K()}function q(){return H().scaleExtent([1/8,4]).on("zoom",E(e=>{y=e.transform,x()},50))}function v(e){const o=n.canvas.width,d=n.canvas.height,[h,w]=y.apply([e.x,e.y]);return h>=0&&h<=o&&w>=0&&w<=d}function x(){if(n.save(),n.clearRect(0,0,u.width,u.height),n.fillStyle=I,n.fillRect(0,0,u.width,u.height),n.translate(y.x,y.y),n.scale(y.k,y.k),n.beginPath(),n.lineCap="round",n.strokeStyle="rgba(113, 113, 122, 0.2)",f.forEach(([e,o])=>{const d=i[e],h=i[o];if(!(!v(d)&&!v(h))){if(a){if(d.id!==a.id&&h.id!=a.id)return;g.add(h.index)}n.moveTo(d.x,d.y),n.lineTo(h.x,h.y)}}),n.stroke(),i.forEach(e=>{if(!v(e)||!G(e))return;n.beginPath();const o=e.group===k?se:ce;n.moveTo(e.x+o,e.y),n.arc(e.x,e.y,o,0,2*Math.PI);const d=$(L(e.group));n.fillStyle=d,n.fill(),n.strokeStyle=(m==null?void 0:m.index)===e.index?d.brighter():d.darker(),n.stroke()}),m){const e=Math.max(Math.round(16/y.k),1);z(le(m),m.x+8,m.y,e,$(L(m.group)))}n.restore()}function z(e,o,d,h,w){n.save(),n.font=`${h}px sans-serif`,n.textBaseline="middle",n.fillStyle=I;const b=h/4,D=n.measureText(e).width+b,P=h+b;n.fillRect(o-b/2,d-P/2-b/2,D,P),n.fillStyle=w,n.fillText(e,o,d),n.restore()}function S(e){const[o,d]=y.invert(Q(e));return l.find(o,d,200)}function T(e){return a&&e&&!g.has(e.index)?null:e}function G(e){return!a||g.has(e.index)?!0:e.index!==a.index&&!c[e.index].has(a.index)?!1:(g.add(e.index),!0)}function M(e){a=e,g.clear(),x()}function j(e){const o=T(S(e));if(!!o){if(o.group!==k&&(e.ctrlKey||e.metaKey))return O(o.id);M(a===o?null:o)}}function B(e){const o=T(S(e));o.group!==k&&O(o.id)}function O(e){window.open(`https://www.codewars.com/kata/${e}`,"_blank")}function F(e){e.key==="Escape"&&a&&(a=null,g.clear(),x())}function V(e){const o=T(S(e));o?(m!==o&&(m=o,x()),u.style.cursor="pointer"):(u.style.cursor="move",m!=null&&(m=null,x()))}}function E(p,i){let f=null,s,r;return function(){return r=this,s=Array.prototype.slice.call(arguments),a(),f=setTimeout(c,i),f;function c(){a(),p.apply(r,s)}function a(){clearTimeout(f),f=null}}}ne(()=>import("./computed.0010158c.js"),[]).then(p=>{const i=oe.parse(p),f=i.nodes.map(([s,r,l,c,a],g)=>({id:s,name:r||s,group:l,x:c,y:a,index:g}));ae({nodes:f,links:i.links,maxX:i.width,maxY:i.height})});
