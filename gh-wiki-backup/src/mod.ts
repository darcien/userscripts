import {
  makeStoreKey,
  InputValues,
  isCurrentInputEmpty,
  setAllInputValues,
  log,
  getAllInputValues,
  isShallowEqual,
  warn,
  getSaveButton,
} from "./utils";

const MAX_HISTORY_PER_PATH = 5;

const NEW_OR_EDIT_WIKI_PATH_REGEX = /^\/.+\/wiki\/(_new|.+\/_edit)$/;
function shouldInstall(path = location.pathname): boolean {
  return NEW_OR_EDIT_WIKI_PATH_REGEX.test(path);
}

function backupAllInputValues(toBackup: InputValues) {
  const storeKey = makeStoreKey(location.pathname);
  return idbKeyval.update(storeKey, (storedValues) =>
    Array.isArray(storedValues)
      ? [...storedValues, toBackup].slice(-MAX_HISTORY_PER_PATH)
      : [toBackup]
  );
}

function createRestoreBackupOnClickHandler() {
  return () => {
    if (
      isCurrentInputEmpty() ||
      confirm(
        "⚠️ Restoring backup will replace all text inputs content with the latest backup — do you want to do it?"
      )
    ) {
      const storeKey = makeStoreKey(location.pathname);
      idbKeyval.get(storeKey).then((maybeHistory) => {
        const history = Array.isArray(maybeHistory) ? maybeHistory : [];
        const latestBackupInput = history.pop();
        if (latestBackupInput) {
          setAllInputValues(latestBackupInput);
          log("Backup restored");
        } else {
          alert("No backup data for current page to restore");
        }
      });
    }
  };
}

function createRestoreBackupButton(saveButton: HTMLButtonElement) {
  const restoreButton = saveButton.cloneNode(true) as typeof saveButton;
  restoreButton.id = "_restore-backup-button";
  restoreButton.classList.remove("btn-primary");
  restoreButton.textContent = "Restore backup";
  restoreButton.type = "button";

  restoreButton.onclick = createRestoreBackupOnClickHandler();

  return restoreButton;
}

function addRestoreButtonToDom(
  save: HTMLButtonElement,
  restore: HTMLButtonElement
) {
  save.parentNode?.appendChild(restore);
}

function installToCurrentPage() {
  const initialValues = getAllInputValues();

  const handleBeforeUnload = () => {
    const latestValues = getAllInputValues();
    if (isShallowEqual(initialValues, latestValues)) {
      return;
    }

    backupAllInputValues(latestValues)
      .then(() => log("Success backing up current page inputs"))
      .catch((error: unknown) =>
        warn("Fail to back up current page inputs", error)
      );
  };

  addEventListener("beforeunload", handleBeforeUnload);

  log("Ready to back up inputs before unload");

  const saveButton = getSaveButton();
  if (saveButton == null) {
    warn(
      "Unable to locate save button in page, restore backup button will be not available"
    );
  }

  if (saveButton) {
    const restoreButton = createRestoreBackupButton(saveButton);
    addRestoreButtonToDom(saveButton, restoreButton);
  }

  return () => {
    log("Navigating away from wiki input page, cleaning up...");
    removeEventListener("beforeunload", handleBeforeUnload);
  };
}

addEventListener("load", () => {
  let prevHref = document.location.href;
  const body = document.querySelector("body");
  let cleanup: (() => void) | null = null;

  // Install on load if current page matches
  if (shouldInstall()) {
    cleanup = installToCurrentPage();
  }

  if (body) {
    const observer = new MutationObserver((_mutations) => {
      // Watch the href changes using DOM mutation observer
      if (prevHref !== document.location.href) {
        // If navigating away form wiki edit page,
        // should cleanup listeners we install.
        if (cleanup) {
          cleanup();
          cleanup = null;
        }

        // Reinstall if navigating into wiki edit page.
        if (shouldInstall()) {
          cleanup = installToCurrentPage();
        }

        prevHref = document.location.href;
      }
    });
    observer.observe(body, { childList: true, subtree: true });
  }
});
