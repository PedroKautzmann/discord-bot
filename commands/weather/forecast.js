const Discord = require('discord.js');
const {Command} = require('discord.js-commando');
const weather = require('weather-js');


class ForecastCommand extends Command {
    constructor(client) 
    {
        super(client,{
            name: 'forecast',
            group: 'weather',
            memberName: 'forecast',
            description: 'Shows the weather forecast'
        });
    }
	async run (message, args) {
        weather.find({search: args, degreeType: 'C'}, function(err, result) {
            if (err) message.channel.send(err);

            if (result === undefined || result.length === 0) {
                message.channel.send('Please enter a valid location')
                return;
            }

            var current = result[0].current;
            var location = result[0].location;
            var forecast1 = result[0].forecast[2];
            var forecast2 = result[0].forecast[3];
            var forecast3 = result[0].forecast[4];

            const embed = new Discord.RichEmbed()
                .setDescription(`**${forecast1.skytextday}**`)
                .setAuthor(`Weather tomorrow for ${current.observationpoint}`)
                .setColor(0x00AE86)
                .addField('Day', forecast1.day, true)
                .addField('Date', forecast1.date, true)
                .addField('Timezone',`UTC ${location.timezone}`, true)
                .addField('Degree Type', location.degreetype, true)
                .addField('Low', forecast1.low, true)
                .addField('High', forecast1.high, true)
                if (forecast1.precip) {{embed.addField('Precipitation', forecast1.precip, true)}}


            const embed2 = new Discord.RichEmbed()
                .setDescription(`**${forecast2.skytextday}**`)
                .setAuthor(`Weather ${forecast2.day} for ${current.observationpoint}`)
                .setColor(0x00AE86)
                .addField('Day', forecast2.day, true)
                .addField('Date', forecast2.date, true)
                .addField('Timezone',`UTC ${location.timezone}`, true)
                .addField('Degree Type', location.degreetype, true)
                .addField('Low', forecast2.low, true)
                .addField('High', forecast2.high, true)
                if (forecast2.precip) {{embed2.addField('Precipitation', forecast2.precip, true)}}


            const embed3 = new Discord.RichEmbed()
                .setDescription(`**${forecast3.skytextday}**`)
                .setAuthor(`Weather ${forecast3.day} for ${current.observationpoint}`)
                .setColor(0x00AE86)
                .addField('Day', forecast3.day, true)
                .addField('Date', forecast3.date, true)
                .addField('Timezone',`UTC ${location.timezone}`, true)
                .addField('Degree Type', location.degreetype, true)
                .addField('Low', forecast3.low, true)
                .addField('High', forecast3.high, true)
                if (forecast3.precip) {{embed3.addField('Precipitation', forecast3.precip, true)}}
                
                


                message.channel.send({embed})
                .then(
                    message.channel.send(embed2)
                ).then(
                    message.channel.send(embed3)
                )
                
        })
    }
		
};


module.exports = ForecastCommand;