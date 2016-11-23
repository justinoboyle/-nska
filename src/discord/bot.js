import Discord from "discord.js";
import DiscordBot from "./../types/DiscordBot.js";
global.client = new Discord.Client();

client.on('ready', () => {
    console.log('General Bot Alive.');
});

client.on('message', message => {
    if (message.content.startsWith('!addbot')) {
        let args = message.content.split(' ');
        if (args.length < 2)
            return message.reply('⚠️ **Usage:** `!addbot <id>`');
        let id = args[1];
        global.companion.authorizeBot(args[1], message.author.id, false, (err, res) => {
            if (err)
                return message.reply(`❌ **Error:** ${err}`);
            message.reply("✅ **Success!** Hello, <@" + args[1] + ">!");
        });
        return;
    }

    if (message.content.startsWith('!rembot')) {
        let args = message.content.split(' ');
        if (args.length < 2)
            return message.reply('⚠️ **Usage:** `!rembot <id>`');
        let bot = args[1];
        if (bot.startsWith("<@") && bot.endsWith(">"))
            bot = bot.substring(2, bot.length - 1);
        DiscordBot.find({ botid: bot }, (err, users) => {
            if (err)
                return;
            if (users.length > 0) {
                let user = users[0];
                if (user.inviter !== message.author.id)
                    return message.reply('❌ **Error:** You are not the owner of that bot.');
                user.remove();
                try {
                    message.channel.guild.members.find(val => val.id == bot).kick()
                } catch (e) {
                    return message.reply('❌ **Error:** Could not find that bot.');
                }
                message.reply("✅ **Success!** Bot removed.");

            }
        });
    }

});

client.on('guildMemberAdd', (member) => {
    DiscordBot.find({ botid: member.id }, (err, users) => {
        if (err)
            return;
        if (users.length > 0) {
            let user = users[0];
            setTimeout(() => {
                member.addRoles([member.guild.roles.find('name', 'Bots'), member.guild.roles.find('name', user.hasPermissions ? 'Admin Bots' : 'Limited Bots')]).then(member => {

                })
            }, 1000);

        }
    });
});

client.login(global.config.botToken);