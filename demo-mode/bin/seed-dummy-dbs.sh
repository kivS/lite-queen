echo "Seeding the dummy databases"

declare -a dbs=(
    # file name and file path inside of container
    "simplefolks.sqlite /app/databases/simplefolks.sqlite"
    "travelbuddy.db /app/databases/travelbuddy.db"
    # "census2000names /app/databases/census2000names.sqlite"
    # Add more databases here
)
for db_entry in "${dbs[@]}"; do
    IFS=' ' read -r db_alias db_path <<< "$db_entry"
    curl --location --request POST 'http://localhost:8000/api/load-database' \
    --header 'Cache-Control: no-cache' \
    --header 'Accept: */*' \
    --header 'Accept-Encoding: gzip, deflate' \
    --header 'Connection: keep-alive' \
    --data-urlencode 'db_path=$db_path' \
    --data-urlencode 'db_alias=$db_alias'
done
