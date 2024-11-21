IMAGE_NAME=rhasspy-piper

docker build --network host -t $IMAGE_NAME .

docker run --rm \
    --mount type=bind,source=/home/masher/Projects/language-stories/_stories,target=/data/input \
    --mount type=bind,source=/home/masher/Projects/language-stories/assets,target=/data/output \
    $IMAGE_NAME
