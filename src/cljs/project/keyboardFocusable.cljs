(ns project.keyboardFocusable
  (:require [reagent.core :as r]))

(def KeyboardSelectableContainer
  (r/create-class
    {:reagent-render
     (fn [props]
       (r/with-let [value (r/atom 0)]
         [:div 
          {:style {:position 'relative}
           :on-key-down #(swap! value (:handler props)
                                (:elementCount props)  
                                %
                                (:onSelectElement props))}
          (if (> @value 0) [:div#wordNumberTyped "Typing: " @value])
          (:children props)]))}))
