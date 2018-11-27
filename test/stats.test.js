// @flow
declare var jest: any
declare var describe: any
declare var test: any

const expect = require('expect');
const SystemStats = require('../src');

jest.setTimeout(600000);

const STATS_FREQUENCY = 500;

describe('Collect Stats', () => {
  test('Collect SystemStats', async () => {
    const statsCollector = new SystemStats({ frequency: STATS_FREQUENCY });
    let collectStatsClosed = false;
    statsCollector.on('stats', (data) => {
      expect(data).toMatchObject(expect.objectContaining({
        cpu: {
          average: {
            load: expect.any(Number),
            load_user: expect.any(Number),
            load_system: expect.any(Number),
            load_nice: expect.any(Number),
            load_irq: expect.any(Number),
            idle: expect.any(Number),
          },
          coreCount: expect.any(Number),
          cores: expect.any(Array),
        },
        network: {
          iface: expect.any(String),
          operstate: expect.any(String),
          rx: expect.any(Number),
          tx: expect.any(Number),
          rx_sec: expect.any(Number),
          tx_sec: expect.any(Number),
          ms: expect.any(Number),
        },
        disk: expect.any(Array),
        memory: {
          totalBytes: expect.any(Number),
          freeBytes: expect.any(Number),
          usedBytes: expect.any(Number),
          utilizedPercent: expect.any(Number),
        },
        uptime: {
          startedAt: expect.any(Number),
          seconds: expect.any(Number),
        },
        load: {
          '1m': expect.any(Number),
          '5m': expect.any(Number),
          '15m': expect.any(Number),
        },
        timestamp: expect.any(Number),
      }));

      // CPU
      expect(Array.isArray(data.cpu.cores)).toEqual(true);
      data.cpu.cores.forEach((core) => {
        expect(core).toMatchObject({
          load: expect.any(Number),
          load_user: expect.any(Number),
          load_system: expect.any(Number),
          load_nice: expect.any(Number),
          load_irq: expect.any(Number),
          idle: expect.any(Number),
        });
        expect(Math.round(core.load + core.idle)).toBeLessThanOrEqual(100);
        expect(core.load_user + core.load_system + core.load_nice + core.load_irq).toBeGreaterThan(core.load - 0.01); // 0.01% margin of error
        expect(core.load_user + core.load_system + core.load_nice + core.load_irq).toBeLessThan(core.load + 0.01); // 0.01% margin of error
      });
      expect(Math.round(data.cpu.average.load + data.cpu.average.idle)).toBeLessThanOrEqual(100);
      expect(data.cpu.average.load_user + data.cpu.average.load_system + data.cpu.average.load_nice + data.cpu.average.load_irq).toBeGreaterThan(data.cpu.average.load - 0.01); // 0.01% margin of error
      expect(data.cpu.average.load_user + data.cpu.average.load_system + data.cpu.average.load_nice + data.cpu.average.load_irq).toBeLessThan(data.cpu.average.load + 0.01); // 0.01% margin of error
      // expect(data.cpu.average.load_user + data.cpu.average.load_system + data.cpu.average.load_nice + data.cpu.average.load_irq).toBeWithinRange(data.cpu.average.load - 0.01, data.cpu.average.load + 0.01); // 0.01% margin of error

      // Memory
      expect(data.memory.utilizedPercent).toBeLessThanOrEqual(100);
      expect(data.memory.freeBytes + data.memory.usedBytes).toEqual(data.memory.totalBytes);

      // Uptime
      expect(typeof (new Date(data.uptime.startedAt))).toEqual('object');
      expect(data.uptime.startedAt).toBeLessThan(Date.now());
      expect(data.uptime.startedAt + (data.uptime.seconds * 1000)).toBeLessThan(Date.now());
      expect(data.uptime.startedAt + (data.uptime.seconds * 1000)).toBeGreaterThan(Date.now() - STATS_FREQUENCY); // Should be within 500ms margin

      // Disk
      expect(Array.isArray(data.disk)).toEqual(true);
      data.disk.forEach((disk) => {
        expect(disk).toMatchObject({
          fs: expect.any(String),
          type: expect.any(String),
          size: expect.any(Number),
          used: expect.any(Number),
          use: expect.any(Number),
          mount: expect.any(String),
        });
      });

      // Load
      // If loadavg is 24 that means on average there are 24 processes in the job queue
      expect(data.load['1m']).toBeGreaterThan(0);
      expect(data.load['5m']).toBeGreaterThan(0);
      expect(data.load['15m']).toBeGreaterThan(0);

      // timestamp
      expect(data.timestamp).toBeLessThan(Date.now());
      expect(data.timestamp).toBeGreaterThan(Date.now() - STATS_FREQUENCY);

      // Do not collect stats after close
      expect(collectStatsClosed).toEqual(false);
    });
    statsCollector.on('error', (error) => {
      console.error('Stats Collector Error', error); //eslint-disable-line
    });
    statsCollector.on('close', () => {
      collectStatsClosed = true;
      console.log('Stats Collector Closed'); //eslint-disable-line
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    statsCollector.close();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
});
