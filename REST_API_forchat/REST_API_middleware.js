const express = require("express");
const dialogflow = require("dialogflow");
const uuid = require("uuid");
const port = process.env.port || 5000;
const REST_API_middleware = express();
const sessionId = uuid.v4();
const Joi = require("joi"); //a class is returned

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */

REST_API_middleware.use(express.json());

REST_API_middleware.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

REST_API_middleware.post("/api/", (req, res) => {
  //schema for validating the user query

  resolveQuery(req.body.query)
    .then(data => {
      res.send({ reply: data });
    })
    .catch(error => {
      res.send({ response: error });
    });
});

async function resolveQuery(msg, projectId = "heraldcollegechatbot-lyyxju") {
  // A unique identifier for the given session

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename:
      "key/HeraldCollegeChatbot-0f13eca3fbc1.json"
  });
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: "en-US"
      }
    }
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  //console.log("Detected intent");
  const result = responses[0].queryResult;
//  console.log(result.fulfillmentMessages[1].quickReplies);

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }

  //defining an object
  var parcel={
    Responses:[],
    Intent:''
  };
  parcel.Intent=result.intent.displayName;

  //pusing every messages coming from dialogflow server to 
  //parcel.Responses array
  for(var i=0;i<result.fulfillmentMessages.length;i++){
    parcel.Responses.push(result.fulfillmentMessages[i].text.text);
  }

  console.log(parcel);
  return parcel;
}

console.log(typeof(REST_API_middleware));
//runSample('where is the college ?', projectId = "heraldcollegechatbot-lyyxju");
REST_API_middleware.listen(port, () => console.log(`listening on port ${port}`));
