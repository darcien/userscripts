// ==UserScript==
// @name        GitHub Wiki Backup
// @version     1.1.0
// @description Automatically backup unsaved GitHub Wiki changes before page unload.
// @author      darcien
// @match       https://github.com/*
// @require     https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js
// @homepageURL https://github.com/darcien/userscripts/tree/master/gh-wiki-backup
// @downloadURL https://github.com/darcien/userscripts/raw/master/gh-wiki-backup/dist/gh-wiki-backup.user.js
// ==/UserScript==

(function(){"use strict";function getInputValue(selector){const el=document.querySelector(selector);return el?.value||""}const TITLE_INPUT_SELECTOR="input[name='wiki[name]']",BODY_TEXT_AREA_SELECTOR="textarea[name='wiki[body]']",COMMIT_INPUT_SELECTOR="input[name='wiki[commit]']",SAVE_BUTTON_SELECTOR="#gollum-editor-submit";function getAllInputValues(){return{name:getInputValue(TITLE_INPUT_SELECTOR),body:getInputValue(BODY_TEXT_AREA_SELECTOR),commit:getInputValue(COMMIT_INPUT_SELECTOR)}}function getSaveButton(){return document.querySelector(SAVE_BUTTON_SELECTOR)}function isCurrentInputEmpty(){const inputValues=getAllInputValues();return Object.values(inputValues).join("").length===0}function setValueIfInputElementExist(selector,newValue){const el=document.querySelector(selector);el&&(el.value=newValue)}function setAllInputValues(values){setValueIfInputElementExist(TITLE_INPUT_SELECTOR,values.name??""),setValueIfInputElementExist(BODY_TEXT_AREA_SELECTOR,values.body??""),setValueIfInputElementExist(COMMIT_INPUT_SELECTOR,values.commit??"")}function isShallowEqual(a,b){for(const key of Object.keys(a))if(a[key]!==b[key])return!1;return!0}const KEY_COMP_SEPARATOR="|";function makeStoreKey(path){return[path].join(KEY_COMP_SEPARATOR)}const LOG_PREFIX="\u{1F4BE} ";function log(msg,...params){console.log(LOG_PREFIX+msg,...params)}const WARN_PREFIX="\u{1F4BE}\u26A0\uFE0F ";function warn(msg,...params){console.warn(WARN_PREFIX+msg,...params)}const MAX_HISTORY_PER_PATH=5,NEW_OR_EDIT_WIKI_PATH_REGEX=/^\/.+\/wiki\/(_new|.+\/_edit)$/;function shouldInstall(path=location.pathname){return NEW_OR_EDIT_WIKI_PATH_REGEX.test(path)}function backupAllInputValues(toBackup){const storeKey=makeStoreKey(location.pathname);return idbKeyval.update(storeKey,storedValues=>Array.isArray(storedValues)?[...storedValues,toBackup].slice(-MAX_HISTORY_PER_PATH):[toBackup])}function createRestoreBackupOnClickHandler(){return()=>{if(isCurrentInputEmpty()||confirm("\u26A0\uFE0F Restoring backup will replace all text inputs content with the latest backup \u2014 do you want to do it?")){const storeKey=makeStoreKey(location.pathname);idbKeyval.get(storeKey).then(maybeHistory=>{const latestBackupInput=(Array.isArray(maybeHistory)?maybeHistory:[]).pop();latestBackupInput?(setAllInputValues(latestBackupInput),log("Backup restored")):alert("No backup data for current page to restore")})}}}function createRestoreBackupButton(saveButton){const restoreButton=saveButton.cloneNode(!0);return restoreButton.id="_restore-backup-button",restoreButton.classList.remove("btn-primary"),restoreButton.textContent="Restore backup",restoreButton.type="button",restoreButton.onclick=createRestoreBackupOnClickHandler(),restoreButton}function addRestoreButtonToDom(save,restore){var _a;(_a=save.parentNode)==null||_a.appendChild(restore)}function installToCurrentPage(){const initialValues=getAllInputValues(),handleBeforeUnload=()=>{const latestValues=getAllInputValues();isShallowEqual(initialValues,latestValues)||backupAllInputValues(latestValues).then(()=>log("Success backing up current page inputs")).catch(error=>warn("Fail to back up current page inputs",error))};addEventListener("beforeunload",handleBeforeUnload),log("Ready to back up inputs before unload");const saveButton=getSaveButton();if(saveButton==null&&warn("Unable to locate save button in page, restore backup button will be not available"),saveButton){const restoreButton=createRestoreBackupButton(saveButton);addRestoreButtonToDom(saveButton,restoreButton)}return()=>{log("Navigating away from wiki input page, cleaning up..."),removeEventListener("beforeunload",handleBeforeUnload)}}addEventListener("load",()=>{let prevHref=document.location.href;const body=document.querySelector("body");let cleanup=null;shouldInstall()&&(cleanup=installToCurrentPage()),body&&new MutationObserver(_mutations=>{prevHref!==document.location.href&&(cleanup&&(cleanup(),cleanup=null),shouldInstall()&&(cleanup=installToCurrentPage()),prevHref=document.location.href)}).observe(body,{childList:!0,subtree:!0})})})();
