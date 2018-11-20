// @flow
const os = require('os');
const si = require('systeminformation');
const EventEmitter = require('events');

type SystemStatsOptions = {
  frequency: number,
};

const defaultOptions: SystemStatsOptions = {
  frequency: 2000,
};

class SystemStats extends EventEmitter {
  updateFrequency: number;
  intervalId: string;

  constructor(options?: SystemStatsOptions = defaultOptions) {
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


  getCPU() {
    const cpus = os.cpus();
    let data = { average: {}, coreCount: cpus.length, cores: [] };
    for (var i = 0, len = cpus.length; i < len; i++) {
      const cpu = cpus[i];
      let cpuData = {};
      const totalFreq = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      // for (let type of Object.keys(cpu.times)) {
      //   cpuData[type] = parseFloat((100 * (cpu.times[type] / totalFreq)).toFixed(2));
      // }
      cpuData = Object.assign({}, cpu.times, { coreId: i + 1, total: totalFreq })
      data.cores.push(cpuData)
    }

    let userFreq = 0;
    let niceFreq = 0;
    let sysFreq = 0;
    let idleFreq = 0;
    let irqFreq = 0;
    let totalFreq = 0;
    data.cores.forEach(core => {
      userFreq += core.user;
      niceFreq += core.nice;
      sysFreq += core.sys;
      idleFreq += core.idle;
      irqFreq += core.irq;
      totalFreq += core.total;
    })

    data = Object.assign({}, data, {
      average: {
        user: Math.round(userFreq / data.cores.length),
        nice: Math.round(niceFreq / data.cores.length),
        sys: Math.round(sysFreq / data.cores.length),
        idle: Math.round(idleFreq / data.cores.length),
        irq: Math.round(irqFreq / data.cores.length),
        total: Math.round(totalFreq / data.cores.length),
      }
    });
    return data;
  }

  getMemory() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      'totalBytes': totalMem,
      'freeBytes': freeMem,
      'utilizedPercent': parseFloat((((totalMem - freeMem) / totalMem) * 100).toFixed(2)),
    };
  }

  getUptime() {
    const uptime = os.uptime();
    return {
      startedAt: Date.now() - (uptime * 1000),
      seconds: os.uptime(),
    }
  }

  async getNetwork() {
    const defaultValues = {
      iface: null,
      operstate: null,
      rx: 0,
      tx: 0,
      rx_sec: -1,
      tx_sec: -1,
      ms: 0
    };
    try {
      const stats = si.networkStats();
      const timeout = new Promise(resolve => setTimeout(() => resolve(defaultValues), this.updateFrequency / 2));
      return Promise.race([stats, timeout])
    } catch (error) {
      console.log(error)
      return defaultValues;
    }
  }


  async collectStats() {
    const networkStats = await this.getNetwork();
    this.emit('stats', {
      cpu: this.getCPU(),
      network: networkStats,
      memory: this.getMemory(),
      uptime: this.getUptime(),
      load: this.getLoad(),
      timestamp: Date.now()
    })
  }

};

module.exports = SystemStats;