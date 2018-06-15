const storageKey = "redux-store";

export function loadState() {
  try {
    const store = localStorage.getItem(storageKey);
    if (store) return JSON.parse(store);
  } catch (err) {
    console.warn("Couldn't read from redux-store. Error: ", err);
  }
  return undefined;
}

export function persistState<S>(state: S) {
  try {
    const store = JSON.stringify(state);
    localStorage.setItem(storageKey, store);
  } catch (err) {
    console.warn("Couldn't write to redux-store. Error: ", err);
  }
}
