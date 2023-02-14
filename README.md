# Text-Chat-Service

Socket.io-based service that accepts user input, parses it as a chat message, and emits an appropriate response.

The chat server is deployed at *https://text-chat-service.herokuapp.com/*. This is the URL that a connection should be initiated to.

The main event that the server waits for is **'message'**. 
The message event requires parameters **user_name** and **message**.
Optional parameters are **game_id** and **role**

incoming event: 'message' :

* user_name - The in-game name of the user sending the message
* message   - The message that has been sent
* role      - The user's in-game role. Currently supported roles are Player and GM. Unrecognized roles default to Player
* game_id   - The unique ID of the lobby the user is in

> socket.emit('message', {
    'game_id': '5142246',
    'user_name': 'GeeHaus',
    'message': 'I am sending a test message a player might send. It will be attributed to me as speech.',
    'role': 'Player'
    });



In response, the server emits either a **'message'** event or an **'err'** event. They will contain the following properties:

outgoing event: 'message' :

Output is a plain String; the message for the client to print to the players.

> socket.on('message', (msg) => {
    console.log(msg); // GeeHaus: I am sending a test message a player might send. It will be attributed to me as speech.
    });


outgoing event: 'err' :

* user_name - The in-game name of the user who will need to receive the error message
* errMsg    - The error message that the server is responding with

> socket.on('err', (err) => {
    console.log(err.user_name, err.errMsg); // GeeHaus, Unknown command. Try /help to see a list of all available commands
    });



The chat server will parse the user's **message** for commands. Currently supported commands are as follows, broken down by Role:

Role: GM
No command - Formats the message as an anonymous statement
    -Ex.      It was a dark and stormy night
    -Returns: It was a dark and stormy night

/as \[NPCName\] \[Message\] - Attributes the message to the provided NPC
    -EX.      /as NPC1 I'm testing out the chat system using /as.
    -Returns: NPC1: I'm testing out the chat system using /as.


Role: Player
No command - Formats the message as though said by the player
    -Ex.      I'm testing the chat system!
    -Returns: User123: I'm testing the chat system!

/me \[Message\] - Formats the message as a personal action
    -EX.      /me tests out the chat system using /me.
    -Returns: User123 tests out the chat system using /me.

\* \[Message\]  - Alias for /me