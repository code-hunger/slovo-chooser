(ns project.TEKeyboardHandler)

(def ^:const SPACE 32)
(def ^:const RETURN 13)
(def ^:const BACKSPACE 8)
(def ^:const ESCAPE 27)

(defn handler 
  [typed-number word-count e select-element set-number-typed]
  (let [code (or (.-keyCode e) (.-which e))]
    (case code
      (RETURN SPACE)  (when-not (= 0 typed-number) (set-number-typed 0) (select-element (dec typed-number)))
      BACKSPACE (if (> 10 typed-number) (set-number-typed 0) (set-number-typed (int (.slice (str typed-number) 0 -1))))
      ESCAPE (if-not (= 0 typed-number) (set-number-typed 0))
      (let [typed-number (js/parseInt (str typed-number (.-key e)))]
        (if (> typed-number word-count) (set-number-typed 0)
          (if (> (* 10 typed-number) word-count)
            (do (select-element (dec typed-number)) (set-number-typed 0))
            (set-number-typed typed-number)))))))
