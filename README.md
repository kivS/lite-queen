# Lite Queen!

*Manage SQLite databases on your server with ease.*


- Web based 
- Easy to use
- No menu with a thousand options and knobs to turn
- Local and offline
- Plug-and-play, everything in a single executable


## Local auto-run /bin scripts

- We're using git `post-commit` hook to run our scripts that'll manage everything from building and deploying the executables, api, marketing websites and etc. It looks like this:

```text
#!/bin/bash

git push


/Users/mr_senor/Documents/lite-queen/bin/deploy_marketing_site.sh
/Users/mr_senor/Documents/lite-queen/bin/build_private_apps.sh
/Users/mr_senor/Documents/lite-queen/bin/build_for_distribution.sh
/Users/mr_senor/Documents/lite-queen/bin/deploy_api.sh
```



## Learnings

- Turns out the browser doesn't give you acess the the absolute path of a file--a sqlite db in our case--even with the `FileSystemFileHandle` web api. So we can't use a nice file picker in the browser and we need to pass the path by manually and let our server do the work.