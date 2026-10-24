/**
 * Fabric Specification & Catalog Store
 * Persists fabric profiles with standard GSM, Width, Default Tube Tare Weight, and Tolerances.
 */

const DEFAULT_FABRICS = [
  {
    id: "fab-1",
    code: "COT-TWL-280",
    name: "Heavy Cotton Twill 16s",
    category: "Woven",
    composition: "100% Combed Cotton",
    gsm: 280, // g/m²
    widthMeters: 1.48, // meters (approx 58")
    defaultTubeWeight: 0.85, // kg
    targetLength: 60.0, // meters
    expectedNetWeight: 24.86, // (280 * 1.48 * 60) / 1000 = 24.864 kg
    tolerancePercent: 3.5, // ±3.5%
    colorName: "Royal Navy",
    colorHex: "#1e3a8a",
    tag: "COT",
    notes: "Preshrunk, reactive dyed, premium shirting / chinos"
  },
  {
    id: "fab-2",
    code: "DNM-RAW-405",
    name: "12oz Raw Selvedge Denim",
    category: "Denim",
    composition: "98% Cotton, 2% Polyurethane",
    gsm: 405,
    widthMeters: 1.50,
    defaultTubeWeight: 1.20,
    targetLength: 50.0,
    expectedNetWeight: 30.38,
    tolerancePercent: 3.0,
    colorName: "Deep Indigo",
    colorHex: "#172554",
    tag: "DNM",
    notes: "Heavy duty cardboard core required due to stiffness"
  },
  {
    id: "fab-3",
    code: "SLK-CHF-065",
    name: "Mulberry Silk Chiffon",
    category: "Silk",
    composition: "100% Pure Mulberry Silk (6A)",
    gsm: 65,
    widthMeters: 1.40,
    defaultTubeWeight: 0.45,
    targetLength: 80.0,
    expectedNetWeight: 7.28,
    tolerancePercent: 4.0,
    colorName: "Blush Rose",
    colorHex: "#f472b6",
    tag: "SLK",
    notes: "Lightweight delicate roll with slim paper tube"
  },
  {
    id: "fab-4",
    code: "TER-ORG-320",
    name: "French Terry 4-Way Stretch",
    category: "Knit",
    composition: "95% Organic Cotton, 5% Spandex",
    gsm: 320,
    widthMeters: 1.62,
    defaultTubeWeight: 0.95,
    targetLength: 45.0,
    expectedNetWeight: 23.33,
    tolerancePercent: 3.0,
    colorName: "Heather Slate",
    colorHex: "#475569",
    tag: "TER",
    notes: "Loop-back fleece knit, high elasticity"
  },
  {
    id: "fab-5",
    code: "LIN-BEL-185",
    name: "Belgian Flax Linen Voile",
    category: "Linen",
    composition: "100% European Flax",
    gsm: 185,
    widthMeters: 1.45,
    defaultTubeWeight: 0.70,
    targetLength: 55.0,
    expectedNetWeight: 14.75,
    tolerancePercent: 4.0,
    colorName: "Warm Natural Oat",
    colorHex: "#d97706",
    tag: "LIN",
    notes: "Aero-finished, breathable summer drapery"
  },
  {
    id: "fab-6",
    code: "RIP-NYL-210",
    name: "Ripstop Outdoor Cordura",
    category: "Technical",
    composition: "100% High-Tenacity Nylon 6.6",
    gsm: 210,
    widthMeters: 1.52,
    defaultTubeWeight: 0.60,
    targetLength: 100.0,
    expectedNetWeight: 31.92,
    tolerancePercent: 2.5,
    colorName: "Alpine Forest",
    colorHex: "#059669",
    tag: "RIP",
    notes: "DWR coated, waterproof tactical weave"
  }
];

class FabricStore {
  constructor() {
    this.storageKey = "apple_fabric_catalog_v1";
    this.activeFabricKey = "apple_active_fabric_id_v1";
    this.fabrics = this.loadFabrics();
    this.activeFabricId = localStorage.getItem(this.activeFabricKey) || this.fabrics[0]?.id || null;
    this.subscribers = new Set();
  }

  loadFabrics() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize: remove any emoji icons from previously saved data
          const sanitized = parsed.map(f => {
            const clean = { ...f };
            delete clean.icon;
            clean.tag = clean.tag || clean.code.slice(0, 3);
            return clean;
          });
          return sanitized;
        }
      }
    } catch (e) {
      console.warn("Could not load fabrics from localStorage, reverting to defaults:", e);
    }
    // Seed defaults
    this.saveFabrics(DEFAULT_FABRICS);
    return [...DEFAULT_FABRICS];
  }

  saveFabrics(list) {
    this.fabrics = list;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {
      console.error("Error saving fabrics:", e);
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
        sub(this.fabrics, this.getActiveFabric());
      } catch (err) {
        console.error("FabricStore listener error:", err);
      }
    }
  }

  getAll() {
    return [...this.fabrics];
  }

  getById(id) {
    return this.fabrics.find(f => f.id === id) || null;
  }

  getActiveFabric() {
    const found = this.fabrics.find(f => f.id === this.activeFabricId);
    return found || this.fabrics[0] || null;
  }

  setActiveFabric(id) {
    const found = this.getById(id);
    if (found) {
      this.activeFabricId = id;
      localStorage.setItem(this.activeFabricKey, id);
      this.notify();
      return found;
    }
    return null;
  }

  // Calculate expected pure fabric weight: (GSM * Width * TargetLength) / 1000
  computeExpectedNetWeight(gsm, widthMeters, targetLength) {
    const val = (gsm * widthMeters * targetLength) / 1000;
    return parseFloat(val.toFixed(2));
  }

  addFabric(data) {
    const gsm = parseFloat(data.gsm) || 200;
    const width = parseFloat(data.widthMeters) || 1.5;
    const targetLength = parseFloat(data.targetLength) || 50;
    const defaultTube = parseFloat(data.defaultTubeWeight) || 0.85;

    const newFabric = {
      id: "fab-" + Date.now(),
      code: (data.code || "FAB-" + Math.floor(Math.random() * 1000)).toUpperCase().trim(),
      name: data.name?.trim() || "Untitled Fabric",
      category: data.category || "General",
      composition: data.composition?.trim() || "100% Textile",
      gsm: gsm,
      widthMeters: width,
      defaultTubeWeight: defaultTube,
      targetLength: targetLength,
      expectedNetWeight: this.computeExpectedNetWeight(gsm, width, targetLength),
      tolerancePercent: parseFloat(data.tolerancePercent) || 3.0,
      colorName: data.colorName?.trim() || "Standard",
      colorHex: data.colorHex || "#3b82f6",
      tag: (data.code || "FAB").slice(0, 3).toUpperCase(),
      notes: data.notes?.trim() || ""
    };

    const updated = [newFabric, ...this.fabrics];
    this.saveFabrics(updated);
    this.setActiveFabric(newFabric.id);
    return newFabric;
  }

  updateFabric(id, data) {
    const index = this.fabrics.findIndex(f => f.id === id);
    if (index === -1) return null;

    const gsm = parseFloat(data.gsm) || this.fabrics[index].gsm;
    const width = parseFloat(data.widthMeters) || this.fabrics[index].widthMeters;
    const targetLength = parseFloat(data.targetLength) || this.fabrics[index].targetLength;

    const updatedFabric = {
      ...this.fabrics[index],
      code: (data.code || this.fabrics[index].code).toUpperCase().trim(),
      name: data.name?.trim() || this.fabrics[index].name,
      category: data.category || this.fabrics[index].category,
      composition: data.composition?.trim() || this.fabrics[index].composition,
      gsm: gsm,
      widthMeters: width,
      defaultTubeWeight: parseFloat(data.defaultTubeWeight) || this.fabrics[index].defaultTubeWeight,
      targetLength: targetLength,
      expectedNetWeight: this.computeExpectedNetWeight(gsm, width, targetLength),
      tolerancePercent: parseFloat(data.tolerancePercent) || this.fabrics[index].tolerancePercent,
      colorName: data.colorName?.trim() || this.fabrics[index].colorName,
      colorHex: data.colorHex || this.fabrics[index].colorHex,
      notes: data.notes?.trim() || this.fabrics[index].notes
    };

    const updatedList = [...this.fabrics];
    updatedList[index] = updatedFabric;
    this.saveFabrics(updatedList);
    return updatedFabric;
  }

  updateTubeTare(id, tareKg) {
    const index = this.fabrics.findIndex(f => f.id === id);
    if (index === -1) return null;
    const parsed = Math.max(0, parseFloat(tareKg) || 0);
    this.fabrics[index].defaultTubeWeight = parseFloat(parsed.toFixed(2));
    this.saveFabrics([...this.fabrics]);
    return this.fabrics[index];
  }

  changeFabricCategory(id, newCategory) {
    const index = this.fabrics.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.fabrics[index].category = newCategory;
    this.saveFabrics([...this.fabrics]);
    return this.fabrics[index];
  }

  deleteFabric(id) {
    if (this.fabrics.length <= 1) {
      throw new Error("At least one fabric type must remain in the catalog.");
    }
    const updated = this.fabrics.filter(f => f.id !== id);
    this.saveFabrics(updated);
    if (this.activeFabricId === id) {
      this.setActiveFabric(updated[0].id);
    }
    return true;
  }

  duplicateFabric(id) {
    const target = this.getById(id);
    if (!target) return null;

    const copy = {
      ...target,
      id: "fab-" + Date.now(),
      code: target.code + "-COPY",
      name: target.name + " (Copy)"
    };

    const updated = [copy, ...this.fabrics];
    this.saveFabrics(updated);
    return copy;
  }

  resetToDefaults() {
    this.saveFabrics(DEFAULT_FABRICS);
    this.setActiveFabric(DEFAULT_FABRICS[0].id);
  }
}

window.fabricStore = new FabricStore();
