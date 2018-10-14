(ns project.TEKeyboardHandler)

(def ^:const SPACE 32)
(def ^:const RETURN 13)
(def ^:const BACKSPACE 8)
(def ^:const ESCAPE 27)

(defn handler 
  [typed-number word-count e select-element]
  (let [code (or (.-keyCode e) (.-which e))]
    (case code
      (RETURN SPACE) (when-not (= 0 typed-number) (select-element (dec typed-number)) 0)
      BACKSPACE (if (> 10 typed-number) 0 (int (.slice (str typed-number) 0 -1)))
      ESCAPE (if-not (= 0 typed-number) 0)
      (let [typed-number (js/parseInt (str typed-number (.-key e)))]
        (if (> typed-number word-count) 
          0
          (if (> (* 10 typed-number) word-count)
            (do (select-element (dec typed-number)) 0)
            typed-number))))))
