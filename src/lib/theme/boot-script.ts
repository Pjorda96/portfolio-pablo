import { SKY_STOPS } from '@/lib/time-of-day';

import { THEME_STORAGE_KEY } from './preference';

/**
 * Inline script for <head>: before first paint it reads the theme preference
 * (`preference.ts`), the system colour scheme and the visitor's local time,
 * and sets `data-theme` (auto, light, dark), `data-mode` (day/night palette)
 * and `--sky` on <html>, so the server-rendered page shows no flash.
 *
 * It mirrors `resolveMode` from `preference.ts` and `colorAt(SKY_STOPS, h)`
 * from `time-of-day.ts` in plain ES5; the tests run it against those.
 */
export const themeBootScript = `(function(){try{
var S=${JSON.stringify(SKY_STOPS)};
var d=new Date(),h=d.getHours()+d.getMinutes()/60,p=null;
try{p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});}catch(_){}
if(p!=='light'&&p!=='dark')p='auto';
var m=false;try{m=window.matchMedia('(prefers-color-scheme: dark)').matches;}catch(_){}
var r=document.documentElement;r.setAttribute('data-theme',p);
r.setAttribute('data-mode',p==='light'?'day':p==='dark'?'night':m?'night':'day');
for(var k=0;k<S.length-1;k++){var a=S[k],b=S[k+1];if(h>=a[0]&&h<=b[0]){
var f=(h-a[0])/(b[0]-a[0]),x=parseInt(a[1].slice(1),16),y=parseInt(b[1].slice(1),16),c='#';
for(var s=16;s>=0;s-=8){var p=(x>>s)&255,q=(y>>s)&255;c+=('0'+Math.round(p+(q-p)*f).toString(16)).slice(-2);}
r.style.setProperty('--sky',c);break;}}
}catch(_){}})();`;
