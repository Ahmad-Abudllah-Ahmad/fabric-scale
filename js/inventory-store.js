/**
 * Inventory Store & Roll Logging Manager
 * Stores roll weighing sessions, calculates KPIs, and handles CSV export / thermal label printing.
 */

const SEED_INVENTORY = [
  {
    id: "ROL-1049",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    fabricId: "fab-1",
    fabricCode: "COT-TWL-280",
    fabricName: "Heavy Cotton Twill 16s",
    grossWeight: 25.82,
    tubeWeight: 0.85,
    netWeight: 24.97,
    expectedNetWeight: 24.86,
    variancePercent: 0.44, // +0.44%
    calculatedLengthMeters: 60.25,
    calculatedLengthYards: 65.89,
    status: "pass",
    batchLot: "LOT-2026-A12",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1048",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    fabricId: "fab-2",
    fabricCode: "DNM-RAW-405",
    fabricName: "12oz Raw Selvedge Denim",
    grossWeight: 31.65,
    tubeWeight: 1.20,
    netWeight: 30.45,
    expectedNetWeight: 30.38,
    variancePercent: 0.23,
    calculatedLengthMeters: 50.12,
    calculatedLengthYards: 54.81,
    status: "pass",
    batchLot: "LOT-2026-D04",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1047",
    timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    fabricId: "fab-4",
    fabricCode: "TER-ORG-320",
    fabricName: "French Terry 4-Way Stretch",
    grossWeight: 24.50,
    tubeWeight: 0.95,
    netWeight: 23.55,
    expectedNetWeight: 23.33,
    variancePercent: 0.94,
    calculatedLengthMeters: 45.43,
    calculatedLengthYards: 49.68,
    status: "pass",
    batchLot: "LOT-2026-T89",
    operator: "Sarah M."
  },
  {
    id: "ROL-1046",
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    fabricId: "fab-5",
    fabricCode: "LIN-BEL-185",
    fabricName: "Belgian Flax Linen Voile",
    grossWeight: 16.20,
    tubeWeight: 0.70,
    netWeight: 15.50,
    expectedNetWeight: 14.75,
    variancePercent: 5.08, // Warning: over tolerance
    calculatedLengthMeters: 57.78,
    calculatedLengthYards: 63.19,
    status: "warning",
    batchLot: "LOT-2026-L02",
    operator: "Sarah M."
  }
];

class InventoryStore {
  constructor() {
    this.storageKey = "apple_inventory_rolls_v1";
    this.rolls = this.loadRolls();
    this.subscribers = new Set();
  }

  loadRolls() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load inventory logs from localStorage:", e);
    }
    this.saveRolls(SEED_INVENTORY);
    return [...SEED_INVENTORY];
  }

  saveRolls(rolls) {
    this.rolls = rolls;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(rolls));
    } catch (e) {
      console.error("Error saving inventory rolls:", e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const sub of this.subscribers) {
      try {
        sub(this.rolls, this.getMetrics());
      } catch (err) {
        console.error("InventoryStore listener error:", err);
      }
    }
  }

  getAll() {
    return [...this.rolls];
  }

  getNextRollId() {
    const numbers = this.rolls
      .map(r => parseInt(r.id.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `ROL-${max + 1}`;
  }

  logRoll(data) {
    const gross = parseFloat(data.grossWeight) || 0;
    const tube = parseFloat(data.tubeWeight) || 0;
    const net = Math.max(0, parseFloat((gross - tube).toFixed(2)));
    const expected = parseFloat(data.expectedNetWeight) || net;

    // Variance % = ((Net - Expected) / Expected) * 100
    let variance = 0;
    if (expected > 0) {
      variance = parseFloat((((net - expected) / expected) * 100).toFixed(2));
    }

    const tolerance = parseFloat(data.tolerancePercent) || 3.5;
    let status = "pass";
    if (Math.abs(variance) > tolerance * 1.5) {
      status = "fail";
    } else if (Math.abs(variance) > tolerance) {
      status = "warning";
    }

    const roll = {
      id: data.id || this.getNextRollId(),
      timestamp: new Date().toISOString(),
      fabricId: data.fabricId || "",
      fabricCode: data.fabricCode || "GENERIC",
      fabricName: data.fabricName || "Fabric Roll",
      grossWeight: gross,
      tubeWeight: tube,
      netWeight: net,
      expectedNetWeight: expected,
      variancePercent: variance,
      calculatedLengthMeters: parseFloat(data.calculatedLengthMeters) || 0,
      calculatedLengthYards: parseFloat(data.calculatedLengthYards) || 0,
      status: status,
      batchLot: data.batchLot || "LOT-CURRENT",
      operator: data.operator || "Operator 1"
    };

    const updated = [roll, ...this.rolls];
    this.saveRolls(updated);
    return roll;
  }

  deleteRoll(id) {
    const updated = this.rolls.filter(r => r.id !== id);
    this.saveRolls(updated);
  }

  clearAll() {
    this.saveRolls([]);
  }

  getMetrics() {
    const count = this.rolls.length;
    if (count === 0) {
      return {
        totalRolls: 0,
        totalNetKg: 0,
        avgNetKg: 0,
        passRate: 100
      };
    }

    const totalNet = this.rolls.reduce((acc, r) => acc + (r.netWeight || 0), 0);
    const passCount = this.rolls.filter(r => r.status === "pass").length;

    return {
      totalRolls: count,
      totalNetKg: parseFloat(totalNet.toFixed(2)),
      avgNetKg: parseFloat((totalNet / count).toFixed(2)),
      passRate: parseFloat(((passCount / count) * 100).toFixed(1))
    };
  }

  exportCSV() {
    if (this.rolls.length === 0) {
      throw new Error("No inventory rolls to export.");
    }

    const headers = [
      "Roll ID",
      "Timestamp",
      "Fabric Code",
      "Fabric Name",
      "Gross Weight (kg)",
      "Hole Tube Tare (kg)",
      "Net Weight (kg)",
      "Expected Weight (kg)",
      "Variance (%)",
      "Calculated Length (m)",
      "Calculated Length (yd)",
      "QC Status",
      "Batch / Lot",
      "Operator"
    ];

    const rows = this.rolls.map(r => [
      `"${r.id}"`,
      `"${new Date(r.timestamp).toLocaleString()}"`,
      `"${r.fabricCode}"`,
      `"${r.fabricName}"`,
      r.grossWeight,
      r.tubeWeight,
      r.netWeight,
      r.expectedNetWeight,
      `${r.variancePercent}%`,
      r.calculatedLengthMeters,
      r.calculatedLengthYards,
      r.status.toUpperCase(),
      `"${r.batchLot}"`,
      `"${r.operator}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fabric_Inventory_Rolls_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

window.inventoryStore = new InventoryStore();
