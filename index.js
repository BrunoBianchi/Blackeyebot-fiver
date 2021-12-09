const { Client, Intents, RoleManager, MessageEmbed,MessageAttachment  } = require('discord.js');
const client = new Client({ intents: ["GUILD_MEMBERS","GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES",'GUILD_PRESENCES'] });
const schedule = require('node-schedule');
const axios = require('axios').default;
var request = require('request-promise')
const prefix = `!`
var old_price = 0
var percent = 0
var numeral = require('numeral');
const { drawCard } = require('discord-welcome-card');
const Canvas = require('canvas')
Canvas.registerFont('./impact.ttf', { family: 'impact' })
const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `40px impact`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return context.font;
};
require('dotenv').config()
var fs = require('fs')
const cheerio = require('cheerio');
var url = 'https://shot.screenshotapi.net/screenshot?token=VHBGF4G-9YGMNAX-H8TWT5F-GQ7BAC4&url=https%3A%2F%2Fwww.dextools.io%2Fapp%2Fbsc%2Fpair-explorer%2F0xc6de9f298d9b8d97040d5fab310cef842302eb8f&width=652&height=510&fresh=true&output=image&file_type=png&wait_for_event=load&delay=10000&selector=%23tradingview&css=.floating-toggle-button%7B%0Adisplay%3A%20none%20!important%3B%0A%7D%0A.menu-flotante%7B%0Adisplay%3A%20none%20!important%3B%0A%7D%0A.layout__area--left%20%7B%0Adisplay%3A%20none%20!important%3B%0A%7D%0A.layout__area--top%7B%0Adisplay%3A%20none%20!important%3B%0A%7D%0A.presale-button%20%7B%0Adisplay%3A%20none%20!important%3B%0A%7D';
var coingeck_url = 'https://www.coingecko.com/en/coins/black-eye-galaxy'

// Construct the query params and URL
async function getChart() {
    return new Promise(function(resolve, reject) {
    // Call the API and save the screenshot
    request.get({url: url, encoding: 'binary'}, (err, response, body) => {
        fs.writeFile("chart.png", body, 'binary', err => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Image captured!`)
                resolve()
            }
        })
    });
    
})
}

async function getCryptoHolders() {
    return new Promise( function(resolve, reject) {
  request('https://www.bscscan.com/token/0x4f7b627b88651e3dddca0240bca68a3062632c8c',async (error,response,html)=>{
    try {
        if(!html) return;
  const $ = await cheerio.load(html)
      $('#ContentPlaceHolder1_tr_tokenHolders').each((i,data)=>{
          if($(data).text().includes(`addresses`)) {
             resolve($(data).text().split('Holders:')[1].replaceAll("\\s","").replace('addresses','').trim())
          }
      })
    }catch(err) {
        console.log(err)
    }
  })
})
}

async function getMarketCap() {
    return new Promise(async function(resolve, reject) {
       try {
        await axios.get('https://api.coingecko.com/api/v3/coins/black-eye-galaxy')
        .then(async function (response) { 
            resolve(response.data.market_data.market_cap.usd)
        })
    }catch(err) {
        if(err) return console.log(err)
    }
})
}
async function getTotallySuply() {
    return new Promise(async function(resolve, reject) {
        try {
        await axios.get('https://api.coingecko.com/api/v3/coins/black-eye-galaxy')
        .then(async function (response) { 
            
            resolve(response.data.market_data.total_supply)
        })
    }catch(err) {
        if(err) return console.log(err)
    }
})
}
async function getCirculationSuply() {
    return new Promise(async function(resolve, reject) {
        try {
        await  axios.get('https://api.coingecko.com/api/v3/coins/black-eye-galaxy')
        .then(async function (response) { 
            resolve(response.data.market_data.circulating_supply)
        })
    }catch(err) {
        if(err) return console.log(err)
    }
})
}
async function get24HoursTrading() {
    return new Promise(async function(resolve, reject) {
        await request('https://www.coingecko.com/en/coins/black-eye-galaxy',(error,response,html)=>{
      try {
        const $ = cheerio.load(html)
        $('.tailwind-reset').each((i,data)=>{
      
            if($(data).text().includes(`24 Hour Trading Vol`)) {
  
               resolve($(data).text().split(`24 Hour Trading Vol`)[1].replaceAll("\\s","").replace('addresses','').trim())
            }
        })
      }catch(err) {
          if(err) console.log(err)
      }

  })
})
}

client.on(`ready`,async ()=>{

    console.log(`logged in as ${client.user.username}`)
    await getCryptoHolders().then(data=>{
        client.user.setPresence({ activities: [{ name: `Holders = ${data}`, type: 'PLAYING' }], status: 'online' });
    })
    var guild = client.guilds.cache.get(process.env.guild)
    var channel = guild.channels.cache.get(process.env.channel)
    schedule.scheduleJob('59 * * * * *', async function(){
        await getCryptoHolders().then(data=>{
            client.user.setPresence({ activities: [{ name: `Holders = ${data}`, type: 'PLAYING' }], status: 'online' });
        })
        axios.get('https://api.coingecko.com/api/v3/coins/black-eye-galaxy')
        .then(async function (response) {
            if(old_price === 0 ) {
                guild.me.setNickname(`${response.data.symbol.toUpperCase()} = $${response.data.market_data.current_price.usd}`);

                old_price = response.data.market_data.current_price.usd
              }
              if(old_price < response.data.market_data.current_price.usd || old_price > response.data.market_data.current_price.usd ) {
                percent =  ((response.data.market_data.current_price.usd - old_price)/old_price ) * 100
                old_price = response.data.market_data.current_price.usd
            }
            if(percent >= 5) {
                channel.send(`Attention! BYG has just increased 5% to a new price of ${response.data.market_data.current_price.usd} 🚀`)
            }
            var up_role = guild.roles.cache.find(role=> role.name === 'up')
            var down_role = guild.roles.cache.find(role=> role.name === 'down')
            if(!up_role) { 
                try{
                    await guild.roles.create({   
                        name: 'up',
                        color: 'GREEN',                         
                      reason: 'we needed a role for Super Cool People',
                    }).then(async role=>{
                      up_role = await guild.roles.cache.find(role=> role.name === 'up')
                    })
                }catch(err){
                    if(err) console.log(err)
                }
            }
            if(!down_role) {
                try{
                await guild.roles.create({   
                    name: 'down',
                    color: 'RED',           
                  reason: 'we needed a role for Super Cool People',
                }).then(async role=>{
                    down_role = await guild.roles.cache.find(role=> role.name === 'down')
                })
            }catch(err) {
                if(err) console.log(err)
            }
            }
             if(percent >= 0) {
                guild.me.setNickname(`${response.data.symbol.toUpperCase()} = ⬆️ $${response.data.market_data.current_price.usd}`);
                    guild.me.roles.add(`${up_role.id}`)
                    guild.me.roles.remove(`${down_role.id}`)       
             }else{
                guild.me.setNickname(`${response.data.symbol.toUpperCase()} = ⬇️ $${response.data.market_data.current_price.usd}`);

                    guild.me.roles.add(`${down_role.id}`)
                    guild.me.roles.remove(`${up_role.id}`)             
             }
  

        })
      });
      
})


client.on(`messageCreate`,async (msg)=>{ 
    var args = msg.content.substring(prefix.length).split(" ");
    switch(args[0]) {
        case'price':
        axios.get('https://api.coingecko.com/api/v3/coins/black-eye-galaxy')
        .then(function (response) {
          msg.channel.send(`$${response.data.market_data.current_price.usd}`)
        })
        break;
        case`chart`:
        msg.channel.send(`wait,getting chart from website. **this can take some seconds!**`).then(async message=>{
            await getChart().then(file=>{
                message.edit({content:`Current chart:`,files:['./chart.png']})
            })
        })
        break;
        case'holders':
        await getCryptoHolders().then(data=>{
          msg.channel.send(`Holders = ${data}`)
        })
        break;
        case'mc':
        await getMarketCap().then(data=>{
          msg.channel.send(`Market cap = ${numeral(data).format('0,0')}`)
        })
        break;
        case'totalsupply':
        await getTotallySuply().then(data=>{
          msg.channel.send(`Total supply = ${numeral(data).format('0,0')}`)
        })
        break;
        case'cs':
        await getCirculationSuply().then(data=>{
          msg.channel.send(`Circulation supply = ${numeral(data).format('0,0')}`)
        })
        break;
        case'24tv':
        await get24HoursTrading().then(data=>{
          msg.channel.send(`24 hour trading volume = ${data}`)
        })
        break;
    }
})
client.on('guildMemberAdd',async member=>{
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('./banner.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = '40px impact';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Welcome to ${member.guild.name}!`, canvas.width / 2.5, canvas.height / 3.5);

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, 25, 25, 200, 200);
    await fs.writeFileSync('./welcome.png', canvas.toBuffer())

    var channel = member.guild.channels.cache.get(process.env.channel_welcome)
    const exampleEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Ready to join one of the best play-to-earn metaverse games?')
	.setURL('https://www.blackeyegalaxy.space/')
	.setDescription(`
    You are 1 out of ${member.guild.memberCount} players apart of the Black Eye Galaxy Discord Community!\n
    **To start your journey please follow the steps below:**
👇
**Step 1:**
Please read the rules in <#901200453231067176>\n
**Step 2:**
Feel free to introduce yourself in <#915412062388236358> and tell us how you found us!\n
**Step 3:**
Visit our game FAQ here <#909632009444421644> 📘\n
**Step 4:**
Do you know who you want to be in Black Eye Galaxy? You can pick a role here #pick-a-role\n
    `)
    .setThumbnail('https://i.imgur.com/ral4oxb.png')
	.setImage('attachment://welcome.png')
	.setFooter('The Black Eye Galaxy Team and its moderators will never DM our members! If you receive a DM from someone claiming to me a member of the team asking to help/assist you, please DO NOT CLICK ANY LINKS or PROVIDE ANY SENSITIVE AND PRIVATE INFORMATION. Sadly scammers are a significant issue across all cryptocurrency communities, please do ensure you do not fall victim, the best way to safeguard yourself is to follow our advice. Stay safe out there, fellow space travellers! ✨');

channel.send({content:`<:156kb:915403258107924530> **Welcome ${member.user.username} to the Official Black Eye Galaxy Discord Community** <:156kb:915403258107924530> ` ,embeds: [exampleEmbed],files: ['./welcome.png'] });

})
client.login(process.env.token)