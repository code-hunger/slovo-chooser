(ns project.TextEditor
  (:require [reagent.core :as r]
             ["shadow-cljs/project.keyboardFocusable" :refer (KeyboardSelectableContainer)]
             ["shadow-cljs/project.WordCollector" :refer (WordCollector)]))

(def TextEditor
  (r/create-class
    {:display-name 'TextEditor
     :reagent-render
     (fn [props]
       (if (empty? (props :words))
         (:emptyText props)
         [:div {:class-name 'textEditor}
          [KeyboardSelectableContainer
           {:elementCount (count (props :words))
            :onSelectElement (props :onWordClick)}
           [WordCollector props]]]
         ))}))
