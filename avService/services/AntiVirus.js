const NodeClam = require('clamscan')

class AntiVirus {
  constructor() {
    this.nodeClam = new NodeClam()
    this.clamScan = null
  }

  async init() {
    this.clamScan = await this.nodeClam.init({
      debug_mode: true,
      scan_recursively: false,
      clamdscan: {
        socket: false,
        host: false,
        port: false,
        timeout: 60000,
        local_fallback: false,
        path: '/usr/bin/clamdscan',
        config_file: null,
        multiscan: true,
        reload_db: false,
        active: true,
        bypass_test: false,
      },
      preference: 'clamdscan',
    })
    return this
  }

  isInfected = (filePath) => {
    if (!this.clamScan) {
      throw new Error('AntiVirus not initialized')
    }
    return this.clamScan.is_infected(filePath)
  }
}

module.exports = AntiVirus
