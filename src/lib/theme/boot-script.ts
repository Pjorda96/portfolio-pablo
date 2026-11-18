import { SKY_STOPS } from '@/lib/time-of-day';

import { THEME_STORAGE_KEY } from './preference';

/**
 * Inline script for <head>: before first paint it reads the visitor's local
 * time and theme preference (`preference.ts`) and sets `data-theme` (auto,
 * light, dark), `data-mode` (day/night palette) and `--sky` on <html>, so the
 * server-rendered page already shows the right light with no flash.
 *
 * It mirrors `uiModeOf` and `colorAt(SKY_STOPS, h)` from `time-of-day.ts`
 * in plain ES5; tests/time-of-day.test.ts runs it against those functions.
 */
export const themeBootScript = `(function(){try{
var S=${JSON.stringify(SKY_STOPS)};
var d=new Date(),h=d.getHours()+d.getMinutes()/60,p=null;
try{p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});}catch(_){}
if(p!=='light'&&p!=='dark')p='auto';
var e=Math.sin((h-6)/12*Math.PI),t=Math.min(1,Math.max(0,(e+0.12)/0.34)),n=1-t*t*(3-2*t);
var r=document.documentElement;r.setAttribute('data-theme',p);
r.setAttribute('data-mode',p==='light'?'day':p==='dark'?'night':n>0.5?'night':'day');
for(var k=0;k<S.length-1;k++){var a=S[k],b=S[k+1];if(h>=a[0]&&h<=b[0]){
var f=(h-a[0])/(b[0]-a[0]),x=parseInt(a[1].slice(1),16),y=parseInt(b[1].slice(1),16),c='#';
for(var s=16;s>=0;s-=8){var p=(x>>s)&255,q=(y>>s)&255;c+=('0'+Math.round(p+(q-p)*f).toString(16)).slice(-2);}
r.style.setProperty('--sky',c);break;}}
}catch(_){}})();`;
