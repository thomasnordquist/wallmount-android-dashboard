const Screensaver = require('./screensaver')
const RemoteAdb = require('./remote-adb')

let screensaver
var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    document.addEventListener('pause', () => screensaver.disable(), false);
    document.addEventListener('resume', () => screensaver.enable(), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    screensaver = new Screensaver()
    const remoteAdb = new RemoteAdb()
    screensaver.enable()

    document.getElementById('debugButton').addEventListener('touchend', () => this.toggleDebug(remoteAdb))
    document.getElementById('debugButton').addEventListener('click', () => this.toggleDebug(remoteAdb))
  },

  debugEnabled: false,

  toggleDebug: (remoteAdb) => {
      this.debugEnabled = !this.debugEnabled
      screensaver.setDebug(this.debugEnabled)
      remoteAdb.setEnabled(this.debugEnabled)
      networkinterface.getWiFiIPAddress(function (data, error) { 
        if (error) {
          console.error(error)
          return
        }
        document.getElementById('ipAddress').innerText = `Adb: ${data.ip}:5555`
      });
      document.getElementById('debugOverlay').style.display = this.debugEnabled ? 'block' : 'none'
  }
};



app.initialize();
