// ==UserScript==
// @name        GitHub Wiki Backup
// @version     1.0.0
// @description Automatically backup unsaved GitHub Wiki changes before page unload.
// @author      darcien
// @match       https://github.com/*
// @require     https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js
// ==/UserScript==

(function(){"use strict";function r(t){const e=document.querySelector(t);return e?.value||""}const c="input[name='wiki[name]']",l="textarea[name='wiki[body]']",s="input[name='wiki[commit]']",y="#gollum-editor-submit";function a(){return{name:r(c),body:r(l),commit:r(s)}}function E(){return document.querySelector(y)}function _(){const t=a();return Object.values(t).join("").length===0}function i(t,e){const n=document.querySelector(t);n&&(n.value=e)}function k(t){i(c,t.name??""),i(l,t.body??""),i(s,t.commit??"")}function v(t,e){for(const n of Object.keys(t))if(t[n]!==e[n])return!1;return!0}const R="|";function p(t){return[t].join(R)}const T="\u{1F4BE} ";function u(t,...e){console.log(T+t,...e)}const g="\u{1F4BE}\u26A0\uFE0F ";function d(t,...e){console.warn(g+t,...e)}const h=5,I=/^\/.+\/wiki\/(_new|.+\/_edit)$/;function f(t=location.pathname){return I.test(t)}function A(t){const e=p(location.pathname);return idbKeyval.update(e,n=>Array.isArray(n)?[...n,t].slice(-h):[t])}function O(){return()=>{if(_()||confirm("\u26A0\uFE0F Restoring backup will replace all text inputs content with the latest backup \u2014 do you want to do it?")){const t=p(location.pathname);idbKeyval.get(t).then(e=>{const o=(Array.isArray(e)?e:[]).pop();o?(k(o),u("Backup restored")):alert("No backup data for current page to restore")})}}}function w(t){const e=t.cloneNode(!0);return e.id="_restore-backup-button",e.classList.remove("btn-primary"),e.textContent="Restore backup",e.type="button",e.onclick=O(),e}function S(t,e){var n;(n=t.parentNode)==null||n.appendChild(e)}function b(){const t=a(),e=()=>{const o=a();v(t,o)||A(o).then(()=>u("Success backing up current page inputs")).catch(m=>d("Fail to back up current page inputs",m))};addEventListener("beforeunload",e),u("Ready to back up inputs before unload");const n=E();if(n==null&&d("Unable to locate save button in page, restore backup button will be not available"),n){const o=w(n);S(n,o)}return()=>{u("Navigating away from wiki input page, cleaning up..."),removeEventListener("beforeunload",e)}}addEventListener("load",()=>{let t=document.location.href;const e=document.querySelector("body");let n=null;f()&&(n=b()),e&&new MutationObserver(m=>{t!==document.location.href&&(n&&(n(),n=null),f()&&(n=b()),t=document.location.href)}).observe(e,{childList:!0,subtree:!0})})})();
