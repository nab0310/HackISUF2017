var Twit = require('twit');
// grab the packages we need
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
const uuidv4 = require('uuid/v4');
var url = 'mongodb://heroku_j8s76cm0:puh9lnhidinimuqbr7m6lm8umq@ds125565.mlab.com:25565/heroku_j8s76cm0';
var myCollection;
var db = MongoClient.connect(url, function(err, db) {
    if(err)
        throw err;
    console.log("connected to the mongoDB !");
    myCollection = db.collection('tweets');
});

function clearDb(){
  myCollection.remove();
}

setTimeout(clearDb, 900000)

var Schema = mongoose.Schema;

var Command = require('./models/command');


var T = new Twit({
  consumer_key:         'HeesvHUNM9W6AfGW0U5NENGx7',
  consumer_secret:      'tz3JYAs0Nm3EfSbBHwMFghizWrHt6ds9JR0cCPsZVdusfGIGhw',
  access_token:         '921549079498379264-v4KE3nTWInt2vHsDOQ9f5IjDDgI7NCT',
  access_token_secret:  'dnI2rZ4PotfoNkK8LvwGysZp1MheICTfIObd1OZzyy59i',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

// to lower every request
// !vote [ID] #
// !top
// !help
// !cmd <String>
var userStream = T.stream('user');

var stream = T.stream('statuses/filter', {track: ['hack', 'hackISU', 'ISU']});

stream.on('tweet', function(tweet){
  tweetEvent(tweet);
});

userStream.on('tweet', function(tweet) {
  tweetEvent(tweet);
});

function tweetEvent(eventMsg){
	var from = eventMsg.user.screen_name;
  console.log("The tweet was from: "+from);
  var text = eventMsg.text.toLowerCase()+"";
  returnTopTweets();

  //If we didn't send this tweet, handle the request
  if(from !== "ProjectCube1" && eventMsg.retweeted_status == null){
    // var splitText = text.split(" ");
    // // //Split the text, the first entry will be the command...
    // switch(splitText[0]){
    //   case "!vote":
    //    //Format will be !vote <ID> <Number of Votes>
    //     voteForExistingCommand(splitText[1], splitText[2]);
    //   case "!top":
    //     returnTopTweets(eventMsg.id_str, from);
    //   case "!help":
    //     tweetHelpMessage(eventMsg.id_str, from);
    //   case "!cmd":
    //     createNewCommand(text, eventMsg.id_str, from);
    //   default:
    //   //Tweet you may have entered a command incorrectly...
    //     tweetHelpMessage();
    // // }
    //createNewCommand(text, eventMsg.id_str, from);
  }
}
function createNewCommand(text, tweetIdToReply, userHandle) {
  var uuid = uuidv4();
  var command = new Command({
    username: userHandle,
    text: text,
    reply_id: tweetIdToReply,
    votes: 1,
    UUID: uuid.substring(uuid.length - 4),
  });
  myCollection.insert(command);
}

function voteForExistingCommand(id, numberOfVotes){
  var commands = myCollection.update(
    {UUID: id},
    {
      $inc: { votes: 1 }
    }, function(err, status){
      if(err != null){console.log(err);}
    });
}

function returnTopTweets(tweetIdToReply, userHandle){
  var commands = myCollection.find().limit(10).sort({ "votes": 1 })
  commands.each(function(err, doc){
    console.log(doc);
  })
}

function tweetHelpMessage(tweetIdToReply, userHandle){
 var text = '@'+userHandle+' invalid input. Start your msg with either: !vote, !top or !cmd. Tweet !help <command> for more details'
 sendTweet(text, userHandle)
}

function sendTweet(text, tweetIdToReply){
  var tweet = {
		status: text,
		in_reply_to_status_id: tweetIdToReply
	}

	T.post('statuses/update',tweet,function(err){
    if(err){
      console.log("This went wrong! "+err);
    }else{
      console.log("It worked!");
    }
  });
}
