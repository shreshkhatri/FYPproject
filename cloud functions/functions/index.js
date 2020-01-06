// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { WebhookClient, Card, Suggestion } = require("dialogflow-fulfillment");
const nlptool = require("natural");
const NGrams = nlptool.NGrams;
const tokenizer = new nlptool.WordTokenizer();
admin.initializeApp(functions.config().firebase);
const firestoredb=admin.firestore();
const moment = require('moment-timezone');

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({request: request, response: response});
    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));

    //this function is called if the users asks how are you questions
    function askHowAreYou(agent) {
      var list = tokenizer.tokenize(agent.query);
      var index;
      var matches = 0;
      const helloWords = [
        "hiii",
        "hello",
        "hey",
        "hiya",
        "hi",
        "heloo",
        "there"
      ];

      const replyForCourtseyWords = [
        "Hello, I have been good. Thanks for asking :) and how can I assist you?",
        "Hi, its so far so good. I am glad you asked and How may I help you?",
        "Hi, i am wonderful as always and thanks for asking.How can I help you?",
        "Hello, I am always good thank you and how could I help you please",
        "Hey, I am good. Thank you for asking. Could I help with anything related to the college?",
        "Hi ,I am ok thanks for asking :). How could I assist you?"
      ];

      /*function for checking the presense of the words such as hi hello etc in the
      agent query */

      list.forEach(function(word) {
        helloWords.find(function(w) {
          if (word.toLowerCase() === w) {
            matches++;
          }
        });
      });

      //if matches is greater than 0 it means that the phrases contains the
      //the words such as hi, hello, hi there etc
      if (matches === 0) {
        let response;
        index = Math.floor(Math.random() * replyForCourtseyWords.length);
        response = tokenizer.tokenize(replyForCourtseyWords[index]);

        //removing hi or hello word present in the predefined response
        response = response.slice(1);
        response = response.join(" ");
        agent.add(response + " ?");
      } else {
        //since no hi or hello words are there simply retrieve one of the responses from the list
        index = Math.floor(Math.random() * replyForCourtseyWords.length);
        agent.add(replyForCourtseyWords[index]);
      }
    }

    function fallback(agent) {
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index0= Math.floor(Math.random() * doc.data().replies0.length);
            var index1= Math.floor(Math.random() * doc.data().replies1.length);
            var index2= Math.floor(Math.random() * doc.data().replies2.length);
            
            agent.add(doc.data().replies0[index0]);
            agent.add(doc.data().replies1[index1]);
            agent.add(doc.data().replies2[index2]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function whoAmI(agent) {
      const ref = firestoredb.collection('responses').doc(String(agent.intent));


        return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get necessary details at the moment \nPlease kindly visit the website');
      });
    }

    function needToKnow(agent) {
      const query = agent.query;
    }

    function subsequentHowAreYous(agent) {
      let contexts = agent.contexts;
      let i;
      let lifeSpanCount;

      //checking if there are any active contexts
      if (contexts.length > 0) {
        for (i = 0; i < contexts.length; i++) {
          if (contexts[i].name === "askhowareyou_followup") {
            lifeSpanCount = contexts[i].lifespan;
            break;
          } else continue;
        }
      }

      var list = tokenizer.tokenize(agent.query);
      var index;

      const replyForCourtseyWords = [
        "I told you already, I am just good. Thanks for asking :)",
        "Like I told you a moment ago, its so far so good.",
        "i am just wonderful, I just told you",
        "I am always good, I told you already"
      ];

      if (lifeSpanCount === undefined) {
        agent.end("No more courtesy please, thanks a lot");
      } else {
        index = Math.floor(Math.random() * replyForCourtseyWords.length);
        agent.add(replyForCourtseyWords[index]);
      }
    }

    function sayHi(agent) {

      //sets the document path to 'responses/{agent.intent}/'
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      //this means that the user has typed their name
      if (agent.parameters.person){

        return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          var reply_words=tokenizer.tokenize(doc.data().replies[index]);

          //inserts person's name right after hello word
          var name=String(agent.parameters.person.name);

          //capitalizing first letter of the name
          name=name.charAt(0).toUpperCase()+name.slice(1) + ' ,';

          //inserting the name after hello word
          reply_words.splice(1,0,name);

          //joining the elements again to form sentences
          reply_words = reply_words.join(" ");

          //sending out the response
          agent.add(reply_words);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('');
      });
        
      }
      else{
        return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I am sorry but I don have reply for this.');
        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
          
         
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('I am sorry but I confused about how should I respond you');
      });
      }
    }

    function subsequentHi(agent) {
      let contexts = agent.contexts;
      let i;
      let lifeSpanCount;

      //checking if there are any active contexts
      if (contexts.length > 0) {
        for (i = 0; i < contexts.length; i++) {
          if (contexts[i].name === "sayhi_followup") {
            lifeSpanCount = contexts[i].lifespan;
            break;
          } else continue;
        }
      }

      if (lifeSpanCount === undefined) {
        agent.end("Well that was enough, \n No more hi please ...");
      } else {

        //sets the document path to 'responses/{agent.intent}/'
         const ref = firestoredb.collection('responses').doc(String(agent.intent));

        return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });
      }
    }

    function getCollegeLocation(agent){

      const ref = firestoredb.collection('responses').doc(String(agent.intent));

        return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
          agent.add(doc.data().link);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get necessary details at the moment \nPlease kindly visit the website');
      });
    }

    function aboutAffiliations(agent){
      
      const ref = firestoredb.collection('responses').doc(String(agent.intent)); 
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });
    }

    function resolvePositiveEmotions(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent)); 
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }


    function resolvePositiveEmotions_confirmation(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          const requestWords=['please','kind'];
          const regex=new RegExp(String(keyword),'i');
          //var index = Math.floor(Math.random() * doc.data().replies.length);
          var replies=[];
          var filteredList=[];
          console.log(regex);
          replies=doc.data().replies;
          filteredList= replies.filter((elem)=>{
          elem.search(regex);
          });

        agent.add(filteredList[0]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function aboutCollege(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function getCEOInfo(agent){
      
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index] +' '+doc.data().ceoName);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });
    }

    function getCollegeContactDetails(agent){

      console.log(tokenizer.tokenize(agent.query));
      const ref = firestoredb.collection('responses').doc(String(agent.intent));

      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          //replies_for_fbLinks ,
          var index = Math.floor(Math.random() * doc.data().replies.length);
          var replies_for_fbLinks = Math.floor(Math.random() * doc.data().replies_for_fbLinks.length);
          var replies_for_webLink = Math.floor(Math.random() * doc.data().replies_for_webLink.length);

          agent.add(doc.data().replies[index]);
          agent.add('For general inquiry : '+doc.data().email);
          agent.add('Phone numbers  : '+doc.data().phone[0] +' , '+doc.data().phone[0]);
          agent.add(doc.data().replies_for_fbLinks[replies_for_fbLinks]);
          agent.add(doc.data().linkFB);

        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });


    }

    function aboutUniversity(agent){
      
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index_reply = Math.floor(Math.random() * doc.data().replies.length);
          var index_link = Math.floor(Math.random() * doc.data().link.length);
          agent.add(doc.data().replies[index_reply]);
          agent.add(doc.data().link[index_link]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function complainIssuesFeedback(agent){

      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index = Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function aboutCreditTransfer(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index0 = Math.floor(Math.random() * doc.data().replies0.length);
          var index1 = Math.floor(Math.random() * doc.data().replies1.length);
          agent.add(doc.data().replies0[index0]);
          agent.add(doc.data().replies1[index1]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function aboutExtraActivities(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index= Math.floor(Math.random() * doc.data().replies.length);
          agent.add(doc.data().replies[index]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function getIntakeInfo(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          var index0= Math.floor(Math.random() * doc.data().replies0.length);
          var index2= Math.floor(Math.random() * doc.data().replies2.length);
          var index1= Math.floor(Math.random() * doc.data().replies1.length);
          agent.add(doc.data().replies0[index0]);
          agent.add(doc.data().replies2[index2]);
          agent.add(doc.data().replies1[index1]);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function getDegreePrograms(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          if(agent.parameters.courseName && agent.parameters.courseName.toString().trim()==='BIT'){
            
            let index1= Math.floor(Math.random() * doc.data().replies_for_BIT.length);
            
            agent.add(doc.data().replies_for_BIT[index1]);
            agent.add(doc.data().BIT);
          
          }else if (agent.parameters.courseName && agent.parameters.courseName.toString().trim()==='BBA'){
          
            let index1= Math.floor(Math.random() * doc.data().replies_for_BBA.length);
            
            console.log('I am matched' ,index1);
            agent.add(doc.data().replies_for_BBA[index1]);
            agent.add(doc.data().BBA);
          
          
          }else if (agent.parameters.courseName.toString().trim()!==''){
          
            let index1= Math.floor(Math.random() * doc.data().otherReplies.length);
            
            console.log('I am matched' ,index1);
            agent.add(doc.data().otherReplies[index1]);
  
          } 
          else {
          var index= Math.floor(Math.random() * doc.data().replies.length);
          
          agent.add(doc.data().replies[index]);
          }
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });
    }

    function aboutGraduationLocation(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
     
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index0= Math.floor(Math.random() * doc.data().replies0.length);
            var index1= Math.floor(Math.random() * doc.data().replies1.length);
            var index2= Math.floor(Math.random() * doc.data().replies2.length);
            
            agent.add(doc.data().replies0[index0]);
            agent.add(doc.data().replies1[index1]);
            agent.add(doc.data().replies2[index2]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });
    }

    function getBBADuration(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index= Math.floor(Math.random() * doc.data().replies.length);
            agent.add(doc.data().replies[index]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }
    
    function getBITDuration(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index= Math.floor(Math.random() * doc.data().replies.length);
            agent.add(doc.data().replies[index]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function aboutScholarships(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index0= Math.floor(Math.random() * doc.data().replies0.length);
            var index1= Math.floor(Math.random() * doc.data().replies1.length);
            
            agent.add(doc.data().replies0[index0]);
            agent.add(doc.data().replies1[index1]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function aboutShift(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index0= Math.floor(Math.random() * doc.data().replies0.length);
            var index1= Math.floor(Math.random() * doc.data().replies1.length);
            var index2= Math.floor(Math.random() * doc.data().replies2.length);
            
            agent.add(doc.data().replies0[index0]);
            agent.add(doc.data().replies2[index2]);
            agent.add(doc.data().replies1[index1]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function aboutRecognitionAndTUEquivalency(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index0= Math.floor(Math.random() * doc.data().replies0.length);
            var index1= Math.floor(Math.random() * doc.data().replies1.length);
            //var index2= Math.floor(Math.random() * doc.data().replies2.length);
            
            agent.add(doc.data().replies0[index0]);
            agent.add(doc.data().replies1[index1]);
            //agent.add(doc.data().replies1[index1]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }

    function askDateTimeInformation(agent){

      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      let mmnt = moment(new Date());
      var datetime=mmnt.tz("Asia/Kathmandu");
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {

          var index=0;
            
            if (agent.parameters.DateTime==='year'){
              index= Math.floor(Math.random() * doc.data().yearResponse.length);
              agent.add(doc.data().yearResponse[index]+' '+datetime.format('YYYY')+' AD');
              //formats year in the form '2019'
            }
            else if(agent.parameters.DateTime==='month'){
               index= Math.floor(Math.random() * doc.data().monthResponse.length);
              agent.add(doc.data().monthResponse[index]+' '+datetime.format('MMMM'));
              //formats month in the form 'January'

            }
            else if(agent.parameters.DateTime==='date'){
              index= Math.floor(Math.random() * doc.data().dateResponse.length);
              agent.add(doc.data().dateResponse[index]+' '+datetime.format('LL'));
              //formats date in the form 'December 23, 2019'

            }
            else if(agent.parameters.DateTime==='time'){
              index= Math.floor(Math.random() * doc.data().timeResponse.length);
              agent.add(doc.data().timeResponse[index]+' '+datetime.format('LT'));
              //formats time in the form '3:12 PM'

            }
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }


    function checkEligibility(agent){
      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
            
            var index= Math.floor(Math.random() * doc.data().replies.length);
            agent.add(doc.data().replies[index]);
            
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });

    }


    function inquiryOfficeTime(agent){

      const ref = firestoredb.collection('responses').doc(String(agent.intent));
      
      return ref.get()
        .then(doc => {
          if (!doc.exists) {
          agent.add('I got nothing to say');

        } else {
          let index=0;

          if (agent.parameters.operational){
            let mmnt = moment(new Date());
            const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
            var datetime=mmnt.tz("Asia/Kathmandu");
            var openingTime = moment('07:00 AM', "HH:mm A");
            var closingTime = moment('05:00 PM', "HH:mm A");
            var currentTime = moment(datetime.format('LT'),"HH:mm A");
            var day=datetime.format('dddd');
            
            if(currentTime.isBetween(openingTime , closingTime) && days.includes(day)){
              index= Math.floor(Math.random() * doc.data().repliesOperational.length);
              agent.add(doc.data().repliesOperational[index]);
            } 
            else{
              index= Math.floor(Math.random() * doc.data().repliesOffline.length);
              agent.add(doc.data().repliesOffline[index]);
            }
          }
          else if (agent.parameters.openingTime){
            index= Math.floor(Math.random() * doc.data().repliesOpeningTime.length);
            agent.add(doc.data().repliesOpeningTime[index]);
          }
          else if(agent.parameters.closingTime){
            index= Math.floor(Math.random() * doc.data().repliesClosingTime.length);
            agent.add(doc.data().repliesClosingTime[index]);
          }
          else if (agent.parameters.officeTime || agent.parameters.workingDays){
            index= Math.floor(Math.random() * doc.data().repliesWorkingHours.length);
            agent.add(doc.data().repliesWorkingHours[index]);
          }
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Sorry, I failed to get response');
      });


    }

    function getBITFeeInfo(agent){
      
    }

    function getCollegeEstablishmentDate(agent){}

    // Run the proper function handler based on the matched Dialogflow intent name

    let intentMap = new Map();
    intentMap.set("subsequentHi", subsequentHi);
    intentMap.set("askHowAreYou", askHowAreYou);
    intentMap.set("subsequentHowAreYous", subsequentHowAreYous);
    intentMap.set("fallback", fallback);
    intentMap.set("whoAmI", whoAmI);
    intentMap.set("needToKnow", needToKnow);
    intentMap.set("sayHi", sayHi);
    intentMap.set("getCollegeLocation", getCollegeLocation);
    intentMap.set("aboutAffiliations", aboutAffiliations);
    intentMap.set("aboutCollege", aboutCollege);
    intentMap.set("resolvePositiveEmotions", resolvePositiveEmotions);
    intentMap.set("resolvePositiveEmotions_confirmation", resolvePositiveEmotions_confirmation);
    intentMap.set("getCEOInfo", getCEOInfo);
    intentMap.set("aboutUniversity", aboutUniversity);
    intentMap.set("getCollegeContactDetails", getCollegeContactDetails);
    intentMap.set("complainIssuesFeedback", complainIssuesFeedback);
    intentMap.set("aboutCreditTransfer", aboutCreditTransfer);
    intentMap.set("aboutExtraActivities", aboutExtraActivities);
    intentMap.set("getIntakeInfo", getIntakeInfo);
    intentMap.set("getDegreePrograms", getDegreePrograms);
    intentMap.set("aboutGraduationLocation", aboutGraduationLocation);
    intentMap.set("getBBADuration", getBBADuration);
    intentMap.set("getBITDuration", getBITDuration);
    intentMap.set("aboutScholarships", aboutScholarships);
    intentMap.set("aboutShift", aboutShift);
    intentMap.set("aboutRecognitionAndTUEquivalency", aboutRecognitionAndTUEquivalency);
    intentMap.set("askDateTimeInformation", askDateTimeInformation);
    intentMap.set("checkEligibility", checkEligibility);
    //intentMap.set("getCollegeFullName", getCollegeFullName);
    intentMap.set("inquiryOfficeTime", inquiryOfficeTime);//yet to be done
    intentMap.set("getBITFeeInfo", getBITFeeInfo);
    intentMap.set("getCollegeEstablishmentDate", getCollegeEstablishmentDate);


    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
  }
);
