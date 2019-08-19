const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
//const { token, youtubeApiKey } = require('./config.json');
const ffmpeg = require('ffmpeg');
const ytdl = require('ytdl-core');
const youtube = new Youtube('AIzaSyBE0lfss2KhVI_3NdL99pFpREkM-NMS_VU');



var queue = [];
var isPlaying;

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['play-song', 'add'],
      memberName: 'play',
      group: 'music',
      description: 'Play any song or playlist from youtube',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt: 'What song or playlist would you like to listen to?',
          type: 'string',
          validate: query => query.length > 0 && query.length < 200
        }
      ]
    });
  }

  async run(message, { query }) {
    // initial checking
    var voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.say('Join a channel and try again');
    // end initial check

    // This if statement checks if the user entered a youtube playlist url
    if (
      query.match(
        /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
      )
    ) {
      try {
        const playlist = await youtube.getPlaylist(query);
        const videosObj = await playlist.getVideos(10); // remove the 10 if you removed the queue limit conditions below
        //const videos = Object.entries(videosObj);
        for (let i = 0; i < videosObj.length; i++) {
          const video = await videosObj[i].fetch();

          const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
          const title = video.raw.snippet.title;
          const duration = `${
            video.duration.hours ? video.duration.hours + ':' : ''
          }${video.duration.minutes ? video.duration.minutes : '00'}:${
            video.duration.seconds ? video.duration.seconds : '00'
          }`;
          const song = {
            url,
            title,
            duration,
            voiceChannel
          };
          if (queue.length < 10) {
            // can be removed
            queue.push(song);
          } else {
            // this can be removed if you choose not to limit the queue
            return message.say(
              `I can't play the full playlist because there will be more than 10 songs in queue`
            );
          }
        }
        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          return playSong(queue, message);
        } else if (isPlaying == true) {
          return message.say(
            `Playlist - :musical_note:  ${playlist.title} :musical_note: has been added to queue`
          );
        }
      } catch (err) {
        console.error(err);
        return message.say('Playlist is either private or it does not exist');
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      const url = query;
      try {
        query = query
          .replace(/(>|<)/gi, '')
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        const id = query[2].split(/[^0-9a-z_\-]/i)[0];
        const video = await youtube.getVideoByID(id);
        if (video.raw.snippet.liveBroadcastContent === 'live')
          // can be removed
          return message.say("I don't support live streams!");
        if (video.duration.hours !== 0)
          // can be removed
          return message.say('I cannot play videos longer than 1 hour');
        const title = video.title;
        const duration = `${
          video.duration.hours ? video.duration.hours + ':' : ''
        }${video.duration.minutes ? video.duration.minutes : '00'}:${
          video.duration.seconds ? video.duration.seconds : '00'
        }`;
        const song = {
          url,
          title,
          duration,
          voiceChannel
        };
        if (queue.length > 10) {
          // can be removed
          return message.say(
            'There are too many songs in the queue already, skip or wait a bit'
          );
        }
        queue.push(song);
        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          return playSong(queue, message);
        } else if (isPlaying == true) {
          return message.say(`${song.title} added to queue`);
        }
      } catch (err) {
        console.error(err);
        return message.say('Something went wrong, please try later');
      }
    }
    try {
      const videos = await youtube.searchVideos(query, 5);
      const vidNameArr = [];
      for (let i = 0; i < videos.length; i++) {
        vidNameArr.push(`${i + 1}: ${videos[i].title}`);
      }
      vidNameArr.push('exit');
      const embed = new Discord.RichEmbed()
        .setColor('#e9f931')
        .setTitle('Choose a song by commenting a number between 1 and 5')
        .addField('Song 1', vidNameArr[0])
        .addField('Song 2', vidNameArr[1])
        .addField('Song 3', vidNameArr[2])
        .addField('Song 4', vidNameArr[3])
        .addField('Song 5', vidNameArr[4])
        .addField('Exit', 'exit');
      var songEmbed = await message.say({ embed });
      try {
        var response = await message.channel.awaitMessages(
          msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit',
          {
            max: 1,
            maxProcessed: 1,
            time: 60000,
            errors: ['time']
          }
        );
        var videoIndex = parseInt(response.first().content);
      } catch (err) {
        console.error(err);
        songEmbed.delete();
        return message.say(
          'Please try again and enter a number between 1 and 5 or exit'
        );
      }
      if (response.first().content === 'exit') return songEmbed.delete();
      try {
        var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        if (video.raw.snippet.liveBroadcastContent === 'live')
          // can be removed
          return message.say("I don't support live streams!");
        if (video.duration.hours !== 0)
          // can be removed
          return message.say('I cannot play videos longer than 1 hour');
      } catch (err) {
        console.error(err);
        songEmbed.delete();
        return message.say(
          'An error has occured when trying to get the video ID from youtube'
        );
      }
      const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
      const title = video.title;
      const duration = `${
        video.duration.hours ? video.duration.hours + ':' : ''
      }${video.duration.minutes ? video.duration.minutes : '00'}:${
        video.duration.seconds ? video.duration.seconds : '00'
      }`;

      try {
        let song = {
          url,
          title,
          duration,
          voiceChannel
        };
        if (queue.length > 10) {
          // can be removed
          return message.say(
            'There are too many songs in the queue already, skip or wait a bit'
          );
        }
        queue.push(song);
        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          songEmbed.delete();
          playSong(queue, message);
        } else if (isPlaying == true) {
          songEmbed.delete();
          return message.say(`${song.title} added to queue`);
        }
      } catch (err) {
        console.error(err);
        songEmbed.delete();
        return message.say('queue process gone wrong');
      }
    } catch (err) {
      console.error(err);
      if (songEmbed) {
        songEmbed.delete();
      }
      return message.say(
        'Something went wrong with searching the video you requested :('
      );
    }
  }
};

function playSong(queue, message) {
  let voiceChannel;
  queue[0].voiceChannel
    .join()
    .then(connection => {
      const dispatcher = connection
        .playStream(
          ytdl(queue[0].url, {
            volume: 0.5,
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 10
          })
        )
        .on('start', () => {
          module.exports.dispatcher = dispatcher;
          module.exports.queue = queue;
          voiceChannel = queue[0].voiceChannel;
          message.say(
            `:musical_note: Now playing: ${queue[0].title} (${queue[0].duration}) :musical_note:`
          );
          return queue.shift();
        })
        .on('finish', () => {
          if (queue.length >= 1) {
            return playSong(queue, message);
          } else {
            isPlaying = false;
            return voiceChannel.leave();
          }
        })
        .on('error', e => {
          message.say('Cannot play song');
          console.error(e);
          return voiceChannel.leave();
        });
    })
    .catch(e => {
      console.error(e);
      return voiceChannel.leave();
    });
}

// var queue = []; //this array stores the songs in queue
// var isPlaying;

// module.exports =class PlayMusicCommand extends Command {
//   constructor(client) {
//     super(client, {
//       name: "play",
//       aliases: ["play-song", "add"],
//       group: "music",
//       memberName: "play",
//       description: "Plays music in the voice channel!",
//       guildOnly: true,
//       //clientPermissions: ["SPEAK", "CONNECT"],
//       throttling: {
//         usages: 2,
//         duration: 5
//       },
//       args: [
//         {
//           key: "query",
//           prompt: "What song would you like to listen to?",
//           type: "string",
//           validate: query => query.length > 0 && query.length < 200
//         }
//       ]
//     });
//   }

//   async run(message, { query }) {
//     var voiceChannel = message.member.voiceChannel;

//     if (!voiceChannel) return message.say("You must be in a voice channel!");

//     if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
//       const url = query;

//       try {
//         // using try catch because there are many api calls and as a result -async await usage
//         /*
//                 the 'replace' and 'split' methods create an array that looks
//                 like this: [ 'https://www.youtube.com/watch?', 'v=', 'dQw4w9WgXcQ' ]
//                 then we declare an 'id' variable and assign it to the 3rd element
//                 */
//         query = query
//           .replace(/(>|<)/gi, "")
//           .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
//         const id = query[2].split(/[^0-9a-z_\-]/i)[0];
//         const video = await youtube.getVideoByID(id); // getting a video object by calling
//         // the getVideoByID provided to us by simple-youtube-api
//         /*
//                 I didn't test live streams yet to determine if the bot is capable of
//                 playing them, also you can remove the second if statement if you want,
//                 I chose to keep it for now.
//                 */
//         if (video.raw.snippet.liveBroadcastContent === "live")
//           return message.say("I don't support live streams!");
//         if (video.duration.hours !== 0)
//           return message.say("I cannot play videos longer than 1 hour");
//         /* 
//                 construct the song object, it has url, title and voiceChannel 
//                 object that contains methods which are critical to us later on(join, 
//                 dispatcher etc..)
//                 */
//         const title = video.title;
//         const song = {
//           url,
//           title,
//           voiceChannel
//         };
//         // this if statement limits the queue size, can be removed if you wish
//         if (queue.length > 6) {
//           return message.say(
//             "There are too many songs in the queue already, skip or wait a bit"
//           );
//         }
//         queue.push(song); // push the song object to queue
//         /*
//                 If there is no song playing, call the playSong method(we will see it 
//                 later on :)
//                 else if there is a song playing, return a msg that says the song was 
//                 added to queue
//                 */
//         if (isPlaying == false || typeof isPlaying == "undefined") {
//           isPlaying = true;
//           return playSong(queue, message);
//         } else if (isPlaying == true) {
//           return message.say(`${song.title} added to queue`);
//         }
//         // catches errors from getVideoByID method
//       } catch (err) {
//         console.error(err);
//         return message.say("Something went wrong, please try later");
//       }



//       try {
//         /*
//         call 'searchVideos' method to get a list of 5 video objects that match the
//         query. Then create an array of the 5 videos numbered from 1 to 5 with their
//         titles.
//         */
//         const videos = await youtube.searchVideos(query, 5);
//         const vidNameArr = [];
//         for (let i = 0; i < videos.length; i++) {
//           vidNameArr.push(`${i + 1}: ${videos[i].title}`);
//         }
//         vidNameArr.push('exit');
//         /* construct a message embed that will be displayed to the chat, it 
//         contains the song titles fetched using 'searchVideos'.
//         */
//            const embed = new MessageEmbed()
//           .setColor('#e9f931')
//           .setTitle('Choose a song by commenting a number between 1 and 5')
//           .addField('Song 1', vidNameArr[0])
//           .addField('Song 2', vidNameArr[1])
//           .addField('Song 3', vidNameArr[2])
//           .addField('Song 4', vidNameArr[3])
//           .addField('Song 5', vidNameArr[4])
//           .addField('Exit', 'exit');
//         var songEmbed = await message.say({ embed });
//         try {
//           /* 
//           assign 'response' variable whatever the user types. The correct
//           responses are numbers between 1-5 or 'exit'. There is also a time limit 
//           of 1 minute to respond.
//           */
//             var response = await message.channel.awaitMessages(
//             msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit',
//             {
//               max: 1,
//               maxProcessed: 1,
//               time: 60000,
//               errors: ['time']
//             }
//           );
//         } catch (err) { // catch errors from 'awaitMessages' and respond correctly
//           console.error(err);
//           songEmbed.delete()
//           return message.say(
//             'Please try again and enter a number between 1 and 5 or exit'
//           );
//         }
//         if (response.first().content === 'exit') return songEmbed.delete();
//         // assign videoIndex to the song number the user enters
//         const videoIndex = parseInt(response.first().content);
//         try {
//           // fetch the video object using 'getVideoByID'
//           var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
//           if (video.raw.snippet.liveBroadcastContent === 'live')
//             return message.say("I don't support live streams!");
//         } catch (err) { // catch errors from 'getVideoByID'
//           console.error(err);
//           songEmbed.delete()
//           return message.say(
//             'An error has occured when trying to get the video ID from youtube'
//           );
//         }
//         const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
//         const title = video.title;
  
//         try {
//           let song = { // construct the song object
//             url,
//             title,
//             voiceChannel
//           };
//           if (queue.length > 6) {
//             return message.say(
//               'There are too many songs in the queue already, skip or wait a bit'
//             );
//           }
//           queue.push(song); // push the song object to queue
//           if (isPlaying == false || typeof isPlaying == 'undefined') {
//             isPlaying = true;
//             songEmbed.delete(); // delete the song list embed(so it wont spam chat)
//             playSong(queue, message); // play the song
//           } else if (isPlaying == true) {
//             songEmbed.delete();
//             return message.say(`${song.title} added to queue`);
//           }
//         } catch (err) {
//           console.error(err);
//           songEmbed.delete();
//           return message.say('queue process gone wrong');
//         }
//       } catch (err) { // catch errors from playSong()
//         console.error(err);
//         if (songEmbed) { // if the songEmbed wasn't deleted because of an error related to playSong() - delete it
//           songEmbed.delete();
//         }
//         return message.say(
//           'Something went wrong with searching the video you requested :('
//         );
//       }
//     }
//   }
// };

// function playSong(queue, message) {
//     let voiceChannel;
//     queue[0].voiceChannel
//       .join() // join the voice channel the user is in
//       .then(connection => {
//         const dispatcher = connection // sends voice packet data to the voice connection
//           .playStream(
//             ytdl(queue[0].url, { // provide ytdl library with the song url
//               volume: 10, 
//               quality: 'highestaudio', // highest audio quality
//               highWaterMark: 1024 * 1024 * 10 // this line downloads part of the song before starting, it reduces stuttering
//             })
//           )
//           .on('start', () => { // event emitted when the song starts
//             /*
//             export dispatcher and queue to other music commands, check out my bot 
//             repo on github to learn more
//             */
//             module.exports.dispatcher = dispatcher; 
//             module.exports.queue = queue; 
//             voiceChannel = queue[0].voiceChannel; // assign voiceChannel to the current one, incase the user moved channels in between songs
//             return message.say(
//               `:musical_note: Now playing: ${queue[0].title} :musical_note:`
//             );
//           })
//           .on('finish', () => { // event emitted when the song ends
//             queue.shift(); // remove the song from queue
//             if (queue.length >= 1) { // if the queue has more songs, continue playing
//               return playSong(queue, message);
//             } else { // else if the queue is empty, assign isPlaying to false and leave the channel
//               isPlaying = false;
//               return voiceChannel.leave();
//             }
//           })
//           .on('error', e => { // event emitted if an error occures
//             message.say('Cannot play song');
//             return console.log(e);
//           });
//       })
//       .catch(err => { // catches dispatcher errors
//         return console.log(err);
//       });
//   }


// //module.exports = PlayMusicCommand;


