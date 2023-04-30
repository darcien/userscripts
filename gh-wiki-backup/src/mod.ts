const MAX_HISTORY_PER_PATH = 5;

const TITLE_INPUT_SELECTOR = "input[name='wiki[name]']";
const BODY_TEXT_AREA_SELECTOR = "textarea[name='wiki[body]']";
const COMMIT_INPUT_SELECTOR = "input[name='wiki[commit]']";
const SAVE_BUTTON_SELECTOR = "#gollum-editor-submit";

const LOG_PREFIX = "💾 ";
function log(msg: string, ...params: Array<any>) {
  console.log(LOG_PREFIX + msg, ...params);
}

const WARN_PREFIX = "💾⚠️ ";
function warn(msg: string, ...params: Array<any>) {
  console.warn(WARN_PREFIX + msg, ...params);
}

function getInputValue(selector: string) {
  const el = <HTMLInputElement | HTMLTextAreaElement | null>(
    document.querySelector(selector)
  );
  return el?.value || "";
}

function getAllInputValues() {
  return {
    name: getInputValue(TITLE_INPUT_SELECTOR),
    body: getInputValue(BODY_TEXT_AREA_SELECTOR),
    commit: getInputValue(COMMIT_INPUT_SELECTOR),
  };
}

type InputValues = ReturnType<typeof getAllInputValues>;

function isCurrentInputEmpty() {
  const inputValues = getAllInputValues();
  return Object.values(inputValues).join("").length === 0;
}

function setValueIfInputElementExist(selector: string, newValue: string) {
  const el = <HTMLInputElement>document.querySelector(selector);
  if (el) {
    el.value = newValue;
  }
}

function setAllInputValues(values: InputValues) {
  setValueIfInputElementExist(TITLE_INPUT_SELECTOR, values.name ?? "");
  setValueIfInputElementExist(BODY_TEXT_AREA_SELECTOR, values.body ?? "");
  setValueIfInputElementExist(COMMIT_INPUT_SELECTOR, values.commit ?? "");
}

function isShallowEqual(a: Record<string, string>, b: Record<string, string>) {
  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

const KEY_COMP_SEPARATOR = "|";

function makeStoreKey(path = location.pathname) {
  const keyComps = [path];
  return keyComps.join(KEY_COMP_SEPARATOR);
}

const CURRENT_PAGE_STORE_KEY = makeStoreKey();

function backupAllInputValues(toBackup: InputValues) {
  return idbKeyval.update(CURRENT_PAGE_STORE_KEY, (storedValues) =>
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
      idbKeyval.get(CURRENT_PAGE_STORE_KEY).then((maybeHistory) => {
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

function getSaveButton() {
  return <HTMLButtonElement | null>document.querySelector(SAVE_BUTTON_SELECTOR);
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

const initialValues = getAllInputValues();

addEventListener("beforeunload", (_event) => {
  const latestValues = getAllInputValues();
  if (isShallowEqual(initialValues, latestValues)) {
    return;
  }

  backupAllInputValues(latestValues)
    .then(() => log("Success backing up current page inputs"))
    .catch((error: unknown) =>
      warn("Fail to back up current page inputs", error)
    );
});

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
