FROM python:3.9-alpine

WORKDIR /app

RUN pip install --upgrade pip

COPY src/requirements.txt .

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY src /app 
