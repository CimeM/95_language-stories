FROM python:3.10-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

EXPOSE 3000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000", "--reload"]