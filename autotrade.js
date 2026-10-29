const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '79.127.235.185',
  port: 19013,
  username: 'melonwater',
  version: '1.21.4'
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

bot.once('spawn', () => {
  console.log('Bot đã vào server')
  setInterval(autoTrade, 8000) // loop mỗi 8s
})

async function autoTrade() {
  try {
    const villager = bot.nearestEntity(e => e.type === 'mob' && e.name.includes('villager'))
    if (!villager) {
      console.log('Không thấy villager')
      return
    }

    const villagerObj = await bot.openVillager(villager)

    for (let trade of villagerObj.trades) {
      if (trade.inputItem1 && trade.inputItem1.name.includes('melon')) {
        for (let i = 0; i < 3; i++) { // trade vài lần tránh spam
          try {
            await villagerObj.trade(trade, 1)
            await sleep(300 + Math.random() * 300) // delay random
          } catch (e) {
            break // hết trade
          }
        }
      }
    }

  } catch (err) {
    console.log('Lỗi:', err.message)
  }
}