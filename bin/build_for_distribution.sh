#!/bin/bash

echo "Running script: $(basename "$0")"


DATE=$(date +%Y-%m-%d)

cd executable

pwd

# Function to build executable
build_executable() {
  local os=$1
  local arch=$2
  # local output_name="lite-queen-$os-$arch-$DATE"
  local output_name="lite-queen-$os-$arch"
  echo "Building binary for $os $arch"

  bun run build-dist-$os-$arch

}

# Build executables for all target platforms
build_executable darwin x64
build_executable darwin arm64
build_executable linux x64
build_executable linux arm64

echo "Builds completed. Check the 'executable/dist' directory for output."


echo "Building and pushing the docker image..."
docker buildx build  --platform linux/amd64,linux/arm64 -t  kivsegrob/lite-queen:latest --push .

echo "All done! 🚀"