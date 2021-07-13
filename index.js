const Discord = require("discord.js"); /* Include Discord */
const Client = new Discord.Client(); /* Create our instance of Discord */

const fs = require("fs"); /* File System!! */
const enmap = require("enmap"); /* Include enmap - used for databases */

Client.Commands = new Discord.Collection(); /* Commands Map */
Client.Servers = new enmap({name: "Servers"}); /* Users Database - Store within class (Discord instance) so it can be passed around our command handler */

Client.DefaultSettings = {
    prefix: "."
};

Client.on("ready", () => { /* Token was valid */
    console.log(`Logged in as ${Client.user.tag}`); /* Print to console who we are */

    fs.readdir("./Commands/", (err, files) => { /* Read from current dir for path "Comamnds" */
        if(err) throw err; /* normally catch but this is a problem as it's our bots core function.. commands... */
        files.forEach(f => { /* Loop through our files */
            if(!f.endsWith(".js")) return; /* File isn't a JS file, ignore and move on */
            let prop = require(`./Commands/${f}`); /* Include file */
            let cmd = f.split(".")[0]; /* Remove extension */
            Client.Commands.set(cmd, prop); /* Set as command */
            console.log(`Loaded Command: ${cmd}`); /* Tell we've loaded the current command */
        });
    });
});

Client.on("message", (message) => { /* Message was sent/receieved */
    var serverData = Client.Servers.ensure(message.guild.id, Client.DefaultSettings); /* Set data as default if non existent */
    if(message.content.toLowerCase().startsWith(serverData.prefix)){ /* Message contains prefix for current Server config?? */
        if(message.author == Client.user) /* Skip us, WE RESPOND */
            return;
        let msg = message.content.slice(serverData.prefix.length);
        if(msg.length == 0)
            return;
            
        let args = msg.split(" "); /* Split sentence into words */
        let cmd = Client.Commands.get(args[0].toLowerCase()); /* Search for command, ignore case */
        if(cmd){ /* Command found */
            cmd.run(Client, message); /* Run Command */
        } else return message.channel.send("Unable to find the specified Command!");
    }
});

Client.on("guildCreate", (guild) => { /* Joined new Discord Serer */
    var serverData = Client.Servers.ensure(guild.id, Client.DefaultSettings); /* Set data as default if non existent */
    
    let found = null;
    let member = guild.member(Client.user); /* Our member object */
    
    if(!member)
        return;

    guild.channels.cache.array().forEach(c => { /* Loop through these sexy channels */
        if(!found) { /* Don't replace already found during check */
            if(!(c.type == "text"))
                return console.log(":/");
            if(c.permissionsFor(member).has(["SEND_MESSAGES", "EMBED_LINKS"])) found = c; /* Found what we are looking for */
        }
    });

    if(found){
        found.send({embed: { /* Discord Embed */
            color: 3447003, /* Blue */
            title: "Greetings fellow users", /* Title */
            description: `My prefix is ${serverData.prefix}` /* Print prefix */
        }});
    }
});

Client.login(""); /* Token used to authorize */
