FROM kivsegrob/lite-queen:latest AS executables



FROM debian:12-slim AS demo

# Set the working directory in the container
WORKDIR /app

COPY --from=executables /home/litequeen/lite-queen-arm64 ./lite-queen

# Copy the pre-built executable into the container
# COPY ./lite-queen /app/lite-queen

# let's get curl
RUN apt-get update -y 
RUN apt-get install curl -y 

COPY ./bin /app/bin

# Copy the SQLite database files
RUN mkdir -p /app/databases
COPY ./databases/* /app/databases/

# Make sure the executable is runnable
RUN chmod +x /app/lite-queen

# Expose the port your app runs on
EXPOSE 8000

# Run the application
CMD ["/app/lite-queen", "--hostname", "0.0.0.0", "--port", "8000"]