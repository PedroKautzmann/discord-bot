const Discord = require('discord.js');
const {Command} = require('discord.js-commando');
const weather = require('weather-js');


class PrevisaoCommand extends Command {
    constructor(client) 
    {
        super(client,{
            name: 'forecastlong',
            group: 'weather',
            memberName: 'forecastlong',
            description: 'Shows the long range weather forecast'
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
            var forecast2 = result[0].forecast[3];
            var forecast3 = result[0].forecast[4];

            const embed = new Discord.RichEmbed()
                .setDescription(`**${forecast2.skytextday}**`)
                .setAuthor(`Weather ${forecast2.day} for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(0x00AE86)
                .addField('Day', forecast2.day, true)
                .addField('Date', forecast2.date, true)
                .addField('Timezone',`UTC ${location.timezone}`, true)
                .addField('Degree Type', location.degreetype, true)
                .addField('Low', forecast2.low, true)
                .addField('High', forecast2.high, true)
                if (forecast2.precip) {{embed.addField('Precipitation', forecast2.precip, true)}}
                

                
                // if (current.temperature > 20){{embed.addField('Sugestão', 'Regata, bermudinha e a CHINELA estralando')}}
                // if (current.temperature < 15){{embed.addField('Sugestão', 'Já dá pra pegar um casaco')}}
                


                message.channel.send({embed});
        })
    }
		
};


module.exports = PrevisaoCommand;