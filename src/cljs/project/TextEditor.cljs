(ns project.TextEditor
  (:require [reagent.core :as r]
            [project.keyboardFocusable :refer (KeyboardSelectableContainer)]
            [project.WordCollector :refer (WordCollector)])
  (:require-macros [project.macros :refer (if-empty)]))

(def TextEditor
  (r/create-class
    {:display-name 'TextEditor
     :reagent-render
     (fn [{:keys [words emptyText] :as props}]
       (if-empty words
                 emptyText 
                 [:div {:class-name 'textEditor}
                  [KeyboardSelectableContainer
                   {:elementCount (count :words)
                    :onSelectElement (props :onWordClick)}
                   [WordCollector props]]]))}))
