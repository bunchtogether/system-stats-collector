# system-stats-collector
System Stats Collector

### Usage

    const SystemStatsCollector = require('system-stats-collector');

    const collector = new SystemStatsCollector({ frequency: 5000 }); // Reports stats every 5 secs

    collector.on('stats', (data) => {
        // process stats here
    });

    collector.on('error', (error) => {
        // handel error here
    });

    // Close collector
    collector.close();

### Sample Stats Data

    // Stats Data
    {
    "cpu": {
        "average": {
        "load": 0.30060120240480964,
        "load_user": 0.30060120240480964,
        "load_system": 0,
        "load_nice": 0,
        "load_irq": 0,
        "idle": 99.6993987975952
        },
        "coreCount": 2,
        "cores": [
            {
                "load": 0.2004008016032064,
                "load_user": 0.2004008016032064,
                "load_system": 0,
                "load_nice": 0,
                "load_irq": 0,
                "idle": 99.79959919839679
            },
            {
                "load": 0.4008016032064128,
                "load_user": 0.4008016032064128,
                "load_system": 0,
                "load_nice": 0,
                "load_irq": 0,
                "idle": 99.59919839679358
            }
        ]
    },
    "network": {
        "iface": "ens32",
        "operstate": "up",
        "rx": 8414705992,
        "tx": 2434756604,
        "rx_sec": 29.41176470588235,
        "tx_sec": 268.7074829931973,
        "ms": 4998
    },
    "memory": {
        "totalBytes": 8362049536,
        "freeBytes": 3524636672,
        "usedBytes": 4837412864,
        "utilizedPercent": 57.85
    },
    "uptime": {
        "startedAt": 1542223854996,
        "seconds": 604913
    },
    "load": {
        "1m": 0.01708984375,
        "5m": 0.021484375,
        "15m": 0.146484375
    },
    "timestamp": 1542828767996
    }