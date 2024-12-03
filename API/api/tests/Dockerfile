FROM python:3.8-slim

WORKDIR /app


RUN pip install --no-cache pipenv
RUN pipenv install

COPY . .


CMD [ "pipenv", "run", "flask", "run", "-p", "5001", "-h", "0.0.0.0"]