(ns project.UnknownWordList
  (:require [reagent.core :as r]
             ["shadow-cljs/project.keyboardFocusable" :refer (KeyboardSelectableContainer)]
             ["shadow-cljs/project.WordCollector" :refer (WordCollector)]
             ["shadow-cljs/project.TEKeyboardHandler" :refer (handler)]))

(def UnknownWordList
  (r/create-class
    {:display-name 'UnknownWordList
     :reagent-render
      (fn [props]
        (if (empty? (:words props))
          "No marked words"
          [KeyboardSelectableContainer
           {:elementCount (count (props :words))
            :onSelectElement (props :onWordClick)
            :handler handler}
           [WordCollector
            {:className "unknownWordsList"
             :wordType (:wordType props)
             :words (:words props)
             :tabIndex (:tabIndex props)
             :onWordClick #((:onWordClick props) (.-index (nth (:words props) %)))
             :onContextMenu (constantly true)}]
           ]))}))
