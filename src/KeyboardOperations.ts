import { KeyboardEvent } from "react";
import { WordAction } from "./store";

export default function TextEditorKeyboardHandler(
  wordNumberTyped: number,
  wordCount: number,
  e: KeyboardEvent<HTMLElement>,
  selectElement: (id: number) => void,
  setNumberTyped: (id: number) => void
) {
  const code = e.keyCode || e.which;
  const SPACE = 32,
    RETURN = 13,
    BACKSPACE = 8,
    //ZERO = 48,
    ESCAPE = 27;

  switch (code) {
    case RETURN:
    case SPACE:
      if (wordNumberTyped === 0) break;

      setNumberTyped(0);
      selectElement(wordNumberTyped - 1);
      break;
    case BACKSPACE:
      // Number >= 10, remove last digit:
      if (wordNumberTyped >= 10) {
        let slicedNumber = wordNumberTyped.toString().slice(0, -1);

        return setNumberTyped(parseInt(slicedNumber, 10));
      }
    // Number < 10, act like ESCAPE:
    case ESCAPE:
      if (wordNumberTyped > 0) {
        return setNumberTyped(0);
      }
    default:
      let key = e.key;

      // If e.key is not recognized as number or is unsupported, try with e.keyCode
      //if (typeof key === "undefined" || !isFinite(key))
      //if (code < ZERO || code > ZERO + 9) break;
      //else key = code - ZERO;

      const typedNumber = parseInt(wordNumberTyped + "" + key, 10);

      if (typedNumber > wordCount) setNumberTyped(0);
      else if (typedNumber * 10 > wordCount) {
        selectElement(typedNumber - 1);
        setNumberTyped(0);
      } else setNumberTyped(typedNumber);
  }
}
