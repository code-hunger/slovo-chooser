(ns project.keyboardFocusable
  (:require [reagent.core :as r]))

(def value (r/atom 0))

(def KeyboardSelectableContainer
  (r/create-class
    {:reagent-render
     (fn [props]
       [:div 
        {:style {:position 'relative}
         :on-key-down #((:handler props)  
                       @value 
                       (:elementCount props)  
                       %
                       (:onSelectElement props) 
                       (fn [x] reset! value x))}
        (if (> @value 0) [:div#wordNumberTyped "Typing: " @value])
        (:children props)])}))
