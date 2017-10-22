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
  access_token:         '921549079498379264-pT8IgFHtw5spi8h5ea423p5LAmVsTHF',
  access_token_secret:  'odDbIuldTyLSb0HPJObTb3L7iGSQYbstnWnDIPGHTZ3qa',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var userStream = T.stream('user');

userStream.on('tweet', function(tweet) {
  tweetEvent(tweet);
});

userStream.on('direct_message', function (eventMsg) {
    dmEvent(eventMsg.direct_message);
});

userStream.on("follow", function(eventMsg){
  welcomeUsers(eventMsg);
});

function welcomeUsers(eventMsg){
  var followObject = {
    screen_name: eventMsg.source.screen_name
  }

  if(eventMsg.source.screen_name != "ProjectCube1"){
    T.post('friendships/create', followObject, (err, data) =>{
      if(err){
        console.log("something went wrong! "+err);
      }else{
        console.log(data);
        tweetWelcomeMessage(eventMsg.source.id, eventMsg.source.screen_name);
      }
    });
  }
}

function dmEvent(eventMsg){
  var from = eventMsg.sender.screen_name;
  var text = eventMsg.text.toLowerCase()+"";
  if(eventMsg.sender.screen_name != "ProjectCube1"){

    var splitText = text.split(" ");
    // //Split the text, the first entry will be the command...
    switch(splitText[0]){
      case "!vote":
       //Format will be !vote <ID> <Number of Votes>
        voteForExistingCommand(splitText[1], splitText[2], from);
        break;
      case "!top":
        returnTopTweet(eventMsg.sender.id, from);
        break;
      case "!help":
        tweetHelpMessage(eventMsg.sender.id, from);
        break;
      case "!cmd":
        createNewCommand(text, eventMsg.sender.id, from);
        break;
      default:
      //Tweet you may have entered a command incorrectly...
        tweetHelpMessage(eventMsg.sender.id, from);
        break;
    }
  }
}

function createNewCommand(text, tweetIdToReply, userHandle) {
  var uuid = uuidv4();
  var removeCmd = text.split("!cmd")[1];
  console.log("Inserting "+removeCmd+" into db.");
  var command = new Command({
    username: userHandle,
    text: removeCmd,
    reply_id: tweetIdToReply,
    votes: 1,
    UUID: uuid.substring(uuid.length - 4),
  });
  myCollection.insert(command, (err, res)=>{
    if(err != null){
      console.log(err);
    }else{
      var text = "Thanks for submitting '" + removeCmd + "' , we're a bit ashamed to say we've replied to you.";
      sendDirectMessage(text, userHandle);
    }
  });
}

function voteForExistingCommand(id, numberOfVotes, userHandle){
  var numVotes = parseInt(numberOfVotes);
  if(numVotes > 3){
    numVotes = 3;
  }

  var commands = myCollection.findOneAndUpdate(
    {UUID: id},
    {
      $inc: { votes:  numVotes},
    },
    { returnNewDocument: true}, function(err, documents){
      if(err != null){
        console.log(err);
      }else{
        console.log(documents.value.text);
        var text = 'You voted for: "' + documents.value.text +'"!';
        sendDirectMessage(text,userHandle);
      }
    });
}

function returnTopTweet(tweetIdToReply, userHandle){
  var commands = myCollection.find().limit(5).sort({ "votes": -1 })
  var text= "";
  var infoText = 'Here are the current top commands: \n'+
             'Format is <cmd> | <UUID> | <numberOfVotes> \n';
  sendDirectMessage(infoText, userHandle);
  var i=1;
  commands.each(function(err, doc){
    if(doc != null){
      text += i+'. '+doc.text+' | id='+doc.UUID+' | votes='+doc.votes+'\n';
      i++;
    }else{
      text += " Vote for them by tweeting !vote <UUID> <numberOfVotes>.";
      sendDirectMessage(text, userHandle);
    }
  });
}

function tweetHelpMessage(tweetIdToReply, userHandle){
 var text = 'You have given me invalid input. Start your message with either: '+
            '!vote, !top or !cmd.\n'+
            '----\n'+
            '!vote <ID> <Number of Votes> - vote on existing ideas. Find ID at <domain>.\n'+
            '----\n'+
            '!top - displays the top 5 current ideas.\n'+
            '----\n'+
            '!cmd <Command> - Submit a new thing for us to do.';
 sendDirectMessage(text, userHandle)
}

function tweetWelcomeMessage(tweetIdToReply, userHandle){
var text = "Hello! Welcome to the Isolation Room, please visit <Domain> to see the stream!\n"+
          'Start your message with either: '+
          '!vote, !top or !cmd.\n'+
          '----\n'+
          '!vote <ID> <Number of Votes> - vote on existing ideas. Find ID at <domain>.\n'+
          '----\n'+
          '!top - displays the top 5 current ideas.\n'+
          '----\n'+
          '!cmd <Command> - Submit a new thing for us to do.';
  sendDirectMessage(text, userHandle);
}

function sendDirectMessage(text, userId){
  var dm = {
    text: text,
    screen_name:userId
  }

  T.post('direct_messages/new', dm, function(err){
    if(err){
      console.log("This went wrong! "+err);
    }else{
      console.log("It worked!");
    }
  });
}
