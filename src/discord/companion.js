import Discord from "discord.js";
import DiscordBot from "./../types/DiscordBot.js";
import requestify from "requestify";
global.companion = new Discord.Client();

companion.on('ready', () => {
  console.log('Companion Bot alive.');
});

companion.on('message', message => {
  if (message.content === '!nska companion') {
    message.reply('I\'m alive!');
  }
});

companion.login(global.config.userToken);

companion.authorizeBot = (botid, owner, admin, cb) => {
  DiscordBot.find({ botid }, (err, users) => {
    if (err)
      return cb("Could not connect to database servers. Please try again later.", null);
    if (users.length > 0)
      return cb("Bot is already authorized on this server. Use `!rembot <id>` to remove the bot before re-adding it.", null);
    let newBot = new DiscordBot({
      inviter: owner,
      botid: botid,
      hasPermissions: admin
    });
    newBot.save();
    addBotRequest(botid, (error, resp) => {
      console.log("fa");
      if (error)
        return cb("Request failed. Please try again later.", false);
      if (resp)
        return cb(false, resp);
    })
  });
}

function addBotRequest(botid, cb) {
  requestify.request(`https://discordapp.com/api/v6/oauth2/authorize?client_id=${encodeURIComponent(botid)}&scope=bot&permissions=0`, {
    method: 'POST',
    body: {
      bot_guild_id: '250758716108963840',
      permissions: 0,
      authorize: true
    },
    dataType: 'json',
    headers: {
      authorization: global.config.userToken,
      "Content-Type": "application/json"
    }
  })
    .then(function (response) {
      cb(false, response.getBody());
    });
}