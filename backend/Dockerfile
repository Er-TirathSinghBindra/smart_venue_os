# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Expose port (Cloud Run sets the PORT environment variable)
ENV PORT=8000
EXPOSE 8000

# Run uvicorn when the container launches
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
