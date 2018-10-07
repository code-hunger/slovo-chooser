(ns project.main_handler
  (:require [compojure.core :refer [GET defroutes]]
            [compojure.route :refer [not-found resources]]
            [hiccup.page :refer [include-js include-css html5]]
            [ring.middleware.defaults :refer [site-defaults wrap-defaults]]
            [config.core :refer [env]]
            [prone.middleware :refer [wrap-exceptions]]
            [ring.middleware.reload :refer [wrap-reload]]))

(defn wrap-middleware-dev [handler]
  (-> handler
      (wrap-defaults site-defaults)
      wrap-exceptions
      wrap-reload))

(defn wrap-middleware-prod [handler]
  (wrap-defaults handler site-defaults))

(def wrap-middleware (if (env :dev) wrap-middleware-dev wrap-middleware-prod))

(def mount-target
  [:div#app
      [:h3 "ClojureScript <font color=red>has</font> not been compiled!"]
      [:p "please run "
       [:b "lein figwheel"]
       " in order to start the compiler"]])

(defn loading-page []
  (html5
    [:body {:class "body-container"}
     mount-target
     (include-js "/js/app.js")]))


(defroutes routes
  (GET "/" [] (loading-page))
  (GET "/about" [] (loading-page))
  
  (resources "/")
  (not-found "Not Found"))

(def handler (wrap-middleware-prod #'routes))
