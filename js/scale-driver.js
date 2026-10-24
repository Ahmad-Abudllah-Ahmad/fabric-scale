/**
 * Industrial Digital Scale Driver
 * Supports both Hardware Scale via Web Serial API (USB-to-Serial / RS232)
 * and High-Fidelity Physics Simulator for testing/demo.
 */

class ScaleDriver {
  constructor() {
    this.port = null;
    this.reader = null;
    this.isConnected = false;
    this.isHardware = false; // true if connected to real physical USB scale
    this.baudRate = 9600;
    
    // Live Scale State
    this.rawGrossWeight = 0.00; // in kg
    this.tareZeroOffset = 0.00; // zero calibration
    this.isStable = true;
    this.unit = 'kg'; // 'kg' or 'lb'
    
    // History buffer for sparkline (last 40 points)
    this.readingHistory = Array(40).fill(0);
    
    // Simulator Physics parameters (default starts at 0.00 kg)
    this.targetWeight = 0.00;
    this.simulatedCurrentWeight = 0.00;
    this.rawGrossWeight = 0.00;
    this.simNoise = true;
    this.simTimer = null;
    this.listeners = new Set();
    
    // Start simulation loop initially
    this.startSimulation();
  }

  // Subscribe to weight updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(data) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('Scale listener error:', err);
      }
    }
  }

  // Current gross weight in kg minus scale zero offset
  getGrossWeightKg() {
    return Math.max(0, parseFloat((this.rawGrossWeight - this.tareZeroOffset).toFixed(2)));
  }

  // Current gross weight converted to active unit
  getGrossWeight() {
    const valKg = this.getGrossWeightKg();
    if (this.unit === 'lb') {
      return parseFloat((valKg * 2.20462).toFixed(2));
    }
    return valKg;
  }

  // Zero the physical or virtual scale
  zeroScale() {
    this.tareZeroOffset = this.rawGrossWeight;
    if (!this.isHardware) {
      this.targetWeight = 0.00;
      this.simulatedCurrentWeight = 0.00;
      this.rawGrossWeight = 0.00;
      this.tareZeroOffset = 0.00;
    } else {
      this.sendSerialCommand('Z');
      this.sendSerialCommand('T');
    }
    this.isStable = true;
    this.readingHistory = Array(40).fill(0);
    this.emitCurrentState();
  }

  setUnit(unit) {
    if (unit === 'kg' || unit === 'lb') {
      this.unit = unit;
      this.emitCurrentState();
    }
  }

  emitCurrentState() {
    const grossKg = this.getGrossWeightKg();
    const gross = this.getGrossWeight();
    
    // Update sparkline history
    this.readingHistory.push(gross);
    if (this.readingHistory.length > 40) {
      this.readingHistory.shift();
    }

    this.notify({
      grossWeight: gross,
      grossWeightKg: grossKg,
      rawGross: this.rawGrossWeight,
      tareOffset: this.tareZeroOffset,
      unit: this.unit,
      isStable: this.isStable,
      isHardware: this.isHardware,
      isConnected: this.isConnected,
      history: [...this.readingHistory]
    });
  }

  /* -------------------------------------------------------------------------
     Hardware Scale Connection (Web Serial API)
     Works on Chrome, Edge, Opera with any USB-to-RS232/Scale adapter
     ------------------------------------------------------------------------- */
  async connectHardware() {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Chromium.');
    }

    try {
      this.stopSimulation();
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: this.baudRate });

      this.isConnected = true;
      this.isHardware = true;
      this.readSerialStream();

      return { success: true };
    } catch (err) {
      this.isHardware = false;
      this.startSimulation();
      throw err;
    }
  }

  async disconnectHardware() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    this.isHardware = false;
    this.isConnected = false;
    this.startSimulation();
  }

  async sendSerialCommand(cmd) {
    if (this.port && this.port.writable) {
      try {
        const writer = this.port.writable.getWriter();
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(cmd + '\r\n'));
        writer.releaseLock();
      } catch (err) {
        console.warn('Failed to send scale serial command:', err);
      }
    }
  }

  async readSerialStream() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    let buffer = '';
    try {
      while (this.isConnected) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/[\r\n]+/);
          buffer = lines.pop(); // keep last incomplete line

          for (const line of lines) {
            this.parseScaleLine(line);
          }
        }
      }
    } catch (error) {
      console.warn('Serial read loop disconnected:', error);
    } finally {
      this.reader.releaseLock();
    }
  }

  // Universal Scale Line Parser (Handles CAS, Toledo, A&D, Avery, generic ASCII)
  parseScaleLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect stability marker if present
    const isMotion = /US|MOT|~|\?/i.test(trimmed);
    const isStable = /ST|OK|GS|NT/i.test(trimmed) || !isMotion;

    // Extract numbers: e.g. "ST,GS,  +24.50 kg" -> 24.50
    const match = trimmed.match(/[-+]?\s*([0-9]+\.?[0-9]*)/);
    if (match) {
      const parsedNum = parseFloat(match[1]);
      if (!isNaN(parsedNum)) {
        this.rawGrossWeight = parsedNum;
        this.isStable = isStable;
        this.emitCurrentState();
      }
    }
  }

  /* -------------------------------------------------------------------------
     Realistic Scale Simulation Mode (When no USB scale is plugged in)
     Simulates real load cell damping, vibration settle, and roll placement
     ------------------------------------------------------------------------- */
  startSimulation() {
    if (this.simTimer) clearInterval(this.simTimer);
    this.isConnected = true;
    this.isHardware = false;

    this.simTimer = setInterval(() => {
      // Approach target with spring damping
      const delta = this.targetWeight - this.simulatedCurrentWeight;
      
      if (Math.abs(delta) > 0.01) {
        this.simulatedCurrentWeight += delta * 0.28;
        this.isStable = false;
      } else {
        this.simulatedCurrentWeight = this.targetWeight;
        this.isStable = true;
      }

      // Add realistic microscopic vibration when loaded (> 0.2kg)
      let noise = 0;
      if (this.simNoise && this.simulatedCurrentWeight > 0.5) {
        noise = (Math.random() - 0.5) * 0.02;
      }

      this.rawGrossWeight = Math.max(0, parseFloat((this.simulatedCurrentWeight + noise).toFixed(2)));
      this.emitCurrentState();
    }, 120);
  }

  stopSimulation() {
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
  }

  // Simulation controls for testing
  setSimulatedTarget(weightKg) {
    this.targetWeight = Math.max(0, parseFloat(weightKg));
  }

  simulateRollPlaced(weightKg = 25.71) {
    this.tareZeroOffset = 0.00;
    this.targetWeight = parseFloat(weightKg);
  }

  simulateRemoveRoll() {
    this.targetWeight = 0.00;
    this.simulatedCurrentWeight = 0.00;
    this.rawGrossWeight = 0.00;
    this.tareZeroOffset = 0.00;
    this.isStable = true;
    this.readingHistory = Array(40).fill(0);
    this.emitCurrentState();
  }
}

// Global singleton instance
window.scaleDriver = new ScaleDriver();
