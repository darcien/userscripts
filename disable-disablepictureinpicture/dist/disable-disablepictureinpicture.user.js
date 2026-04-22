// ==UserScript==
// @name        Disable disablepictureinpicture
// @version     1.1.0
// @description Remove disablePictureInPicture attribute from video elements to enable Picture-in-Picture mode.
// @author      darcien
// @match       https://nicochannel.jp/*
// @match       https://qlover.jp/*
// @homepageURL https://github.com/darcien/userscripts/tree/master/disable-disablepictureinpicture
// @downloadURL https://github.com/darcien/userscripts/raw/master/disable-disablepictureinpicture/dist/disable-disablepictureinpicture.user.js
// ==/UserScript==

(function(){"use strict";function enablePictureInPicture(video){video.disablePictureInPicture&&(video.disablePictureInPicture=!1)}function processExistingVideos(){document.querySelectorAll("video[disablepictureinpicture]").forEach(video=>{enablePictureInPicture(video)})}function observeNewVideos(){new MutationObserver(mutations=>{mutations.forEach(mutation=>{mutation.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE){const element=node;element.tagName==="VIDEO"&&enablePictureInPicture(element)}}),mutation.type==="attributes"&&mutation.target instanceof HTMLVideoElement&&mutation.attributeName==="disablepictureinpicture"&&enablePictureInPicture(mutation.target)})}).observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["disablepictureinpicture"]})}function init(){processExistingVideos(),observeNewVideos()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init()})();
