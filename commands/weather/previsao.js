const Discord = require('discord.js');
const {Command} = require('discord.js-commando');
const weather = require('weather-js');


class PrevisaoCommand extends Command {
    constructor(client) 
    {
        super(client,{
            name: 'previsao',
            group: 'weather',
            memberName: 'previsao',
            description: 'Shows the forecast weather!'
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
            var forecast = result[0].forecast[2];

            const embed = new Discord.RichEmbed()
                .setDescription(`**${forecast.skytextday}**`)
                .setAuthor(`Weather tomorrow for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(0x00AE86)
                .addField('Day', forecast.day, true)
                .addField('Timezone',`UTC${location.timezone}`, true)
                .addField('Low', forecast.low, true)
                .addField('High', forecast.high, true)
                .addField('Degree Type', location.degreetype, true)
                if (current.temperature > 20){{embed.addField('Sugestão', 'Regata, bermudinha e a CHINELA estralando', true)}}
                if (current.temperature < 15){{embed.addField('Sugestão', 'Já dá pra pegar um casaco', true)}}
                


                message.channel.send({embed});
        })
    }
		
};


module.exports = PrevisaoCommand;