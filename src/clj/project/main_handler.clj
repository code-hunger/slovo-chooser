(ns project.main_handler
  (:refer-clojure :exclude [load])
  (:require [compojure.core :refer [GET defroutes]]
            [compojure.route :refer [not-found resources]]
            [hiccup.page :refer [include-js include-css html5]]
            [ring.middleware.defaults :refer [site-defaults wrap-defaults]]
            [ring.util.response :refer [response content-type]]
            [config.core :refer [env]]
            [prone.middleware :refer [wrap-exceptions]]
            [ring.middleware.reload :refer [wrap-reload]]
            [me.raynes.fs :as fs]
            [yaml.core :as yaml]
            [cheshire.core :refer [generate-string]]))

(defn wrap-middleware-dev [handler]
  (-> handler
      (wrap-defaults site-defaults)
      wrap-exceptions
      wrap-reload))

(defn wrap-middleware-prod [handler]
  (wrap-defaults handler site-defaults))

(def wrap-middleware (if (env :dev) wrap-middleware-dev wrap-middleware-prod))

(defn get-config-file 
  ([fname] (get-config-file fname (into [] (fs/split fs/*cwd*))))
  ([fname dirs]
   (if (empty? dirs)
     nil
     (let [path (apply fs/file (conj dirs fname))]
       (if (fs/file? path)
         path
         (recur fname (pop dirs)))))))

(def conf-file (yaml/from-file (get-config-file "readStatus.yml")))

(def resource-files (:files conf-file))

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
  (GET "/status" [] (content-type (response (generate-string resource-files)) "application/json"))
  
  (resources "/")
  (not-found "Not Found"))

(def handler (wrap-middleware-prod #'routes))
