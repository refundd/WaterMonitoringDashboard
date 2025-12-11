// Simulates 5 LoRaWAN nodes
// Helpers to jitter values
const jitter = (val, amount, min, max) => {
    const next = val + (Math.random() - 0.5) * amount;
    return Math.max(min, Math.min(max, Number(next.toFixed(2))));
};
const generateHistory = (durationHours) => {
    const points = [];
    const now = new Date();
    const totalPoints = durationHours * 60; // 1 point per minute for history

    let baseSensors = { ph: 7.0, turbidity: 5.0, temperature: 25.0, tds: 150, do: 8.5 };
    let baseBattery = 100;

    for (let i = totalPoints; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000); // go back i minutes

        baseSensors = {
            ph: jitter(baseSensors.ph, 0.1, 6, 8),
            turbidity: jitter(baseSensors.turbidity, 1, 0, 20),
            temperature: jitter(baseSensors.temperature, 0.2, 20, 30),
            tds: jitter(baseSensors.tds, 5, 100, 300),
            do: jitter(baseSensors.do, 0.1, 6, 9)
        };

        baseBattery = Math.max(0, baseBattery - (0.2 / 60)); // 0.2% per hour

        points.push({
            timestamp: time,
            sensors: { ...baseSensors },
            connection: {
                rssi: jitter(-90, 5, -110, -70),
                snr: jitter(5, 2, 0, 10),
                pdr: jitter(100, 0, 95, 100)
            },
            battery: baseBattery
        });
    }
    return points;
};

// Simulates 5 LoRaWAN nodes
const loadSavedMeta = () => {
    try {
        return JSON.parse(localStorage.getItem('nodes_meta')) || {};
    } catch {
        return {};
    }
};

const savedMeta = loadSavedMeta();
// Keep a live source of truth for metadata that persists through updates
let inMemoryMeta = { ...savedMeta };

const START_NODES = Array.from({ length: 5 }, (_, i) => {
    const id = `node-${i + 1}`;
    const meta = inMemoryMeta[id] || {};

    const history = generateHistory(24);
    const lastPoint = history[history.length - 1];

    return {
        id: id,
        name: meta.name || `LoRa Node ${i + 1}`,
        order: meta.order !== undefined ? meta.order : i,
        status: 'online',
        lastSeen: new Date(),
        sensors: lastPoint.sensors,
        battery: lastPoint.battery,
        connection: lastPoint.connection,
        history: history
    };
}).sort((a, b) => a.order - b.order);

let nodes = [...START_NODES];
const listeners = new Set();

export const updateNodeMeta = (id, meta) => {
    // Update live metadata source of truth
    inMemoryMeta[id] = { ...(inMemoryMeta[id] || {}), ...meta };

    // Save to localStorage
    const currentMeta = loadSavedMeta();
    currentMeta[id] = { ...currentMeta[id], ...meta };
    localStorage.setItem('nodes_meta', JSON.stringify(currentMeta));

    // Force immediate update of nodes array with new metadata
    nodes = nodes.map(n => {
        if (n.id === id) {
            return { ...n, ...meta };
        }
        return n;
    });

    // If order changed, re-sort
    if (meta.order !== undefined) {
        nodes.sort((a, b) => a.order - b.order);
    }

    notify();
};

export const removeNode = (id) => {
    // 1. Remove from in-memory array
    nodes = nodes.filter(n => n.id !== id);

    // 2. Remove from metadata
    delete inMemoryMeta[id];

    // 3. Update storage
    const currentMeta = loadSavedMeta();
    delete currentMeta[id];
    localStorage.setItem('nodes_meta', JSON.stringify(currentMeta));

    notify();
};

const updateNodes = () => {
    nodes = nodes.map(node => {
        // 10% chance to drop a packet (simulate PDR change or offline)
        // For now we keep them online mostly
        const isOnline = Math.random() > 0.05;

        if (!isOnline) {
            // Maybe connection drops slightly
            const meta = inMemoryMeta[node.id] || {};
            return {
                ...node,
                ...meta, // Force metadata (name/order) to be current
                status: 'offline', // transient state
                connection: {
                    ...node.connection,
                    pdr: Math.max(0, node.connection.pdr - 5)
                }
            };
        }

        const newSensors = {
            ph: jitter(node.sensors.ph, 0.2, 0, 14),
            turbidity: jitter(node.sensors.turbidity, 2, 0, 100),
            temperature: jitter(node.sensors.temperature, 0.5, 0, 50),
            tds: jitter(node.sensors.tds, 10, 0, 1000),
            do: jitter(node.sensors.do, 0.5, 0, 14)
        };

        // Simulate battery drain: 0.05% drop per tick if online
        const newBattery = Math.max(0, node.battery - (Math.random() * 0.05));

        const newConnection = {
            rssi: jitter(node.connection.rssi, 5, -120, -30),
            snr: jitter(node.connection.snr, 1, -20, 15),
            pdr: jitter(node.connection.pdr, 2, 80, 100)
        };

        // Add to history (keep last 20 points)
        const newEntry = {
            timestamp: new Date(),
            sensors: newSensors,
            connection: newConnection,
            battery: newBattery
        };
        // Keep approx 24h of data (1440 mins). Let's keep 4000 to be safe for 2s updates if needed, 
        // but for now history generation was 1/min. 
        // Real-time updates are every 2s. 
        const newHistory = [...node.history, newEntry].slice(-2000);

        const meta = inMemoryMeta[node.id] || {};
        return {
            ...node,
            ...meta, // Force metadata capture
            status: 'online',
            lastSeen: new Date(),
            sensors: newSensors,
            connection: newConnection,
            battery: newBattery,
            history: newHistory
        };
    });

    notify();
};

const notify = () => {
    listeners.forEach(cb => cb(nodes));
};

// Start simulation
setInterval(updateNodes, 2000);

// Handle incoming packet (e.g. from Integration Test Console or real MQTT)
export const processIncomingPacket = (payload) => {
    try {
        let device_id, sensors, battery, connection, timestamp;

        // 1. Detect ChirpStack Format
        if (payload.deduplicationId && payload.deviceInfo) {
            device_id = payload.deviceInfo.deviceName || payload.deviceInfo.devEui;
            // Map 'object' directly. User must ensure decoder outputs matching keys (ph, turbidity, etc)
            sensors = payload.object;
            timestamp = new Date(payload.time || Date.now());

            // Extract connection info from first rxInfo
            const rx = payload.rxInfo && payload.rxInfo[0] ? payload.rxInfo[0] : {};
            connection = {
                rssi: rx.rssi || -90,
                snr: rx.snr || 8,
                pdr: 100 // ChirpStack doesn't send PDR per packet usually, assume good or calc manually
            };

            // Battery might be in 'object' or separate. Fallback to 100 or existing.
            battery = payload.object.battery || 100;
        }
        // 2. Default Simple Format
        else {
            ({ device_id, sensors, battery, connection } = payload);
            timestamp = new Date();
        }

        if (!device_id) throw new Error("Missing device_id (or deviceInfo.deviceName)");

        const existingNodeIndex = nodes.findIndex(n => n.id === device_id);

        const newEntry = {
            timestamp,
            sensors: { ...sensors },
            connection: { ...connection },
            battery
        };

        if (existingNodeIndex >= 0) {
            // Update existing node
            const existingNode = nodes[existingNodeIndex];

            // If battery wasn't in payload, simulate drain or keep existing
            const finalBattery = battery !== undefined ? battery : Math.max(0, existingNode.battery - 0.01);

            const updatedNode = {
                ...existingNode,
                status: 'online',
                lastSeen: timestamp,
                sensors: { ...sensors },
                connection: { ...connection },
                battery: finalBattery,
                history: [...existingNode.history, newEntry].slice(-2000)
            };

            // Apply live metadata overlay
            const meta = inMemoryMeta[device_id] || {};

            // Immutable update of the array
            nodes = nodes.map((n, i) => i === existingNodeIndex ? { ...updatedNode, ...meta } : n);
        } else {
            // Create NEW node (Auto-Discovery)
            const history = generateHistory(24);
            history[history.length - 1] = newEntry;

            // Check for saved meta for this new ID (maybe it was deleted but config remained)
            const meta = inMemoryMeta[device_id] || {};

            const newNode = {
                id: device_id,
                name: meta.name || `LoRa Node ${device_id}`,
                order: meta.order !== undefined ? meta.order : nodes.length,
                status: 'online',
                lastSeen: timestamp,
                sensors: { ...sensors },
                connection: { ...connection },
                battery: battery || 100,
                history: history
            };
            // Immutable add
            nodes = [...nodes, newNode];
        }

        notify();
        return { success: true, message: existingNodeIndex >= 0 ? "Node updated" : "New Node Discovered!" };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
};

export const subscribeToNodes = (cb) => {
    listeners.add(cb);
    cb(nodes); // Initial emit
    return () => listeners.delete(cb);
};

export const getNodes = () => nodes;
export const getNodeById = (id) => nodes.find(n => n.id === id);
