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
            [cheshire.core :refer [generate-string]]
            [clojure.java.io :refer [reader]]
            [clojure.string :refer [trim blank?]]))

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
(def base-dir (:base_url conf-file))

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

(defn get-nth-chunk
  ([chunk-id chunk-seq] (get-nth-chunk chunk-id 1 chunk-seq))
  ([wanted-id current-id chunk-seq]
   (if (empty? chunk-seq) 
     nil
     (let [line (trim (first chunk-seq))
           rest' (rest chunk-seq)]
       (if (blank? line)
         (get-nth-chunk wanted-id current-id rest')
         (if (< current-id wanted-id)
           (recur wanted-id (inc current-id) rest')
           {:text line :id current-id}))))))

(defn find-chunk-in-file 
  [file chunk-id]
  (with-open [my-reader (reader file)]
    (get-nth-chunk chunk-id (line-seq my-reader))))

(defn json-response [data] 
  (let [stringified (generate-string data)]
    (content-type (response stringified) "application/json")))

(defn parse-int [s]
  (Integer. (re-find #"^[0-9]*" s)))

(defroutes routes
  (GET "/" [] (loading-page))
  (GET "/status" [] (json-response resource-files))
  (GET "/text" [chunkId file] 
       (json-response
         (let [path (str base-dir file)
               chunk-id (parse-int chunkId)]
           (if-not (fs/file? path)
             {:text "File not given"}
             (if-let [found-chunk (find-chunk-in-file path chunk-id)]
               {:text (found-chunk :text) :chunkId (found-chunk :id )}
               {:error "The wanted line is past the end of the file."})))))

  (resources "/")
  (not-found "Not Found"))

(def handler (wrap-middleware #'routes))
