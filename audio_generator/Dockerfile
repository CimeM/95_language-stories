# Use a base image with Python
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    git \
    sox \
    && rm -rf /var/lib/apt/lists/*

COPY requiremnets.txt . 

RUN pip install -r requiremnets.txt

# Copy the processing script into the container
COPY process_md.py .

# Set the entry point to the script
ENTRYPOINT ["python", "process_md.py"]
