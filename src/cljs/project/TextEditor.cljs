(ns project.TextEditor
  (:require [reagent.core :as r]))

(def TextEditor
  (r/create-class
    {:reagent-render
     (fn [props]
       (if-not (project.keyboardFocusable/KeyboardSelectableContainer) (js/console.err "FAKK FAKKKKKK"))
       (let [words (props :words)]
         (if (empty? words)
           (props :emptyText)
           [:div {}
            [project.keyboardFocusable/KeyboardSelectableContainer
             {:elementCount (count words)
              :onSelectElement (props :onWordClick)}
             [project.WordCollector/WordCollector
              {:words words
               :wordType (props :wordType)
               :tabIndex (props :tabIndex)
               :onWordClick (props :onWordClick)
               :onContextMenu (props :onContextMenu)}]]]
           )))}))
