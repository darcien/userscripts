const ATTRIBUTE = "disablepictureinpicture";

// If the setter lock does not reach the page code, the player and our
// observer undo each other with no end, and the page stops responding.
// This occurs when the userscript manager runs the script outside
// the page context, or when the player uses `setAttribute`.
// After this many removals on one video, stop and keep the page usable.
const MAX_REMOVALS_PER_VIDEO = 20;
const removalCounts = new WeakMap<Element, number>();

// Vivaldi hides its button 3 seconds after a `mousemove`,
// so 1 copy in each 250 ms is sufficient.
// Fewer copies also mean less work for the page `mousemove` listeners.
const FORWARD_INTERVAL_MS = 250;

// Not `instanceof`, because it is false for nodes from a different frame.
const isElement = (node: Node): node is Element =>
  node.nodeType === Node.ELEMENT_NODE;

const isVideo = (node: Node): node is HTMLVideoElement =>
  node.nodeName === "VIDEO";

function enablePictureInPicture(video: Element): void {
  // Our own removal also causes an attribute mutation.
  if (!video.hasAttribute(ATTRIBUTE)) {
    return;
  }

  const count = (removalCounts.get(video) ?? 0) + 1;
  removalCounts.set(video, count);

  if (count > MAX_REMOVALS_PER_VIDEO) {
    if (count === MAX_REMOVALS_PER_VIDEO + 1) {
      console.warn(
        `[disable-disablepictureinpicture] Stopped on this video: the page added ${ATTRIBUTE} again ${MAX_REMOVALS_PER_VIDEO} times.`,
        video,
      );
    }
    return;
  }

  video.removeAttribute(ATTRIBUTE);
}

function enablePictureInPictureIn(root: Element | Document): void {
  if (isVideo(root)) {
    enablePictureInPicture(root);
  }

  for (const video of root.querySelectorAll(`video[${ATTRIBUTE}]`)) {
    enablePictureInPicture(video);
  }
}

// The player sets `video.disablePictureInPicture = true` again
// after our observer removes the attribute.
// Without this lock, the two observers undo each other with no end.
function lockDisablePictureInPictureSetter(): void {
  const prototype = HTMLVideoElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(
    prototype,
    "disablePictureInPicture",
  );
  const set = descriptor?.set;

  if (!set) {
    return;
  }

  Object.defineProperty(prototype, "disablePictureInPicture", {
    ...descriptor,
    set(this: HTMLVideoElement, _value: boolean) {
      set.call(this, false);
    },
  });
}

// The page calls `document.exitPictureInPicture()`
// from an `enterpictureinpicture` listener on `document`.
// We stop the event at <html>, which always gets it before `document`.
// Thus, the result does not depend on which listener is added first.
// Listeners on the video still get the event.
function preventExitOnEnter(): void {
  document.documentElement.addEventListener(
    "enterpictureinpicture",
    (event) => event.stopPropagation(),
  );
}

// Vivaldi shows its Picture-in-Picture button only when the video gets
// a `mousemove` event.
// The comment layer and the controls cover the video,
// so the video does not get mouse events.
function forwardHoverToCoveredVideos(): void {
  let lastForwardTime = -Infinity;

  document.addEventListener(
    "mousemove",
    (event) => {
      const target = event.target as Node | null;

      // - Not trusted: the page made the event, not the user.
      // - At a video: the video gets the event without our help.
      //   This also stops our copies, because they are at a video.
      // - Outside <body>: browser UI, such as the Vivaldi button.
      //   It is not a page overlay.
      if (
        !event.isTrusted ||
        !target ||
        isVideo(target) ||
        !document.body.contains(target) ||
        event.timeStamp - lastForwardTime < FORWARD_INTERVAL_MS
      ) {
        return;
      }

      const { clientX: x, clientY: y } = event;

      for (const video of document.querySelectorAll("video")) {
        const rect = video.getBoundingClientRect();

        if (
          x > rect.left && x < rect.right && y > rect.top && y < rect.bottom
        ) {
          lastForwardTime = event.timeStamp;

          // The copy does not bubble, but capture listeners on the
          // ancestors get it. Copy the button and key state, so that
          // these listeners do not see a false state, such as a drag end.
          video.dispatchEvent(
            new MouseEvent("mousemove", {
              clientX: x,
              clientY: y,
              screenX: event.screenX,
              screenY: event.screenY,
              button: event.button,
              buttons: event.buttons,
              altKey: event.altKey,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
            }),
          );
          return;
        }
      }
    },
    true,
  );
}

function observeVideos(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        if (isVideo(mutation.target)) {
          enablePictureInPicture(mutation.target);
        }
        continue;
      }

      // The player adds the video with the attribute already set,
      // inside a new subtree.
      // Thus, no attribute mutation occurs,
      // and the video can be deep in an added node.
      for (const node of mutation.addedNodes) {
        if (isElement(node)) {
          enablePictureInPictureIn(node);
        }
      }
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [ATTRIBUTE],
  });
}

lockDisablePictureInPictureSetter();
preventExitOnEnter();
forwardHoverToCoveredVideos();
enablePictureInPictureIn(document);
observeVideos();
