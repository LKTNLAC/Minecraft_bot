const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

const botcfig = {
  host: 'game.minemelon.cloud',
  port: 25500,
  username: 'huhuhihi_bot'
}

const bot = mineflayer.createBot(botcfig)

bot.loadPlugin(pathfinder)

let autoSleepEnabled = true
let isSleeping = false

bot.once('spawn', () => {
  console.log('Bot vào game, gửi lệnh login...')
  bot.chat('/login huhuhihi')

  const data = require('minecraft-data')(bot.version)
  const mments = new Movements(bot, data)
  bot.pathfinder.setMovements(mments)

  console.log('   Lệnh có sẵn:')
  console.log('   ?tphuhuhihi  - TPA tới người gọi')
  console.log('   acp      - Accept TPA')
  console.log('   ?sleep   - Ngủ ở giường gần nhất')
  console.log('   ?autosleep on/off - Bật/tắt tự động ngủ')
})

bot.on('time', () => {
  if (!autoSleepEnabled || isSleeping) return
  
  const timeOfDay = bot.time.timeOfDay
  const isNight = timeOfDay >= 12542 && timeOfDay <= 23459
  
  if (isNight && !bot.isSleeping) {
    console.log('Trời tối rồi, tự động tìm giường để ngủ...')
    autoSleep()
  }
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  message = message.toLowerCase().trim()
  
  if (message === '?tphuhuhihi') {
    bot.chat(`/tpa ${username}`)
  }
  if (message === 'acp') {
    bot.chat('/tpaccept')
  }
  if (message === '?sleep') {
    sleep()
  }
  if (message === '?autosleep on') {
    autoSleepEnabled = true
    bot.chat('Đã bật tự động ngủ')
    console.log('Tự động ngủ: BẬT')
  }
  if (message === '?autosleep off') {
    autoSleepEnabled = false
    bot.chat('Đã tắt tự động ngủ')
    console.log('Tự động ngủ: TẮT')
  }
})

async function autoSleep() {
  if (isSleeping) return
  isSleeping = true
  
  try {
    const beds = bot.findBlocks({
      matching: block => block.name?.includes('bed'),
      maxDistance: 20,
      count: 1
    })
    
    if (beds.length === 0) {
      console.log('Không tìm thấy giường gần đây')
      isSleeping = false
      return
    }
    
    const bedpos = beds[0]
    const bed = bot.blockAt(bedpos)
    
    console.log(`Đang di chuyển tới giường tại ${bedpos.x}, ${bedpos.y}, ${bedpos.z}`)
    await bot.pathfinder.goto(
      new GoalNear(bedpos.x, bedpos.y, bedpos.z, 1)
    )
    
    await bot.sleep(bed)
    console.log('Bot đã ngủ (tự động)')
    
    bot.once('wake', () => {
      console.log('Bot đã thức dậy - Trời sáng rồi')
      isSleeping = false
    })
    
  } catch (err) {
    console.log('Lỗi khi tự động ngủ:', err.message)
    isSleeping = false
  }
}

async function sleep() {
  try {
    const beds = bot.findBlocks({
      matching: block => block.name?.includes('bed'),
      maxDistance: 10,
      count: 1
    })
    
    if (beds.length === 0) {
      console.log('đéo thấy giường')
      return
    }
    
    const bedpos = beds[0]
    const bed = bot.blockAt(bedpos)
    
    await bot.pathfinder.goto(
      new GoalNear(bedpos.x, bedpos.y, bedpos.z, 1)
    )
    
    await bot.sleep(bed)
    console.log('bố đang ngủ')
    
    setTimeout(() => {
      if (bot.isSleeping) {
        bot.wake()
        console.log('Bot đã thức dậy')
      }
    }, 10000)
  } catch (err) {
    console.log('Lỗi khi ngủ:', err.message)
  }
}

bot.on('end', reason => {
  console.log('Mất kết nối:', reason)
  setTimeout(() => process.exit(1), 5000)
})

bot.on('error', err => {
  console.log('Lỗi:', err.message)
})