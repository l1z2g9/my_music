## Client (Vite + Typescript + React + PureCSS)
```
yarn dev
serve -l 8080 build
curl https://v2.i996.me/22703837 | cmd
```

## Server
`set GRAALVM_HOME=C:\Users\user\Desktop\Forrest\app\graalvm-ce-java17-22.3.2`

Add below in top of %GRAALVM_HOME%\bin\native-image.cmd
`call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" > nul`

## Natively build executable
```
gradle nativeCompile
Or
%GRAALVM_HOME%\bin\native-image.cmd -jar build\libs\my_music-0.1-all.jar
```

## Docker build native executable
```
yarn build && move /y dist\* ..\server-java-mn\src\main\resources\dist\
Copy dist folder from client to src\main\resources

set frontend folder in static-resources
    paths: file:///app/dist

gradle dockerBuildNative
docker tag my_music cmVwby5sYWIudmFybWVlZ28uY29tL2ZvcnJlc3Qud2VuL2NlZGItdHN3L2xvZ2luLXNlcnZpY2U=
docker push cmVwby5sYWIudmFybWVlZ28uY29tL2ZvcnJlc3Qud2VuL2NlZGItdHN3L2xvZ2luLXNlcnZpY2U=
```

## Local development
```
session 1: yarn build-watch
session 2: gradle build && java -jar build\libs\my_music-0.1-all.jar