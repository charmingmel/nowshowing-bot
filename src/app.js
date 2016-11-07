'use strict'

require('dotenv').config()
const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Set config values
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN

if (!(VERIFY_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

app.get('/', function (req, res) {
  res.send('hello world i am a movie bot')
})

// Facebook Verification
app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
})

// Post message
app.post('/webhook', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  let generic = ['movie', 'now', 'showing', 'movies', 'now showing', 'currently', 'presently']

  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id

    if (event.message && event.message.text) {
      let text = event.message.text
      let testGeneric = generic.filter(isGenericText);

      if (testGeneric.length > 0) {
        sendGenericMessage(sender)
        continue
      }
      sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
      continue
    }
  }

  function isGenericText(str) {
    return new RegExp(str).test(text);
  }

  res.sendStatus(200)
})

function sendTextMessage(sender, text) {
  let messageData = {text: text}
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.error('Error sending messages: ', error)
    } else if (response.body.error) {
      console.error('Error: ', response.body.error)
    }
  })
}

function sendGenericMessage(sender) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Avatar is showing now",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://images2.fanpop.com/image/photos/12300000/Avatar-avatar-12304477-1280-720.jpg",
          "buttons": [{
            "type": "web_url",
            "url": "http://www.enksoft.com",
            "title": "Open web page"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        }, {
          "title": "Midnight in Paris Las Vegas",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/51/The_hotel_Paris_Las_Vegas_as_seen_from_the_hotel_The_Bellagio.jpg",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.error('Error sending messages: ', error)
    } else if (response.body.error) {
      console.error('Error: ', response.body.error)
    }
  })
}

app.set('port', process.env.PORT || 7000)

app.listen(app.get('port'), function() {
  console.log('Running Now Showing Bot on port', app.get('port'))
})
