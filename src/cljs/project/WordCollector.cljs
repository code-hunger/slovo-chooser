(ns project.WordCollector
  (:require [reagent.core :as r]))

(defn WordCollector [props]
  (r/with-let [word-type (r/adapt-react-class (:wordType props))]
    [:div {:class-name (str (:className props) " wordCollector")
           :tab-index (:tabIndex props)}
     (map (fn [word]
            [word-type
             {:key (.-index word)
              :index (.-index word)
              :word (.-word word)
              :classNames (.-classNames word)
              :onClick (:onWordClick props)
              :onRightClick (:onContextMenu props)}]) 
          (:words props))]))
