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
        (let [words (:words props)]
          (if (empty? words)
            "No marked words"
            [KeyboardSelectableContainer
             {:elementCount (count words)
              :onSelectElement (props :onWordClick)
              :handler handler}
             [WordCollector
              {:className "unknownWordsList"
               :wordType (:wordType props)
               :words words
               :tabIndex (:tabIndex props)
               :onWordClick #((:onWordClick props) (.-index (nth words %)))
               :onContextMenu (constantly true)}]
             ])))}))
