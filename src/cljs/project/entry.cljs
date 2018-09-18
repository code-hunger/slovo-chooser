(ns project.entry
    (:require [reagent.core :as r]))

(defn myfunc [] 1)

(def counter (r/atom 5))

(def Closud
  (r/create-class
        {:reagent-render
         (fn [props]
             (let [{:keys [name]} props]
                 [:div 
                  {:on-click (fn [] (swap! counter inc))}
                  name "updatehere!"
                  ])
             )}))

(defn exported [props]
  [:div "Hi, " (:name props)])

(def react-comp (r/reactify-component exported))

(defn could-be-jsx []
  (r/create-element react-comp #js{:name "world"}))


;(defn mycomponent []
  ;(r/create-class

    ;[:div
     ;[:h3 "I am component!"]
     ;[:p.someclass
      ;"I have " [:strong "bold"]
      ;[:span {:style {:color "red"}} " and red"]
      ;" text."]]))
