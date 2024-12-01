
HELNCHANRT_LOC=../helmchart/lang-api
NS=langapi
# helm dep update $HELNCHANRT_LOC
# helm uninstall  -n $NS langapi
helm upgrade --install -n $NS langapi $HELNCHANRT_LOC