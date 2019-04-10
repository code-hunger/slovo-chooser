(ns project.keyboardFocusable
  (:require [reagent.core :as r]
            [project.TEKeyboardHandler :refer (handler)]))

(def KeyboardSelectableContainer
  (r/create-class
    {:reagent-render
     (fn [{:keys [elementCount onSelectElement children]} children2]
       (r/with-let [value (r/atom 0)]
         [:div 
          {:style {:position 'relative}
           :on-key-down #(swap! value handler elementCount % onSelectElement)}
          (if (> @value 0) [:div#wordNumberTyped "Typing: " @value])
          (or children children2)]))}))
