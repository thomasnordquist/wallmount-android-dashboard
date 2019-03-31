const EventEmitter = require('events').EventEmitter
const MovementDetection = require('./movement-detection')

class IdlenessDetection extends EventEmitter {
  constructor(timeout, movementDetection) {
    super()
    this.timeout = timeout 
    this.fired = false
    movementDetection.on('movement', () => {
      this.restartTimer()
    })
  }

  start() {
    this.restartTimer()
  }

  restartTimer() {
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      !this.fired && this.emit('idle')
      this.fired = true
    }, this.timeout)
  }

  stop() {
    this.timer && clearTimeout(this.timer)
  }

  clear() {
    this.fired = false
    this.restartTimer()
  }
}


class Lockscreen {
  constructor(idlenessDetection) {
    this.idlenessDetection = idlenessDetection
    this.locked = false
  }

  lock() {
    this.locked = true
    const overlay = document.getElementById('black_overlay')
    overlay.style.display = 'block'
    document.onclick = () => {
      this.unlock()
    }
    overlay.onclick = () => {
      this.unlock()
    }
    this.setScreenBrightness(0)
  }
  
  unlock() {
    this.locked = false
    const overlay = document.getElementById('black_overlay')
    overlay.style.display = 'none'
    this.setScreenBrightness(200)
    this.idlenessDetection.clear()
  }
  
  setScreenBrightness(brightness) {
    const pwm_device = '/sys/devices/platform/leds-mt65xx/leds/lcd-backlight/brightness'
    window.ShellExec.exec(['su', '-c', `echo ${brightness} > ${pwm_device}`], function(res){
      console.log('exit status: ' + res.exitStatus)
    })
  }
}

class Screensaver {
  constructor() {
    this.movementDetection = new MovementDetection(false)
    this.idlenessDetection = new IdlenessDetection(15 * 1000, this.movementDetection)
    this.lockscreen = new Lockscreen(this.idlenessDetection)
    this.idlenessDetection.on('idle', () => this.lockscreen.lock())
    this.movementDetection.on('movement', () => {
      if (this.lockscreen.locked) {
        this.lockscreen.unlock()
      }
    })
  }

  setDebug(debugEnabled) {
    this.movementDetection.debug = debugEnabled
  }

  enable() {
    this.idlenessDetection.start()
    this.idlenessDetection.restartTimer()
  }

  disable() {
    this.idlenessDetection.stop()
    this.idlenessDetection.clear()
    this.lockscreen.unlock()
  }
}

module.exports = Screensaver
