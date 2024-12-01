# !/bin/sh

registry_domain="registry.digitalocean.com/"
registry_name='digitalocean-simple-container-registry/'
image_name="single-image"

IMAGE=$registry_domain$registry_name$image_name:langapi

docker build  -t $IMAGE --network host -f ../main-api/Dockerfile ../main-api/. 

docker push $IMAGE

