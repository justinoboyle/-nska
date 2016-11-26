import Discord from "discord.js";
import DiscordBot from "./../types/DiscordBot.js";
import UserInfo from "./../types/UserInfo.js";
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
        try {
            let usrAcc = message.channel.guild.members.find(val => val.id == id);
            if (!usrAcc.bot)
                return message.reply("❌ **Error:** Uhh.. That's a user!");
        } catch (e) { /* Good */ }

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
                if (!isAdmin(message.author.id))
                    if (user.inviter !== message.author.id)
                        return message.reply('❌ **Error:** You are not the owner of that bot.');

                try {
                    let usrAcc = message.channel.guild.members.find(val => val.id == bot);
                    let isBot = usrAcc.bot;
                    if (isBot)
                        usrAcc.kick();

                } catch (e) {
                    try {
                        user.remove();
                        message.reply("✅ **Success!** Bot removed. " + (!isBot ? "from database only." : ""));
                    } catch (e) {
                        return message.reply("✅ **Success!** Bot removed. " + (!isBot ? "from database only." : ""));
                    }
                    message.reply("✅ **Success!** Bot removed. " + (!isBot ? "from database only." : ""));
                }
            } else {
                return message.reply('❌ **Error:** Could not find that bot.');
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

client.lookup = (id, cb) => {
    UserInfo.find({ id }, (err, users) => {
        if (err) {
            console.error(err);
            return cb("Could not connect to database servers. Please try again later.", null);
        }
        let user = {}
        if (users.length > 0) {
            user = users[0];
            if ((Date.now() - user.lastLookup) < 3 * 60 * 60 * 1000)
                return cb({ id: user.id, username: user.username, discriminator: user.discriminator, avatar: user.avatar });
        }
        user = new UserInfo(client.resolver.resolveUser(id));
        user.lastLookup = Date.now();
        user.save();
        cb({ id: user.id, username: user.username, discriminator: user.discriminator, avatar: user.avatar });
    });
}
function isAdmin(id) {
    for (let x of (global.config.admins || []))
        if (x == id) return true;
    return false;
}
client.login(global.config.botToken);