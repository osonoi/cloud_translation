# translation

gcpの環境変数設定
export GOOGLE_APPLICATION_CREDENTIALS=gcp.json

## ローカルでの起動

```
$ npm install
$ npm start
```
## dockerでの起動

```
$ docker build -t yosonoi/translation .
$ docker run -d -p 3000:3000 yosonoi/translation
```
メインとなるプログラムは
route/index.js, views/index.ejs
