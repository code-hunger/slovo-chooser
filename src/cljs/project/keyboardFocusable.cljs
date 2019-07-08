(ns project.keyboardFocusable
  (:require [reagent.core :as r]
            [project.TEKeyboardHandler :refer (handler)]))

(defn KeyboardSelectableContainer
  [{:keys [elementCount onSelectElement]} children]
  (r/with-let [value (r/atom 0)]
    [:div 
     {:style {:position 'relative}
      :on-key-down #(swap! value handler elementCount % onSelectElement)}
     (if (pos? @value) [:div#wordNumberTyped "Typing: " @value])
     children]))
