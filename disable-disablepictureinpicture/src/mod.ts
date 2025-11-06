function enablePictureInPicture(video: HTMLVideoElement): void {
  if (video.disablePictureInPicture) {
    video.disablePictureInPicture = false;
  }
}

function processExistingVideos(): void {
  const videos = document.querySelectorAll("video[disablepictureinpicture]");

  videos.forEach((video) => {
    enablePictureInPicture(video as HTMLVideoElement);
  });
}

function observeNewVideos(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          if (element.tagName === "VIDEO") {
            enablePictureInPicture(element as HTMLVideoElement);
          }
        }
      });

      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLVideoElement &&
        mutation.attributeName === "disablepictureinpicture"
      ) {
        enablePictureInPicture(mutation.target);
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disablepictureinpicture"],
  });
}

function init(): void {
  processExistingVideos();

  observeNewVideos();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
