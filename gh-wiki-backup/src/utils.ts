export function getInputValue(selector: string) {
  const el = <HTMLInputElement | HTMLTextAreaElement | null>(
    document.querySelector(selector)
  );
  return el?.value || "";
}

const TITLE_INPUT_SELECTOR = "input[name='wiki[name]']";
const BODY_TEXT_AREA_SELECTOR = "textarea[name='wiki[body]']";
const COMMIT_INPUT_SELECTOR = "input[name='wiki[commit]']";
const SAVE_BUTTON_SELECTOR = "#gollum-editor-submit";

export function getAllInputValues() {
  return {
    name: getInputValue(TITLE_INPUT_SELECTOR),
    body: getInputValue(BODY_TEXT_AREA_SELECTOR),
    commit: getInputValue(COMMIT_INPUT_SELECTOR),
  };
}

export function getSaveButton() {
  return <HTMLButtonElement | null>document.querySelector(SAVE_BUTTON_SELECTOR);
}

export type InputValues = ReturnType<typeof getAllInputValues>;

export function isCurrentInputEmpty() {
  const inputValues = getAllInputValues();
  return Object.values(inputValues).join("").length === 0;
}

export function setValueIfInputElementExist(
  selector: string,
  newValue: string
) {
  const el = <HTMLInputElement>document.querySelector(selector);
  if (el) {
    el.value = newValue;
  }
}

export function setAllInputValues(values: InputValues) {
  setValueIfInputElementExist(TITLE_INPUT_SELECTOR, values.name ?? "");
  setValueIfInputElementExist(BODY_TEXT_AREA_SELECTOR, values.body ?? "");
  setValueIfInputElementExist(COMMIT_INPUT_SELECTOR, values.commit ?? "");
}

export function isShallowEqual(
  a: Record<string, string>,
  b: Record<string, string>
) {
  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

const KEY_COMP_SEPARATOR = "|";

export function makeStoreKey(path: string) {
  const keyComps = [path];
  return keyComps.join(KEY_COMP_SEPARATOR);
}

const LOG_PREFIX = "💾 ";
export function log(msg: string, ...params: Array<any>) {
  console.log(LOG_PREFIX + msg, ...params);
}

const WARN_PREFIX = "💾⚠️ ";
export function warn(msg: string, ...params: Array<any>) {
  console.warn(WARN_PREFIX + msg, ...params);
}
