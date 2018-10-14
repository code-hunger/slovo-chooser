(ns project.keyboardFocusable
  (:require [reagent.core :as r]))

(def value (r/atom 0))

(def KeyboardSelectableContainer
  (r/create-class
    {:reagent-render
     (fn [props]
       [:div 
        {:style {:position 'relative}
         :on-key-down #(swap! value ((:handler props)  
                                     @value 
                                     (:elementCount props)  
                                     %
                                     (:onSelectElement props)))}
        (if (> @value 0) [:div#wordNumberTyped "Typing: " @value])
        (:children props)])}))
