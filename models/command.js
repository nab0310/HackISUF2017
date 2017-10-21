// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var commandSchema = new Schema({
  username: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  reply_id: String,
  votes: Number,
  created_at: Date,
  updated_at: Date,
  UUID: String,
});

// the schema is useless so far
// we need to create a model using it
var Tweet = mongoose.model('Tweet', commandSchema);

// make this available to our users in our Node applications
module.exports = Tweet;
