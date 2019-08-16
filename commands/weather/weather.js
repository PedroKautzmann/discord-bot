const Discord = require('discord.js');
const {Command} = require('discord.js-commando');
const weather = require('weather-js');


class WeatherCommand extends Command {
    constructor(client) 
    {
        super(client,{
            name: 'weather',
            group: 'weather',
            memberName: 'leave',
            description: 'Shows the weather!'
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
            var forecast = result[0].forecast;

            const embed = new Discord.RichEmbed()
                .setDescription(`**${current.skytext}**`)
                .setAuthor(`Weather for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(0x00AE86)
                .addField('Day', current.day, true)
                .addField('Timezone',`UTC${location.timezone}`, true)
                .addField('Degree Type', location.degreetype, true)
                .addField('Temperature', `${current.temperature} Degrees`, true)
                .addField('Feels like', `${current.feelslike} Degrees`, true)
                .addField('Winds', current.winddisplay, true)
                .addField('Humidity', `${current.humidity}%`, true)
                //.addField('Previsão', forecast.day, true)
                if (current.temperature > 20){{embed.addField('Sugestão', 'Regata, bermudinha e a CHINELA estralando', true)}}
                if (current.temperature < 15){{embed.addField('Sugestão', 'Já dá pra pegar um casaco', true)}}
                


                message.channel.send({embed});
        })
	}


}
	

module.exports = WeatherCommand;