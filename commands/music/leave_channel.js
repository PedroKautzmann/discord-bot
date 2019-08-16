const {Command} = require('discord.js-commando');

class LeaveChannelCommand extends Command
{
    constructor(client) 
    {
        super(client,{
            name: 'leave',
            group: 'music',
            memberName: 'leave',
            description: 'Leaves the voice channel'
        });
    }

    async run(message, args)
    {
        if (!message.guild) return;

        if (message.guild.voiceConnection) {
            
            message.guild.voiceConnection.disconnect();
        }
        else {
            
            message.reply("I must be in a voice channel to be banished!");
        }
    }
        
}

module.exports = LeaveChannelCommand;
