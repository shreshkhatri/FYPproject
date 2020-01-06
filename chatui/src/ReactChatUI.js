import React, { Component } from "react";
import { View, Image } from 'react';
import PropTypes from "prop-types";
import { Widget, addResponseMessage, addUserMessage, addLinkSnippet,renderCustomComponent } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";
import logo from "./logo.svg";
import "./App.css";
import { type } from "os";

//disable showing minor warning on console
console.log = console.warn = console.error = () => {};


class ReactChatUI extends Component {
  state = {};
  

  handleNewUserMessage = newMessage => {

    //this.communicateMessages(newMessage);
    // Now send the message throught the backend API

    const url = "http://localhost:5000/api/";
    var obj = { query: newMessage };
   console.log(JSON.stringify(obj));
   
   //this fetch API call is used to forward the message typed as object 'obj' to the URL 
   //specified by url variable.

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj)
    })
      .then(resp => {
        //console.log(typeof resp);
        return resp.json();
      })
      .then(res => {
          
          //adding n message to the chat UI with delay of 1.5seconds after each write
          for(let i=0;i<res.reply.Responses.length;i++){
            
            setTimeout(function() {
              //checking if the intent name contains the word 'location' anywhere between in
              if(String(res.reply.Intent).search(/location/i)>-1 && String(res.reply.Responses[i]).search(/https:/)>-1){
                addLinkSnippet({
                  title: 'Location | Herald College',
                  link: res.reply.Responses[i],
                  target: '_blank'
                });
              }
              else if(String(res.reply.Intent).search(/university/i)>-1 && String(res.reply.Responses[i]).search(/http/)>-1){

                //this elseif confirms that the response is a URL link to the University page
                //therefore this response is rendered as link using addLinkSnippet function
                addLinkSnippet({
                  title: '| University of Wolverhampton |',
                  link: res.reply.Responses[i],
                  target: '_blank'
                });
              }
              else if(String(res.reply.Intent).search(/collegecontact/i)>-1 && String(res.reply.Responses[i]).search(/http/)>-1){
                
                //this clause ensures that the respons is lnik to the facebook page 
                //and renders the response as link using addLinkSnippet function
                addLinkSnippet({
                  title: '| Herald College Facebook |',
                  link: res.reply.Responses[i],
                  target: '_blank'
                });
              }
              else if(String(res.reply.Intent).search(/degreeprograms/i)>-1 
                            && String(res.reply.Responses[i]).search(/http/)>-1
                            && String(res.reply.Responses[i]).search(/computer/)>-1){
                addLinkSnippet({
                  title: '| Bachelor in Computer Science |',
                  link: res.reply.Responses[i],
                  target: '_blank'
                });
              }
              else if(String(res.reply.Intent).search(/degreeprograms/i)>-1 
                            && String(res.reply.Responses[i]).search(/http/)>-1
                            && String(res.reply.Responses[i]).search(/business/)>-1){
                addLinkSnippet({
                  title: '| Bachelor in Business Management |',
                  link: res.reply.Responses[i],
                  target: '_blank'
                });
              }
              else{
                addResponseMessage(String(res.reply.Responses[i])|| 'Sorry ,I am not told about it yet.');
              }
            }, i*1500);
          }
      })
      .catch(error =>
        //this means that there is no response coming from FETCH API whcih means the 
        //application server is not reachable therefore, the unavailabl response is sent to the user
        addResponseMessage(
          "I am unaviable right now. Please try again later. \nSorry for the inconvenience."
        )
      );
  };

  handleQuickbuttonclickedEvent=value=>{
    alert(value);

  };

  componentDidUpdate(){
  }
 
  handleModalDataChange(event){
    alert('hi');
}

  componentDidMount() {
    var data=this.data;
    const FormD = ({data,action}) => {
      return <img style={{height:100,width:100 }} src={data} onClick={action}/>
      }
  

  
    addResponseMessage("welcome to the Herald College chatbot  ");
    //renderCustomComponent(FormD, {data: 'https://image.flaticon.com/icons/png/512/2426/2426952.png', action: this.handleModalDataChange });

  }

  render() {

    return (
      <div>
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          title={this.props.title}
          subtitle= ''
          
        />
      </div>
    );
  }
}
ReactChatUI.propTypes = {
  title: PropTypes.string.isRequired
};


export default ReactChatUI;
