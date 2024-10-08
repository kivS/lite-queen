#!/bin/bash

#
# 
# this can be run before a commit is pushed by being called with the pre-push hook: .git/hooks/pre-push 
#  

echo "Running script: $(basename "$0")"


DATE=$(date +%Y-%m-%d)



if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo " ❌ Not on the main branch. Skipping..."
    exit 1
fi


if git diff --name-only HEAD^ HEAD | grep --quiet -e "_ui/" -e "executable/"; then
    echo "✅ Changes detected in the _ui/ or executable/ files for the main app. Processing..."

    echo -e "\n\n"
    
    echo "Building and pushing the docker image..."
    docker buildx build  --platform linux/amd64,linux/arm64 -t  kivsegrob/lite-queen:latest --push .

    # build_executable darwin x64
    # build_executable darwin arm64

    echo "Builds completed."
    echo "All done! 🚀"
    exit 0

fi


echo "❌ No detected valid changes for building the executables & Docker image for distribution... carry on!"
exit 0

