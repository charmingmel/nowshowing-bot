'use strict'

require('dotenv').config()
const fs = require('fs');
const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Arbitrary value used to validate a webhook
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN

if (!(VERIFY_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

app.get('/', function (req, res) {
  res.send('hello world i am a movie bot')
})

app.set('port', process.env.PORT || 7000)

app.listen(app.get('port'), function() {
  console.log('Running Now Showing Bot on port', app.get('port'))
})
