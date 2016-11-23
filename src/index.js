import { MongoClient } from "mongodb";
import fs from "fs-extra";
import mongoose from "mongoose";

// This file is purposefully strange: it's the entry point for the app so we are basically just setting up our databasing and starting the other app components

global.production = process.env.ENV && process.env.ENV == "production";
global.listenPort = process.env.PORT || 3000;

let configSuccess = false;
// Config setup
try {
    fs.accessSync(__dirname + "/../config.json", fs.F_OK);
    global.config = require(__dirname + '/../config.json');
    configSuccess = true;
} catch (e) {
    fs.copy(__dirname + '/../config.example.json', __dirname + '/../config.json', (err) => {
        if (err) console.error(err);
        else console.error("\n\nConfiguration file is not present, so the default configuration has been copied to config.json. Please setup the configuration before launching the server.\n\n");
        process.exit(1);
    });
}

while (global.config.host.includes('$port'))
    global.config.host = global.config.host.replace('$port', global.listenPort);

// Mongo Setup
if (configSuccess) {
    mongoose.connect(config.mongoURL, { config: { autoIndex: !global.production } });
    global.mongoose = mongoose;
    global.web = require('./web/server.js');
    require('./discord/bot.js');
    require('./discord/companion.js');
}