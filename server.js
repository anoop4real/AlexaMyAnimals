var fs = require('fs');
var https = require('https');
var http = require('http');
let express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000,
  app = express();
let alexaVerifier = require('alexa-verifier');


const SKILL_NAME = 'My Animals';
const GET_HERO_MESSAGE = "Here's your animal sound: ";
const HELP_MESSAGE = 'You can say play me the sound of an animal, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'
var isFisrtTime = true


app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}
app.post('/myanimals', requestVerifier, function(req, res) {
  if (req.body.request.type === 'LaunchRequest') {
    res.json(wlecomeToAnimalSounds());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */ } else if (req.body.request.type === 'IntentRequest') {

    switch (req.body.request.intent.name) {
      case 'PlayAnimalSound':
        if (!req.body.request.intent.slots.AnimalName || !req.body.request.intent.slots.AnimalName.value) {

          res.json(playAnimalSound(''));
        } else {
          const value = req.body.request.intent.slots.AnimalName.value
          res.json(playAnimalSound(value));
        }

        break;

      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      default:

    }
  }
  // req.body.request.intent.name === 'AMAZON.YesIntent') {
  //
  //   if (!req.body.request.intent.slots.Day ||
  //     !req.body.request.intent.slots.Day.value) {
  //       // Handle this error by producing a response like:
  //       // "Hmm, what day do you want to know the forecast for?"
  //     }
  //     let day = new Date(req.body.request.intent.slots.Day.value);
  //
  //     // Do your business logic to get weather data here!
  //     // Then send a JSON response...
  //
  //     res.json({
  //       "version": "1.0",
  //       "response": {
  //         "shouldEndSession": true,
  //         "outputSpeech": {
  //           "type": "SSML",
  //           "ssml": "<speak>Looks like a great day!</speak>"
  //         }
  //       }
  //     });
  //   }
});

function playAnimalSound(animalName) {

  var tempSpeechOutput = 'Here is your sound <break time="0.3s" />'


  const more = "<speak>You can say play me the sound of animal</speak>"
  var sound = ''
  switch (animalName) {
    case "bear":
      sound = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/animals/amzn_sfx_bear_groan_roar_01.mp3'/> " + PAUSE + " <audio src = 'https://s3.amazonaws.com/ask-soundlibrary/animals/amzn_sfx_bear_groan_roar_01.mp3'/>"
      break;
    default:
      sound = "Sorry couldnt find the sound of" + animalName
      tempSpeechOutput = ""
      break;

  }
  const speechOutput = "<speak>" + tempSpeechOutput + sound + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": false,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
    "card": {
      "type": "Simple",
      "title": SKILL_NAME,
      "content": "Welcome to myanimals",
      "text": "Welcome to myanimals"
    },
    "reprompt": {
      "outputSpeech": {
        "type": "PlainText",
        "text": more,
        "ssml": more
      }
    },
  }

  return jsonObj;

}

function wlecomeToAnimalSounds() {

  var welcomeSpeechOutput = 'Welcome to myanimals <break time="0.3s" /> You can say play me the sound of animal'
  if (!isFisrtTime) {
    welcomeSpeechOutput = '';
  }

  const speechOutput = "<speak>" + welcomeSpeechOutput + "</speak>"
  const more = "<speak>You can say play me the sound of animal</speak>"

  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": false,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
    "card": {
      "type": "Simple",
      "title": SKILL_NAME,
      "content": "Welcome to myanimals",
      "text": "Welcome to myanimals"
    },
    "reprompt": {
      "outputSpeech": {
        "type": "PlainText",
        "text": more,
        "ssml": more
      }
    },
  }

  return jsonObj;

}

function stopAndExit() {

  const speechOutput = "<speak>" + STOP_MESSAGE + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": true,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
  }

  return jsonObj;
}

function help() {

  const speechOutput = "<speak>" + HELP_MESSAGE + "</speak>"
  const reprompt = "<speak>" + HELP_REPROMPT + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": false,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
    "reprompt": {
      "outputSpeech": {
        "type": "PlainText",
        "text": reprompt,
        "ssml": reprompt
      }
    },
  }

  return jsonObj;
}
//httpServer.listen(port);
//httpsServer.listen(7000);
app.listen(port);
console.log('Alexa list RESTful API server started on: ' + port);