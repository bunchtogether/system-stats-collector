// @flow

const SystemStats = require('../src');

jest.setTimeout(60000);

describe('Collect Stats', () => {
  test('Collect SystemStats', async () => {
    const statsCollector = new SystemStats({ frequency: 3000 });
    statsCollector.on('stats', (data) => {
      console.log('NEW STATS', data);
    });
    statsCollector.on('close', (data) => {
      console.log('CLOSED STATS COLLECTOR');
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    statsCollector.close();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
});
