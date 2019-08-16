const {Command} = require('discord.js-commando');
const ffmpeg = require('ffmpeg');
const ytdl = require('ytdl-core');

function Play(connection, message) {
    
    var server = servers[message.guild.id];
    server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
    server.queue.shift();
    server.dispatcher.on("end", function(){
         if(server.queue[0]){
             Play(connection,message);
         }
    });
}

class JoinChannelCommand extends Command
{
    constructor(client) 
    {
        super(client,{
            name: 'join',
            group: 'music',
            memberName: 'join',
            description: 'Joins the voice channel'
        });
    }

    async run(message, args)
    {
        if(message.member.voiceChannel)
        {
            if(!message.guild.voiceConnection)
            {
                if(!servers[message.guild.id]){
                    servers[message.guild.id] = {queue: []}
                }               

                message.member.voiceChannel.join()
                    .then(connection =>{
                        var server = servers[message.guild.id]
                        message.reply("Here we go!");
                        // server.queue.push(args);
                        // Play(connection, message);
                    })
                    .catch(console.log);
            }
        }
        else
        {
            message.reply("You must be in a voice channel to summon me!");
        }
    }   
}

module.exports = JoinChannelCommand;


