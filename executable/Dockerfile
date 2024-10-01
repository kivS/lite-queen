# AMD64 build
FROM debian:12-slim AS amd64
WORKDIR /home/litequeen
COPY dist/lite-queen-linux-x64 ./lite-queen
RUN chmod +x lite-queen

# ARM64 build
FROM debian:12-slim AS arm64
WORKDIR /home/litequeen
COPY dist/lite-queen-linux-arm64 ./lite-queen
RUN chmod +x lite-queen

# Final stage
FROM debian:12-slim

WORKDIR /home/litequeen

# Copy the appropriate binary based on architecture
COPY --from=amd64 /home/litequeen/lite-queen /home/litequeen/lite-queen-amd64
COPY --from=arm64 /home/litequeen/lite-queen /home/litequeen/lite-queen-arm64

RUN apt update -y
RUN apt install -y sqlite3

# Create a script to select the correct binary
RUN echo '#!/bin/sh' > /usr/local/bin/lite-queen && \
    echo 'if [ "$(uname -m)" = "x86_64" ]; then' >> /usr/local/bin/lite-queen && \
    echo '    exec /home/litequeen/lite-queen-amd64 "$@"' >> /usr/local/bin/lite-queen && \
    echo 'elif [ "$(uname -m)" = "aarch64" ]; then' >> /usr/local/bin/lite-queen && \
    echo '    exec /home/litequeen/lite-queen-arm64 "$@"' >> /usr/local/bin/lite-queen && \
    echo 'else' >> /usr/local/bin/lite-queen && \
    echo '    echo "Unsupported architecture: $(uname -m)"' >> /usr/local/bin/lite-queen && \
    echo '    exit 1' >> /usr/local/bin/lite-queen && \
    echo 'fi' >> /usr/local/bin/lite-queen && \
    chmod +x /usr/local/bin/lite-queen

# Create data directory
RUN mkdir data

# Expose the port your app runs on
EXPOSE 8000

# Use the script as the entrypoint
CMD ["lite-queen", "--hostname", "0.0.0.0", "--data_dir", "/home/litequeen/data", "--port", "8000"]