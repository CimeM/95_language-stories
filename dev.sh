IMAGE_NAME="language-stories-dev"

docker build --network host -t $IMAGE_NAME .
docker run -p 4000:4000 -v $(pwd):/app $IMAGE_NAME 