(ns project.UnknownWordList
  (:require [reagent.core :as r]
            [project.keyboardFocusable :refer (KeyboardSelectableContainer)]
            [project.WordCollector :refer (WordCollector)]
            [project.TEKeyboardHandler :refer (handler)]
            ["@material-ui/core/Typography" :default Typography']))

(def Typography (r/adapt-react-class Typography'))

(def UnknownWordList
  (r/create-class
    {:display-name 'UnknownWordList
     :reagent-render
     (fn [{:keys [words onWordClick wordType tabIndex]}]
       (if (empty? words)
         [Typography {:variant "subheading"} "No marked words."]
         [KeyboardSelectableContainer
          {:elementCount (count words)
           :onSelectElement onWordClick
           :handler handler}
          [WordCollector
           {:className "unknownWordsList"
            :wordType wordType 
            :words words
            :tabIndex tabIndex
            :onWordClick #(onWordClick (.-index (nth words %)))
            :onContextMenu (constantly true)}]]))}))
