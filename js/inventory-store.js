/**
 * Inventory Store & Roll Logging Manager
 * Stores roll weighing sessions, calculates KPIs, and handles CSV export / thermal label printing.
 */

const SEED_INVENTORY = [
  {
    id: "ROL-1065",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    fabricId: "fab-1",
    fabricCode: "COT-TWL-280",
    fabricName: "Heavy Cotton Twill 16s",
    grossWeight: 26.06,
    tubeWeight: 1.20,
    netWeight: 24.86,
    expectedNetWeight: 24.86,
    variancePercent: 0.00,
    calculatedLengthMeters: 60.00,
    calculatedLengthYards: 65.62,
    status: "pass",
    batchLot: "LOT-2026-A15",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1064",
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    fabricId: "fab-1",
    fabricCode: "COT-TWL-280",
    fabricName: "Heavy Cotton Twill 16s",
    grossWeight: 26.15,
    tubeWeight: 1.20,
    netWeight: 24.95,
    expectedNetWeight: 24.86,
    variancePercent: 0.36,
    calculatedLengthMeters: 60.22,
    calculatedLengthYards: 65.86,
    status: "pass",
    batchLot: "LOT-2026-A15",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1063",
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    fabricId: "fab-2",
    fabricCode: "DNM-RAW-405",
    fabricName: "12oz Raw Selvedge Denim",
    grossWeight: 31.75,
    tubeWeight: 1.20,
    netWeight: 30.55,
    expectedNetWeight: 30.38,
    variancePercent: 0.56,
    calculatedLengthMeters: 50.29,
    calculatedLengthYards: 54.99,
    status: "pass",
    batchLot: "LOT-2026-D08",
    operator: "Zubair K."
  },
  {
    id: "ROL-1062",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    fabricId: "fab-2",
    fabricCode: "DNM-RAW-405",
    fabricName: "12oz Raw Selvedge Denim",
    grossWeight: 31.50,
    tubeWeight: 1.20,
    netWeight: 30.30,
    expectedNetWeight: 30.38,
    variancePercent: -0.26,
    calculatedLengthMeters: 49.88,
    calculatedLengthYards: 54.54,
    status: "pass",
    batchLot: "LOT-2026-D08",
    operator: "Zubair K."
  },
  {
    id: "ROL-1061",
    timestamp: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
    fabricId: "fab-3",
    fabricCode: "SLK-CHF-065",
    fabricName: "Mulberry Silk Chiffon",
    grossWeight: 7.76,
    tubeWeight: 0.45,
    netWeight: 7.31,
    expectedNetWeight: 7.28,
    variancePercent: 0.41,
    calculatedLengthMeters: 80.33,
    calculatedLengthYards: 87.85,
    status: "pass",
    batchLot: "LOT-2026-S21",
    operator: "Fatima R."
  },
  {
    id: "ROL-1060",
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    fabricId: "fab-3",
    fabricCode: "SLK-CHF-065",
    fabricName: "Mulberry Silk Chiffon",
    grossWeight: 7.68,
    tubeWeight: 0.45,
    netWeight: 7.23,
    expectedNetWeight: 7.28,
    variancePercent: -0.69,
    calculatedLengthMeters: 79.45,
    calculatedLengthYards: 86.89,
    status: "pass",
    batchLot: "LOT-2026-S21",
    operator: "Fatima R."
  },
  {
    id: "ROL-1059",
    timestamp: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    fabricId: "fab-4",
    fabricCode: "TER-ORG-320",
    fabricName: "French Terry 4-Way Stretch",
    grossWeight: 24.35,
    tubeWeight: 0.95,
    netWeight: 23.40,
    expectedNetWeight: 23.33,
    variancePercent: 0.30,
    calculatedLengthMeters: 45.14,
    calculatedLengthYards: 49.36,
    status: "pass",
    batchLot: "LOT-2026-T92",
    operator: "Sarah M."
  },
  {
    id: "ROL-1058",
    timestamp: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    fabricId: "fab-4",
    fabricCode: "TER-ORG-320",
    fabricName: "French Terry 4-Way Stretch",
    grossWeight: 24.22,
    tubeWeight: 0.95,
    netWeight: 23.27,
    expectedNetWeight: 23.33,
    variancePercent: -0.26,
    calculatedLengthMeters: 44.89,
    calculatedLengthYards: 49.09,
    status: "pass",
    batchLot: "LOT-2026-T92",
    operator: "Sarah M."
  },
  {
    id: "ROL-1057",
    timestamp: new Date(Date.now() - 1000 * 60 * 370).toISOString(),
    fabricId: "fab-5",
    fabricCode: "LIN-BEL-185",
    fabricName: "Belgian Flax Linen Voile",
    grossWeight: 15.62,
    tubeWeight: 0.70,
    netWeight: 14.92,
    expectedNetWeight: 14.75,
    variancePercent: 1.15,
    calculatedLengthMeters: 55.62,
    calculatedLengthYards: 60.83,
    status: "pass",
    batchLot: "LOT-2026-L05",
    operator: "Hamza B."
  },
  {
    id: "ROL-1056",
    timestamp: new Date(Date.now() - 1000 * 60 * 430).toISOString(),
    fabricId: "fab-5",
    fabricCode: "LIN-BEL-185",
    fabricName: "Belgian Flax Linen Voile",
    grossWeight: 16.35,
    tubeWeight: 0.70,
    netWeight: 15.65,
    expectedNetWeight: 14.75,
    variancePercent: 6.10,
    calculatedLengthMeters: 58.34,
    calculatedLengthYards: 63.80,
    status: "warning",
    batchLot: "LOT-2026-L05",
    operator: "Hamza B."
  },
  {
    id: "ROL-1055",
    timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    fabricId: "fab-6",
    fabricCode: "RIP-NYL-210",
    fabricName: "Ripstop Outdoor Cordura",
    grossWeight: 32.65,
    tubeWeight: 0.60,
    netWeight: 32.05,
    expectedNetWeight: 31.92,
    variancePercent: 0.41,
    calculatedLengthMeters: 100.41,
    calculatedLengthYards: 109.81,
    status: "pass",
    batchLot: "LOT-2026-R14",
    operator: "Tariq N."
  },
  {
    id: "ROL-1054",
    timestamp: new Date(Date.now() - 1000 * 60 * 580).toISOString(),
    fabricId: "fab-6",
    fabricCode: "RIP-NYL-210",
    fabricName: "Ripstop Outdoor Cordura",
    grossWeight: 32.45,
    tubeWeight: 0.60,
    netWeight: 31.85,
    expectedNetWeight: 31.92,
    variancePercent: -0.22,
    calculatedLengthMeters: 99.78,
    calculatedLengthYards: 109.12,
    status: "pass",
    batchLot: "LOT-2026-R14",
    operator: "Tariq N."
  },
  {
    id: "ROL-1053",
    timestamp: new Date(Date.now() - 1000 * 60 * 660).toISOString(),
    fabricId: "fab-1",
    fabricCode: "COT-TWL-280",
    fabricName: "Heavy Cotton Twill 16s",
    grossWeight: 25.75,
    tubeWeight: 0.85,
    netWeight: 24.90,
    expectedNetWeight: 24.86,
    variancePercent: 0.16,
    calculatedLengthMeters: 60.09,
    calculatedLengthYards: 65.72,
    status: "pass",
    batchLot: "LOT-2026-A14",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1052",
    timestamp: new Date(Date.now() - 1000 * 60 * 740).toISOString(),
    fabricId: "fab-1",
    fabricCode: "COT-TWL-280",
    fabricName: "Heavy Cotton Twill 16s",
    grossWeight: 26.85,
    tubeWeight: 0.85,
    netWeight: 26.00,
    expectedNetWeight: 24.86,
    variancePercent: 4.59,
    calculatedLengthMeters: 62.74,
    calculatedLengthYards: 68.61,
    status: "warning",
    batchLot: "LOT-2026-A14",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1051",
    timestamp: new Date(Date.now() - 1000 * 60 * 820).toISOString(),
    fabricId: "fab-2",
    fabricCode: "DNM-RAW-405",
    fabricName: "12oz Raw Selvedge Denim",
    grossWeight: 31.90,
    tubeWeight: 1.20,
    netWeight: 30.70,
    expectedNetWeight: 30.38,
    variancePercent: 1.05,
    calculatedLengthMeters: 50.53,
    calculatedLengthYards: 55.26,
    status: "pass",
    batchLot: "LOT-2026-D06",
    operator: "Zubair K."
  },
  {
    id: "ROL-1050",
    timestamp: new Date(Date.now() - 1000 * 60 * 910).toISOString(),
    fabricId: "fab-3",
    fabricCode: "SLK-CHF-065",
    fabricName: "Mulberry Silk Chiffon",
    grossWeight: 7.75,
    tubeWeight: 0.45,
    netWeight: 7.30,
    expectedNetWeight: 7.28,
    variancePercent: 0.27,
    calculatedLengthMeters: 80.22,
    calculatedLengthYards: 87.73,
    status: "pass",
    batchLot: "LOT-2026-S19",
    operator: "Fatima R."
  },
  {
    id: "ROL-1049",
    timestamp: new Date(Date.now() - 1000 * 60 * 1010).toISOString(),
    fabricId: "fab-1",
    fabricCode: "COT-TWL-280",
    fabricName: "Heavy Cotton Twill 16s",
    grossWeight: 25.82,
    tubeWeight: 0.85,
    netWeight: 24.97,
    expectedNetWeight: 24.86,
    variancePercent: 0.44,
    calculatedLengthMeters: 60.25,
    calculatedLengthYards: 65.89,
    status: "pass",
    batchLot: "LOT-2026-A12",
    operator: "Ahmad A."
  },
  {
    id: "ROL-1048",
    timestamp: new Date(Date.now() - 1000 * 60 * 1120).toISOString(),
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
    timestamp: new Date(Date.now() - 1000 * 60 * 1230).toISOString(),
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
    timestamp: new Date(Date.now() - 1000 * 60 * 1350).toISOString(),
    fabricId: "fab-5",
    fabricCode: "LIN-BEL-185",
    fabricName: "Belgian Flax Linen Voile",
    grossWeight: 16.20,
    tubeWeight: 0.70,
    netWeight: 15.50,
    expectedNetWeight: 14.75,
    variancePercent: 5.08,
    calculatedLengthMeters: 57.78,
    calculatedLengthYards: 63.19,
    status: "warning",
    batchLot: "LOT-2026-L02",
    operator: "Sarah M."
  }
];

class InventoryStore {
  constructor() {
    this.storageKey = "apple_inventory_rolls_v2";
    this.subscribers = new Set();
    this.rolls = this.loadRolls();
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
    if (!this.subscribers) return;
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
