const app = require('express')();
const dotenv = require('dotenv');
const http = require('http').Server(app);
const cors = require('cors');
const io = require('socket.io')(http, { 
    allowUpgrades: false, 
    transports: ["polling"], 
    cors: { origin: "*" },
});

dotenv.config();

const playerCmds = ['me'];
const GMCmds = ['as'];
const globalCmdDictionary = ['/help: Displays this list of commands and their functions.'];
const playerCmdDictionary = ['/me [message]: Displays your message as a personal action. Alias: * [message]'];
const GMCmdDictionary = ['/as [NPC] [message]: Displays your message as though the indicated NPC had said it.'];

// TODO: Keep track of individual socket ids in a dictionary, as players connect. Remove when they disconnect
// This way, when a message is parsed as an error or a personal message, we can emit back to the specific client that sent it

// TODO: Use the game_id field to broadcast only to the given room

io.on('connection', (socket) => { 
  console.log('Someone connected');
  console.log(socket.id);
  
  socket.on('message', msg => {  
    let s = msg.message;
    let u = msg.user_name;
    // We check to make sure message and user are both defined, and that the message isn't empty
    if(s && s !== '' && u) {
      if(msg.role === 'GM') {
        if(s.charAt(0) === '/') {
          s = s.slice(1);
          s = s.trim();
          // Parse commands
          let cmd = s.split(' ')[0];

          if(cmd) {
            if(playerCmds.indexOf(cmd) !== -1) {
              // Emit illegal command error
              io.emit('err', {
                errMsg: "You don't have access to use that command - only players may use it.",
                user_name: u
              });
            } else {
              switch(cmd) {
                case 'as':
                  let npc = s.split(' ')[1];
                  s = s.slice(npc.length + 4);
                  if(npc && s) {
                    io.emit('message', npc + ': ' + s);
                  }
                  break;

                // TODO: Implement /help

                default:
                  // Emit unknown command error
                  io.emit('err', {
                    errMsg: "Unknown command. Try /help to see a list of all available commands",
                    user_name: u
                  });
              }
            }
          } else {
            // Emit empty command error
            io.emit('err', {
              errMsg: "Unknown command. Try /help to see a list of all available commands",
              user_name: u
            });
          }
        } else {
          io.emit('message', s);
        }
      } else {
        if(s.charAt(0) === '/') {
          s = s.slice(1);
          s = s.trim();
          // Parse commands
          let cmd = s.split(' ')[0];

          if(cmd) {
            if(GMCmds.indexOf(cmd) !== -1) {
              // Emit illegal command error
              io.emit('err', {
                errMsg: "You don't have access to use that command - only GMs may use it.",
                user_name: u
              });
            } else {
              switch(cmd) {
                case 'me':
                  io.emit('message', u + ' ' + s.slice(2).trim());
                  break;

                // TODO: Implement /help
                /*
                case 'help':
                  let res = '';
                  for(let i = 0; i < globalCmdDictionary.length; i++) {

                  }
                  io.emit('personalMsg', res);
                  break;
                */

                default:
                  // Emit unknown command error
                  io.emit('err', {
                    errMsg: "Unknown command. Try /help to see a list of all available commands",
                    user_name: u
                  });
              }
            }
          } else {
            // Emit empty command error
            io.emit('err', {
              errMsg: "Unknown command. Try /help to see a list of all available commands",
              user_name: u
            });
          }
        } else if(s.charAt(0) === '*') {
          s = s.slice(1);
          s = s.trim();
          io.emit('message', u + ' ' + s);
        } else {
          io.emit('message', u + ': ' + s);
        }
      }
    }
  });  
});

http.listen(process.env.PORT || 3000);