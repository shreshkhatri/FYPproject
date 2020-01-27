# FYPproject
Final year project
A dialowflow chatbot model has been used using REST app created using Express JS. A chat widget called wolox build using React JS has been used as UI. The project has following components

1. GUI for chat (chatui folder)
2. REST middleware (REST_API_forchat)
3. Cloud functions (cloud functions)
4. Utility for testing Dialogflow model (botium-samples-nlpanalytucs)

All of those componets run in NodeJS environment. If NodeJS v8 is required if Dialogflow model is to be tested.

Steps for running the project
==============================

1. First install nodeJS.

2. Extract the zipped folder for the application into a folder on your local machine.

3. Browse to the extracted folder

4. frist of all GUI can be tested so browse to the folder 'chatUI' using command prompt on Windows or terminal on Linux.
    
    1.run 'npm install' command [ This command will install all of the dependencies required to run the GUI application . All the dependencies are specified on package.json file.]
    2. run 'npm start' command [ This command will start React application on localserver. Then default browser is opened and browser is routed to the localhost where the React application is hosted. ] 
    This step will show the GUI for the application.
    
    Typing and interacting with the GUI will not work because, REST application server is not activated yet. Therefore, the app will respond with 'service unavailability' message and the command prompt or terminal should not be closed yet.

5. Now, activate the REST middleware. Browse to REST_API_forchat and open the terminal or command prompt on point the path on teriman or command prompt to the REST_API_forchat folder.
    1. Now run 'npm start' command again. This will install all the node moduels required to activate the REST_API program.
    2. run 'node REST_API_middleware.js' command on the command line or terminal.
        This command will mount the application server. The command prompt or terminal should not be closed yet.
        The terminal will display message which says that the server is listening on a certain prompt. This terminal will display the details about user query, response received from Dialogmodel, intent confidence for matched intent, intent name etc.
From now on the communication can be started. The queries about the college, affiliated university, available academic programs etc etc can be asked and the bot replies with the answers. 
These are the steps required for running the cloud funciton.

# Note :
authentication key, project ID are most for running for the project. Due to security concern I have not included those sensitive information here.


