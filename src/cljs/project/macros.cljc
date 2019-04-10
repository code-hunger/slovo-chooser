(ns project.macros)

(defmacro if-empty [collection then else] 
  (list 'if ('empty? collection) then else)) ;should only evaluate the condition

