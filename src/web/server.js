import express from 'express';
const app = express();
import map from 'async/map';
import DiscordBot from './../types/DiscordBot.js';

const protoRoot = __dirname + "./../../proto/";
app.set('view engine', 'ejs');
try {
    app.get('/', (req, res) => res.render(protoRoot + 'index.ejs'));

    app.get('/bot/:reqid', (req, res) => {
        DiscordBot.find({ botid: req.params.reqid }, (err, users) => {
            if (err)
                return res.send("error lol");
            map(users, (iter, cb) => {
                global.client.lookup(iter.botid, bot =>
                    global.client.lookup(iter.inviter, owner => {
                        if (!bot.avatar) bot.avatar = 'undefined';
                        if (!owner.avatar) owner.avatar = 'undefined';
                        cb(false, { id: iter.botid, bot, owner })
                    }
                ));
            },
                (err, bots) => {
                    let temp = bots.map((el) => {
                        return {
                            id: el.id,
                            owner: {
                                id: typeof (el.owner.id !== 'undefined') ? el.owner.id : 'a',
                                username: typeof (el.owner.username !== 'undefined') ? el.owner.username : 'b',
                                discriminator: typeof (el.owner.discriminator !== 'undefined') ? el.owner.discriminator : 'c',
                                avatar: typeof (el.owner.avatar !== 'undefined') ? el.owner.avatar : 'none'
                            },
                            bot: {
                                id: typeof (el.bot.id !== 'undefined') ? el.bot.id : el.id,
                                username: typeof (el.bot.username !== 'undefined') ? el.bot.username : 'b',
                                discriminator: typeof (el.bot.discriminator !== 'undefined') ? el.bot.discriminator : 'c',
                                avatar: typeof (el.bot.avatar !== 'undefined') ? el.bot.avatar : 'none'
                            }
                        }
                    })
                    res.render(protoRoot + 'botProfile.ejs', { bot: temp[0] });
                });
        });
    })

    app.get('/bots', (req, res) => {
        DiscordBot.find({}, (err, users) => {
            if (err)
                return res.send("error lol");
            map(users, (iter, cb) => {
                global.client.lookup(iter.botid, bot =>
                    global.client.lookup(iter.inviter, owner => {
                        if (!bot.avatar) bot.avatar = 'undefined';
                        if (!owner.avatar) owner.avatar = 'undefined';
                        cb(false, { id: iter.botid, bot, owner })
                    }


                    ));
            },
                (err, bots) => {
                    let temp = bots.map((el) => {
                        return {
                            id: el.id,
                            owner: {
                                id: typeof (el.owner.id !== 'undefined') ? el.owner.id : 'a',
                                username: typeof (el.owner.username !== 'undefined') ? el.owner.username : 'b',
                                discriminator: typeof (el.owner.discriminator !== 'undefined') ? el.owner.discriminator : 'c',
                                avatar: typeof (el.owner.avatar !== 'undefined') ? el.owner.avatar : 'none'
                            },
                            bot: {
                                id: typeof (el.bot.id !== 'undefined') ? el.bot.id : el.id,
                                username: typeof (el.bot.username !== 'undefined') ? el.bot.username : el.id,
                                discriminator: typeof (el.bot.discriminator !== 'undefined') ? el.bot.discriminator : 'c',
                                avatar: typeof (el.bot.avatar !== 'undefined') ? el.bot.avatar : 'none'
                            }
                        }
                    })
                    res.render(protoRoot + 'botList.ejs', { bots: temp });
                });
        });
    });

    app.get('/api/resolve/:user', (req, res) => global.client.lookup(req.params.user, resp => res.json(resp)));
    app.get('/api/image/:user', (req, res) => {
        if (req.params.user == 'undefined' || req.params.user == 'none')
            return res.redirect('https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png');
        global.client.lookup(req.params.user, resp => res.redirect(`https://cdn.discordapp.com/avatars/${resp.id}/${resp.avatar}`))
    });
} catch (e) {
    console.log(e);
}

app.listen(global.listenPort, () => console.log(`Listening on port ${global.listenPort}`));