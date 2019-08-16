const { MessageEmbed } = require('discord.js');
const { CommandoClient } = require('discord.js-commando');
const Youtube = require('simple-youtube-api');
const { token, youtubeApiKey } = require('./config.json');
const path = require('path');
const ffmpeg = require('ffmpeg');
const ytdl = require('ytdl-core');
const youtube = new Youtube(youtubeApiKey);


const client = new CommandoClient({
    commandPrefix: '!',   
    disableEveryone: true
});

client.registry
    
    // Registers your custom command groups
    .registerGroups([
        ['music', 'Music commands'],
        ['weather', 'Weather commands']       
    ])

    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

global.servers = {};


client.on('ready', () => {
  console.log('This bot is online!');


    //token conta prefeitura "token": "NjEwNDkyNzYyMzgyNTMyODIy.XVaPZw.VumVccMHIOFUoBmIT7Df0CP1L_c",
  
    
  });
  

client.login(token);