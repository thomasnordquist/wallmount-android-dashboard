class RemoteAdb {
  setEnabled(enabled) {
    enabled ? this.enable() : this.disable()
  }

  async enable() {
    await this.setAdbPort(5555)
    await this.restartAdb()
  }

  async disable() {
    await this.setAdbPort(-1)
    await this.restartAdb()
  }

  async setAdbPort(port) {
    await this.execute(["su", " -c", `setprop service.adb.tcp.port ${port}`])

  }

  async restartAdb() {
    await this.execute(["su", " -c", "stop adbd"])
    await this.execute(["su", " -c", "start adbd"])
  }

  async execute(cmd) {
    return new Promise(resolve => {
      window.ShellExec.exec(cmd, function(res){
        resolve(res.exitStatus)
      })
    })
  }
}

module.exports = RemoteAdb