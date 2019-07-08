(ns project.TextAdder
  (:require [reagent.core :as r]
            ["@material-ui/core/Dialog" :default Dialog' ]
            ["@material-ui/core/DialogActions" :default DialogActions' ]
            ["@material-ui/core/DialogContent" :default DialogContent' ]
            ["@material-ui/core/DialogContentText" :default DialogContentText' ]
            ["@material-ui/core/DialogTitle" :default DialogTitle' ]
            ["@material-ui/core/TextField" :default TextField']
            ["@material-ui/core/Button" :default Button']))

(def Dialog (r/adapt-react-class Dialog'))
(def DialogActions (r/adapt-react-class DialogActions'))
(def DialogContent (r/adapt-react-class DialogContent'))
(def DialogContentText (r/adapt-react-class DialogContentText'))
(def DialogTitle (r/adapt-react-class DialogTitle'))
(def TextField (r/adapt-react-class TextField'))
(def Button (r/adapt-react-class Button'))

(defn valid? [nname content]
  (and (< 1 (.-length nname)) (< 10 (.-length content))))

(def TextAdder2
  (r/create-class
    {:display-name 'TextAdder2
     :reagent-render
     (fn [props]
       (r/with-let [state (r/atom {:is-open false
                                   :text-name ""
                                   :text-content ""})]
         (js/console.log "Rerender! State is: 0 " (:is-open @state))
         [:div
          [Button
           {:onClick #(swap! state update-in [:is-open] not)
            :variant 'outlined
            :color 'primary}
           (str "Add a new text source 1")]
          [Dialog
           {:open (or (:is-open @state) (:autoOpen props))
            :onClose #(swap! state assoc :is-open false)
            :aria-labelledby "form-dialog-title"
            :fullWidth true }
           [DialogTitle { :id "form-dialog-title" } "Add a new text sourse!"]
           [DialogContent
            [TextField {:id "name"
                        :margin "dense"
                        :label "Text sourse name"
                        :type "text"
                        :onChange #(swap! state assoc :text-name (.-value (.-target %)))
                        :name "textId"
                        :value (:text-name @state)
                        :autoFocus true}]
            [TextField {:name "text"
                        :value (:text-content @state)
                        :label "Enter text source content here"
                        :onChange #(swap! state assoc :text-content (.-value (.-target %)))                         :multiline true
                        :fullWidth true}]]
           [DialogActions
            [Button {:onClick (fn []
                                (let [nname (:text-name @state)
                                      content (:text-content @state)]
                                  (if (valid? nname content)
                                    (do
                                      ((:onDone props) nname content)
                                      (reset! state {:is-open false
                                                     :text-name ""
                                                     :text-content ""})))))
                     :color "primary"
                     :disabled (not (valid? (:text-name @state) (:text-content @state)))}
             "Add text sourse"]
            [Button {:onClick #(swap! state assoc :is-open false)
                     :color "secondary"
                     :disabled (:autoOpen props)}
             "Cancel"]]
           ]]))}))
