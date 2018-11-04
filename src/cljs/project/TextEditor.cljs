(ns project.TextEditor
  (:require [reagent.core :as r]
             ["shadow-cljs/project.keyboardFocusable" :refer (KeyboardSelectableContainer)]
             ["shadow-cljs/project.WordCollector" :refer (WordCollector)]))

(def TextEditor
  (r/create-class
    {:display-name 'TextEditor
     :reagent-render
     (fn [props]
       (let [words (props :words)]
         (if (empty? words)
           (:emptyText props )
           [:div {:class-name 'textEditor}
            [KeyboardSelectableContainer
             {:elementCount (count words)
              :onSelectElement (props :onWordClick)}
             [WordCollector
              {:words words
               :wordType (props :wordType)
               :tabIndex (props :tabIndex)
               :onWordClick (props :onWordClick)
               :onContextMenu (props :onContextMenu)}]]]
           )))}))
