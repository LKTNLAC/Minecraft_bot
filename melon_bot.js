/*const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'game.minemelon.cloud', // IP server
  port: 25500,                  // Port
  username: 'cadie_bunny',      // Tên bot
  version: '1.21.4'
})

bot.once('spawn', () => {
  console.log('Bot đã vào game!')
  
  // Nếu server có login
  bot.chat('/login cadie_bunny') // Thay 'Cadie_Bunny' bằng mật khẩu nếu cần
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  if (message === 'ping') {
    bot.chat('pong')
  }
})

bot.on('error', err => console.log('Lỗi:', err.message))
bot.on('end', () => console.log('Bot bị ngắt kết nối'))
*/
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

const botcfig = {
  host: '79.127.235.185',
  port: 19013,
  username: 'melonwater',
  version: '1.21.4'
}

const bot = mineflayer.createBot(botcfig)

bot.loadPlugin(pathfinder)

let autoSleepEnabled = true
let isSleeping = false

bot.once('spawn', () => {
  console.log('Bot vào game, gửi lệnh login...')
  bot.chat('/login long123') // Thay 'cadie_bunny' bằng mật khẩu nếu cần

  const data = require('minecraft-data')(bot.version)
  const mments = new Movements(bot, data)
  bot.pathfinder.setMovements(mments)

  console.log('   Lệnh có sẵn:')
  console.log('   2melon  - TPA tới người gọi')
  console.log('   acp      - Accept TPA')
  console.log('   2sleep   - Ngủ ở giường gần nhất')
  console.log('   2autosleep on/off - Bật/tắt tự động ngủ')
})

bot.on('time', () => {
  if (!autoSleepEnabled || isSleeping) return
  
  const timeOfDay = bot.time.timeOfDay
  const isNight = timeOfDay >= 12542 && timeOfDay <= 23459
  
  if (isNight && !bot.isSleeping) {
    console.log('Trời tối rồi, em tự động tìm giường để ngủ...')
    autoSleep()
  }
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  message = message.toLowerCase().trim()
  
  if (message === 'vux') {
    bot.chat(`Ngài Vux đẹp trai nhất`)
  }
  if (message === 'an') {
    bot.chat(`An lọ vương`)
  }
  if (message === 'hieu') {
    bot.chat(`Hieu thu 2`)
  }
  if (message === 'kay') {
    bot.chat(`Kay lọ vương`)
  }

  if (message === '2melon') {
    bot.chat(`/tpa ${username}`)
  }
  if (message === 'acp') {
    bot.chat('/tpaccept')
  }
  if (message === '2sleep') {
    sleep()
  }
  if (message === '2autosleep on') {
    autoSleepEnabled = true
    bot.chat('Đã bật tự động ngủ')
    console.log('Tự động ngủ: BẬT')
  }
  if (message === '2autosleep off') {
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
      console.log('Em không tìm thấy giường gần đây')
      isSleeping = false
      return
    }
    
    const bedpos = beds[0]
    const bed = bot.blockAt(bedpos)
    
    console.log(`Em đang di chuyển tới giường tại ${bedpos.x}, ${bedpos.y}, ${bedpos.z}`)
    await bot.pathfinder.goto(
      new GoalNear(bedpos.x, bedpos.y, bedpos.z, 1)
    )
    
    await bot.sleep(bed)
    console.log('Em đã ngủ (tự động)')
    
    bot.once('wake', () => {
      console.log('Em đã thức dậy - Trời sáng rồi')
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
      console.log('em ko thấy giường')
      return
    }
    
    const bedpos = beds[0]
    const bed = bot.blockAt(bedpos)
    
    await bot.pathfinder.goto(
      new GoalNear(bedpos.x, bedpos.y, bedpos.z, 1)
    )
    
    await bot.sleep(bed)
    console.log('Em đang ngủ')
    
    setTimeout(() => {
      if (bot.isSleeping) {
        bot.wake()
        console.log('Em đã thức dậy')
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