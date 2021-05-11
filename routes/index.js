const express = require('express');
const router = express.Router();
require('dotenv').config();

function sleep(waitSec, callback) {
  
  setTimeout(callback, waitSec);

}

// Watson
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
/**
 * Instantiate the Watson Language Translator Service
 */
const languageTranslator = new LanguageTranslatorV3({
  authenticator: new IamAuthenticator({ apikey: process.env.LANGUAGE_TRANSLATOR_IAM_APIKEY }),
  serviceUrl: process.env.LANGUAGE_TRANSLATOR_URL,
  version: '2018-05-01',
});
// /watson

// Azure
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

var subscriptionKey = process.env.azure_subscription;
var endpoint = process.env.azure_endpoint;

// Add your location, also known as region. The default is global.
// This is required if using a Cognitive Services resource.
var location = "westus2";
// /Azure

// AWS
var AWS = require("aws-sdk");
const { ServerlessApplicationRepository } = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: "us-east-1"
});
// /AWS

// GCP
const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const projectId = 'translation-project-312809'
const gcp_location  = 'global';
// /GCP

router.get('/', (req, res, next) => {
  var data = {
    title: 'クラウド翻訳比較',
    content: ''
  };
  res.render('index', data);
});

router.post('/post', (req, res, next) => {
  var msg = req.body['message'];

  // AWS
var translate = new AWS.Translate();
var aws_txt = "";
var params = {
  SourceLanguageCode: 'en',
  TargetLanguageCode: 'ja',
  Text: msg
};

translate.translateText(params, function (err, data) {
  if (err) console.log(err, err.stack); 
//  else     console.log(data['TranslatedText']);
    else     aws_txt = data['TranslatedText'];
});
// /AWS

// Watson

 languageTranslator
   .translate({
     text: msg,
     source: 'en',
     target: 'ja',
   })
   .then(response => {
//     var data = {
//       title: 'クラウド翻訳比較',
//       ibm_content: '翻訳結果は' + response.result.translations[0]["translation"] + 'でした。'
     var ibm_txt = response.result.translations[0]["translation"];
//     console.log(ibm_txt);
//     };
//     res.render('index', data);
// /watson

// GCP
const text      = 'Hello world';

// Instantiates a client
const translationClient = new TranslationServiceClient();
async function translateText() {
  // Construct request
  const request = {
    parent: translationClient.locationPath(projectId, gcp_location),
    contents: [msg],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: 'en-US',
    targetLanguageCode: 'ja-JP',
  };

  // Run request
  const [response] = await translationClient.translateText(request);

  for (const translation of response.translations) {
//    console.log(`Translation: ${translation.translatedText}`);
    gcp_txt= translation.translatedText;
    console.log(gcp_txt);
}
}
translateText();
// /GCP

// Azure
axios({
  baseURL: endpoint,
  url: '/translate',
  method: 'post',
  headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
  },
  params: {
      'api-version': '3.0',
      'from': 'en',
      'to': ['ja']
  },
  data: [{
      'text': msg
  }],
  responseType: 'json'
}).then(function(response){
  var azure_txt = JSON.stringify(response.data[0]["translations"][0]["text"]).slice(1,-1);
  sleep(3000, function() {
    console.log("5 seconds");
    var data = {
      title: 'クラウド翻訳比較',
      source_content: msg,
      ibm_content: ibm_txt,
      azure_content: azure_txt,
      aws_content: aws_txt,
      gcp_content: gcp_txt
    };
    res.render('show', data);
  })
})
// /Azure



    })
   .catch(error => console.error(error));

});

module.exports = router;
