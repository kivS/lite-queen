# Start from a base image, e.g., a lightweight Linux distribution
FROM debian:12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the pre-built executable into the container
COPY ./lite-queen /app/lite-queen

# If your application needs additional runtime libraries, install them
# RUN apk add --no-cache <dependencies>

# Copy the SQLite database files
RUN mkdir -p /app/databases
COPY ./databases/* /app/databases/

# Make sure the executable is runnable
RUN chmod +x /app/lite-queen

# Expose the port your app runs on
EXPOSE 8000

# Run the application
CMD ["/app/lite-queen", "--hostname", "0.0.0.0", "--port", "8000"]