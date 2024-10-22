echo "Running script: $(basename "$0")"


DATE=$(date +%Y-%m-%d)

cd _ui/


if ! npm run build; then
    echo " ❌ Failed to build. Stopping the script."
    exit 1
fi


if ! npm run generate-static-bundle; then
    echo " ❌ Failed to generate static bundle. Stopping the script."
    exit 1
fi


cd ../executable


cp ../_ui/static-ui-bundle.js static-ui-bundle.js


bun run build-local
bun run build-dist-linux-x64
bun run build-dist-linux-arm64
bun run build-dist-darwin-x64
bun run build-dist-darwin-arm64




