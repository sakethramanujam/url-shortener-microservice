'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var Schema = mongoose.Schema

var url_s = new Schema({
    original_url : {
      type: String,
      required: true
    },
    shortened_url : {
      type: String
    },
    created_on: {
      type: Date,
      default: Date.now
    }
})


var URL_ = mongoose.model('URL_', url_s)

function gen_id() {
  var randomtext = "";
  var possible = "hakunamatata";

  for (var i = 0; i < 12; i++)
    randomtext += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomtext;
}

function check (field, value, callback) {
  URL_.count(field, function (err, count) {
    callback(err, count);
  })
}

app.post("/api/shorturl/new", (req, res)=>{
  
  var base_url_1 = req.body.url;
  
  var code_id = gen_id()
  
  check('new_url', code_id, function (err, count) {
    if (err) 
      console.log(err)
    if (count >= 1) 
      code_id = gen_id()
  })
  
  if(check("base_url", base_url_1, (err, count)=>{
    if(count < 1){
      var p1 = new URL_({
        base_url: base_url_1,
        new_url: code_id
      })

      p1.save((err, data) => {
        if(err) console.log(err)
        else {
          res.json({"original_url": base_url_1, "short_url": code_id})
        }
      })
    }
    else {
      var x = URL_.find({'base_url': base_url_1}, (err, data)=>{
        res.json({"original_url": data.base_url, "new_url": data.new_url})
      })
    }
  })){
  }
  else {
    console.log('Exists!')
  }
  
    
})  

app.get("/api/shorturl/:old_url", (req, res)=>{
  res.json(req.params.old_url)
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});