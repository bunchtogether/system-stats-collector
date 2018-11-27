//      
const os = require('os');
const si = require('systeminformation');
const EventEmitter = require('events');

                           
                    
  

const defaultOptions                     = {
  frequency: 2000,
};


class SystemStats extends EventEmitter {
                          
                         

  constructor(options                      = defaultOptions) {
    super();
    this.updateFrequency = options.frequency || 1000;
    this.intervalId = setInterval(this.collectStats.bind(this), this.updateFrequency);
  }

  close() {
    clearInterval(this.intervalId);
    this.emit('close');
  }

  getLoad() {
    const loadAvg = os.loadavg();
    return {
      '1m': loadAvg[0],
      '5m': loadAvg[1],
      '15m': loadAvg[2],
    };
  }

  async getCPU() {
    try {
      const currentLoad = await si.currentLoad();
      return {
        average: {
          load: currentLoad.currentload,
          load_user: currentLoad.currentload_user,
          load_system: currentLoad.currentload_system,
          load_nice: currentLoad.currentload_nice,
          load_irq: currentLoad.currentload_irq,
          idle: currentLoad.currentload_idle,
        },
        coreCount: currentLoad.cpus.length,
        cores: currentLoad.cpus.map((core) => ({
          load: core.load,
          load_user: core.load_user,
          load_system: core.load_system,
          load_nice: core.load_nice,
          load_irq: core.load_irq,
          idle: core.load_idle,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  getMemory() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedBytes: (totalMem - freeMem),
      utilizedPercent: parseFloat((((totalMem - freeMem) / totalMem) * 100).toFixed(2)),
    };
  }

  getUptime() {
    const uptime = os.uptime();
    return {
      startedAt: Date.now() - (uptime * 1000),
      seconds: os.uptime(),
    };
  }

  async getNetwork() {
    const defaultValues = {
      iface: null,
      operstate: null,
      rx: 0,
      tx: 0,
      rx_sec: -1,
      tx_sec: -1,
      ms: 0,
    };
    try {
      const stats = si.networkStats();
      const timeout = new Promise((resolve) => setTimeout(() => resolve(defaultValues), this.updateFrequency / 2));
      return Promise.race([stats, timeout]);
    } catch (error) {
      throw error;
    }
  }

  async getDisk() {
    const defaultValues = [];
    try {
      const stats = await si.fsSize();
      const timeout = new Promise((resolve) => setTimeout(() => resolve(defaultValues), this.updateFrequency / 2));
      return Promise.race([stats, timeout]);
    } catch (error) {
      throw error;
    }
  }


  async collectStats() {
    try {
      const networkStats = await this.getNetwork();
      const cpuStats = await this.getCPU();
      const diskStats = await this.getDisk();
      this.emit('stats', {
        cpu: cpuStats,
        network: networkStats,
        memory: this.getMemory(),
        disk: diskStats,
        uptime: this.getUptime(),
        load: this.getLoad(),
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emit('error', error);
    }
  }
}

module.exports = SystemStats;
