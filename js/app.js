/**
 * Main Application Orchestrator
 * Connects ScaleDriver, FabricStore, and InventoryStore with an Apple Human Interface UX.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    activeTab: "live-scale",
    theme: localStorage.getItem("apple_theme_mode") || "light",
    currentTubeWeight: 1.20, // Current hole tube tare weight (editable directly on live scale)
    currentTubeAmount: 1, // Number of tubes / amount multiplier
    grossWeight: 0.00,
    unit: "kg",
    isStable: true,
    isTareZeroing: false,
    filterCategory: "all",
    searchFabricQuery: "",
    inventorySearchQuery: "",
    editingFabricId: null,
    fabricViewMode: "table",
    operatorName: localStorage.getItem("scale_operator_name") || "Ahmad A.",
    batchLot: "LOT-" + new Date().getFullYear() + "-A01"
  };

  // Cache DOM Elements
  const elements = {
    // Top Bar
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    hardwareConnectBtn: document.getElementById("hardwareConnectBtn"),
    scaleStatusPill: document.getElementById("scaleStatusPill"),
    scaleStatusDot: document.getElementById("scaleStatusDot"),
    scaleStatusText: document.getElementById("scaleStatusText"),
    tabButtons: document.querySelectorAll(".apple-segmented-tabs .tab-btn"),
    tabPanes: document.querySelectorAll(".tab-pane"),

    // Live Scale - Switch Fabric Dropdown Button & Popover (Next to KG / LB)
    fabricDropdownWrapper: document.getElementById("fabricDropdownWrapper"),
    fabricDropdownToggleBtn: document.getElementById("fabricDropdownToggleBtn"),
    fabricDropdownMenu: document.getElementById("fabricDropdownMenu"),
    fabricDropdownList: document.getElementById("fabricDropdownList"),
    fabricDropdownSearchInput: document.getElementById("fabricDropdownSearchInput"),
    dropdownManageFabricsBtn: document.getElementById("dropdownManageFabricsBtn"),
    activeFabricPillCode: document.getElementById("activeFabricPillCode"),

    // Live Scale Hero Display
    grossWeightVal: document.getElementById("grossWeightVal"),
    grossWeightUnit: document.getElementById("grossWeightUnit"),
    readingStabilityBadge: document.getElementById("readingStabilityBadge"),
    readingStabilityText: document.getElementById("readingStabilityText"),
    unitBtns: document.querySelectorAll(".unit-btn"),
    zeroScaleBtn: document.getElementById("zeroScaleBtn"),
    simulatePlaceRollBtn: document.getElementById("simulatePlaceRollBtn"),
    simulateRemoveRollBtn: document.getElementById("simulateRemoveRollBtn"),

    // Sparkline Canvas
    scaleSparkline: document.getElementById("scaleSparkline"),

    // Single Unified Weights Component (HOLE TUBE WEIGHT, AMOUNT & PURE NET FABRIC WEIGHT)
    tubeWeightInput: document.getElementById("tubeWeightInput"),
    tubeMinusBtn: document.getElementById("tubeMinusBtn"),
    tubePlusBtn: document.getElementById("tubePlusBtn"),
    tubeAmountInput: document.getElementById("tubeAmountInput"),
    amountMinusBtn: document.getElementById("amountMinusBtn"),
    amountPlusBtn: document.getElementById("amountPlusBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    tubeUnitLabel: document.getElementById("tubeUnitLabel"),
    netWeightVal: document.getElementById("netWeightVal"),
    netWeightUnit: document.getElementById("netWeightUnit"),
    netDeductionFormula: document.getElementById("netDeductionFormula"),

    // Telemetry & Yield Metrics
    calcMetersVal: document.getElementById("calcMetersVal"),
    calcYardsVal: document.getElementById("calcYardsVal"),
    targetYieldVal: document.getElementById("targetYieldVal"),
    rollGsmYieldVal: document.getElementById("rollGsmYieldVal"),

    // Roll Session Inputs & Log Button
    nextRollIdInput: document.getElementById("nextRollIdInput"),
    batchLotInput: document.getElementById("batchLotInput"),
    operatorInput: document.getElementById("operatorInput"),
    logRollBtn: document.getElementById("logRollBtn"),

    // Fabric Catalog Tab - Fast Add Panel & Elements
    inlineAddFabricCard: document.getElementById("inlineAddFabricCard"),
    inlineAddFabricForm: document.getElementById("inlineAddFabricForm"),
    toggleAddPanelBtn: document.getElementById("toggleAddPanelBtn"),
    toggleAddPanelText: document.getElementById("toggleAddPanelText"),
    quickFabricCode: document.getElementById("quickFabricCode"),
    quickFabricName: document.getElementById("quickFabricName"),
    quickFabricCategory: document.getElementById("quickFabricCategory"),
    quickFabricGsm: document.getElementById("quickFabricGsm"),
    quickFabricWidth: document.getElementById("quickFabricWidth"),
    quickFabricTube: document.getElementById("quickFabricTube"),
    quickFabricLength: document.getElementById("quickFabricLength"),
    quickFabricColor: document.getElementById("quickFabricColor"),

    // Fabric Table & View Switcher
    fabricTableCard: document.getElementById("fabricTableCard"),
    fabricTableBody: document.getElementById("fabricTableBody"),
    viewToggleTable: document.getElementById("viewToggleTable"),
    viewToggleCards: document.getElementById("viewToggleCards"),

    // Fabric Catalog Tab & Modal
    fabricSearchInput: document.getElementById("fabricSearchInput"),
    categoryFilterPills: document.querySelectorAll(".filter-pill"),
    fabricCardsContainer: document.getElementById("fabricCardsContainer"),
    openAddFabricModalBtn: document.getElementById("openAddFabricModalBtn"),
    fabricModal: document.getElementById("fabricModal"),
    fabricModalTitle: document.getElementById("fabricModalTitle"),
    fabricForm: document.getElementById("fabricForm"),
    deleteFabricModalBtn: document.getElementById("deleteFabricModalBtn"),
    closeFabricModalBtn: document.getElementById("closeFabricModalBtn"),
    cancelFabricModalBtn: document.getElementById("cancelFabricModalBtn"),

    // Inventory Tab
    kpiTotalRolls: document.getElementById("kpiTotalRolls"),
    kpiTotalNetKg: document.getElementById("kpiTotalNetKg"),
    kpiAvgNetKg: document.getElementById("kpiAvgNetKg"),
    kpiPassRate: document.getElementById("kpiPassRate"),
    inventoryTableBody: document.getElementById("inventoryTableBody"),
    exportCsvBtn: document.getElementById("exportCsvBtn"),
    clearInventoryBtn: document.getElementById("clearInventoryBtn"),
    inventorySearchInput: document.getElementById("inventorySearchInput"),

    // Print Label Modal
    printLabelModal: document.getElementById("printLabelModal"),
    closeLabelModalBtn: document.getElementById("closeLabelModalBtn"),
    printLabelActionBtn: document.getElementById("printLabelActionBtn"),
    labelContent: document.getElementById("labelContent"),

    // Scale Hardware Modal
    scaleHardwareModal: document.getElementById("scaleHardwareModal"),
    closeHardwareModalBtn: document.getElementById("closeHardwareModalBtn"),
    baudRateSelect: document.getElementById("baudRateSelect"),
    confirmSerialConnectBtn: document.getElementById("confirmSerialConnectBtn"),
    simWeightSlider: document.getElementById("simWeightSlider"),
    simWeightSliderVal: document.getElementById("simWeightSliderVal"),

    // Quick Fabric Select Modal (from Live Scale)
    quickSelectModal: document.getElementById("quickSelectModal"),
    closeQuickSelectBtn: document.getElementById("closeQuickSelectBtn"),
    quickSelectFabricList: document.getElementById("quickSelectFabricList"),

    // Toast Container
    toastContainer: document.getElementById("toastContainer")
  };

  /* =========================================================================
     Theme Management (Apple Light & Dark Modes)
     ========================================================================= */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("apple_theme_mode", theme);
    elements.themeToggleBtn.innerHTML = theme === "dark" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    if (typeof updateCalculations === "function") {
      updateCalculations();
    }
    if (typeof renderSparkline === "function" && window.scaleDriver) {
      renderSparkline(window.scaleDriver.readingHistory);
    }
  }

  elements.themeToggleBtn.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  /* =========================================================================
     Toast Notification System
     ========================================================================= */
  function showToast(title, message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `apple-toast ${type}`;
    
    let iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    if (type === "warning") {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else if (type === "info") {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div>
        <div style="font-weight: 600;">${title}</div>
        <div style="font-size: 11px; opacity: 0.85;">${message}</div>
      </div>
    `;

    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* =========================================================================
     Tab Navigation Switcher
     ========================================================================= */
  elements.tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      state.activeTab = targetTab;

      elements.tabButtons.forEach(b => b.classList.remove("active"));
      elements.tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) targetPane.classList.add("active");

      if (targetTab === "live-scale") {
        document.body.classList.add("view-live-scale");
      } else {
        document.body.classList.remove("view-live-scale");
      }

      if (targetTab === "inventory") {
        renderInventoryTable();
      } else if (targetTab === "fabric-types") {
        renderFabricCatalog();
      }
    });
  });

  // Default active tab class for initial zero-scroll fit
  document.body.classList.add("view-live-scale");

  /* =========================================================================
     Switch Fabric Type Popover Dropdown (Next to KG / LB)
     ========================================================================= */
  function openFabricDropdown() {
    if (!elements.fabricDropdownMenu || !elements.fabricDropdownToggleBtn) return;
    elements.fabricDropdownMenu.classList.add("show");
    elements.fabricDropdownToggleBtn.classList.add("open");
    elements.fabricDropdownToggleBtn.setAttribute("aria-expanded", "true");
    if (elements.fabricDropdownSearchInput) {
      elements.fabricDropdownSearchInput.value = "";
    }
    renderFabricSwitchDropdown();
    setTimeout(() => {
      elements.fabricDropdownSearchInput?.focus();
    }, 50);
  }

  function closeFabricDropdown() {
    if (!elements.fabricDropdownMenu || !elements.fabricDropdownToggleBtn) return;
    elements.fabricDropdownMenu.classList.remove("show");
    elements.fabricDropdownToggleBtn.classList.remove("open");
    elements.fabricDropdownToggleBtn.setAttribute("aria-expanded", "false");
  }

  function toggleFabricDropdown() {
    if (!elements.fabricDropdownMenu) return;
    if (elements.fabricDropdownMenu.classList.contains("show")) {
      closeFabricDropdown();
    } else {
      openFabricDropdown();
    }
  }

  function renderFabricSwitchDropdown(query = "") {
    if (!elements.fabricDropdownList) return;
    const fabrics = window.fabricStore.getAll();
    const active = window.fabricStore.getActiveFabric();
    const q = (query || "").trim().toLowerCase();

    const filtered = q
      ? fabrics.filter(f => 
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.gsm.toString().includes(q)
        )
      : fabrics;

    if (filtered.length === 0) {
      elements.fabricDropdownList.innerHTML = `
        <div style="padding: 18px 12px; text-align: center; color: var(--text-tertiary); font-size: 12px;">
          No matching fabric types found.
        </div>
      `;
      return;
    }

    elements.fabricDropdownList.innerHTML = filtered.map(f => {
      const isActive = active && active.id === f.id;
      const tagText = f.tag || f.code.slice(0, 3);
      return `
        <button type="button" class="dropdown-fabric-item ${isActive ? "active" : ""}" data-id="${f.id}" role="menuitem">
          <div class="dropdown-tag-badge" style="background-color: ${f.colorHex || "#2563eb"};">
            ${tagText}
          </div>
          <div class="dropdown-item-info">
            <div class="dropdown-item-top">
              <span class="dropdown-item-name">${f.name}</span>
              <span class="dropdown-item-category">${f.category}</span>
            </div>
            <div class="dropdown-item-specs">
              <strong>${f.code}</strong> • ${f.gsm} g/m² • ${f.widthMeters}m • Tare: ${f.defaultTubeWeight.toFixed(2)}kg
            </div>
          </div>
          <div class="dropdown-item-check">
            ${isActive ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` : ""}
          </div>
        </button>
      `;
    }).join("");

    // Attach click events to each dropdown option
    elements.fabricDropdownList.querySelectorAll(".dropdown-fabric-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-id");
        const chosen = window.fabricStore.setActiveFabric(id);
        closeFabricDropdown();
        if (chosen) {
          syncActiveFabricDisplay();
          showToast("Fabric Switched", `Now inspecting ${chosen.name} (${chosen.code}).`, "info");
        }
        if (typeof renderFabricCatalog === "function") {
          renderFabricCatalog();
        }
      });
    });
  }

  // Toggle dropdown on button click
  if (elements.fabricDropdownToggleBtn) {
    elements.fabricDropdownToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFabricDropdown();
    });
  }

  // Prevent dropdown menu inner click from closing
  if (elements.fabricDropdownMenu) {
    elements.fabricDropdownMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Search filter typing
  if (elements.fabricDropdownSearchInput) {
    elements.fabricDropdownSearchInput.addEventListener("input", (e) => {
      renderFabricSwitchDropdown(e.target.value);
    });
  }

  // Footer manage fabrics button
  if (elements.dropdownManageFabricsBtn) {
    elements.dropdownManageFabricsBtn.addEventListener("click", () => {
      closeFabricDropdown();
      const fabTabBtn = document.querySelector('.apple-segmented-tabs .tab-btn[data-tab="fabric-types"]');
      if (fabTabBtn) fabTabBtn.click();
    });
  }

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (elements.fabricDropdownWrapper && !elements.fabricDropdownWrapper.contains(e.target)) {
      closeFabricDropdown();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeFabricDropdown();
    }
  });

  /* =========================================================================
     Active Fabric Synchronization
     ========================================================================= */
  function syncActiveFabricDisplay() {
    const active = window.fabricStore.getActiveFabric();
    if (!active) return;

    // Update active fabric badge in the switch button next to KG / LB
    if (elements.activeFabricPillCode) {
      elements.activeFabricPillCode.textContent = active.code;
    }

    // Update telemetry column specifications
    const widthEl = document.getElementById("specWidthVal");
    if (widthEl) widthEl.textContent = `${active.widthMeters} meters (${Math.round(active.widthMeters * 39.3701)}")`;
    const targetEl = document.getElementById("specTargetLengthVal");
    if (targetEl) targetEl.textContent = `${active.targetLength} meters`;
    const expEl = document.getElementById("specExpectedWeightVal");
    if (expEl) expEl.textContent = `${active.expectedNetWeight} kg`;

    // When active fabric switches, set default hole tube weight unless customized
    state.currentTubeWeight = active.defaultTubeWeight;
    if (elements.tubeWeightInput) {
      elements.tubeWeightInput.value = state.currentTubeWeight.toFixed(2);
    }

    // Refresh calculations
    updateCalculations();
  }

  /* =========================================================================
     Hole Tube Tare Weight (Live Scale Direct Inline Editor)
     CRITICAL USER REQUIREMENT:
     "make sure that user on live scale can also edit the hole tube weight
     which is supposed to be subtracted from fabric weight"
     ========================================================================= */
  /* =========================================================================
     Dynamic Live Scale Number-Hit & Zoom Animations (Gain / Loss / Tare)
     ========================================================================= */
  const previousValuesMap = new WeakMap();

  function triggerHitAnimation(el, isGain) {
    if (!el) return;
    const animClass = isGain ? "num-hit-gain" : "num-hit-loss";
    el.classList.remove("num-hit-gain", "num-hit-loss");
    void el.offsetWidth; // trigger reflow
    el.classList.add(animClass);

    if (el._hitTimer) clearTimeout(el._hitTimer);
    el._hitTimer = setTimeout(() => {
      el.classList.remove("num-hit-gain", "num-hit-loss");
    }, 340);
  }

  /* =========================================================================
     Rolling Digit Odometer Ticker Slot Machine Architecture
     ========================================================================= */
  function updateRollingTicker(el, str) {
    if (!el) return;
    const chars = str.split("");
    let slots = el._tickerSlots;
    const signature = str.replace(/[0-9]/g, "D");

    if (!slots || slots.length !== chars.length || el._tickerSig !== signature) {
      el.innerHTML = "";
      slots = [];
      el._tickerSig = signature;

      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c >= "0" && c <= "9") {
          const slot = document.createElement("span");
          slot.className = "ticker-slot";
          const col = document.createElement("span");
          col.className = "ticker-column";
          for (let d = 0; d <= 9; d++) {
            const digit = document.createElement("span");
            digit.className = "ticker-digit-val";
            digit.textContent = d;
            col.appendChild(digit);
          }
          slot.appendChild(col);
          el.appendChild(slot);
          slots.push({ isDigit: true, col, currentVal: -1 });
        } else {
          const sep = document.createElement("span");
          sep.className = "ticker-separator";
          sep.textContent = c;
          el.appendChild(sep);
          slots.push({ isDigit: false, sep, currentVal: c });
        }
      }
      el._tickerSlots = slots;
    }

    // Animate each digit to its designated vertical percentage
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const slotData = slots[i];
      if (slotData.isDigit) {
        const targetVal = parseInt(c, 10);
        if (slotData.currentVal !== targetVal) {
          slotData.currentVal = targetVal;
          slotData.col.style.transform = `translateY(-${targetVal * 10}%)`;
        }
      } else {
        if (slotData.currentVal !== c) {
          slotData.currentVal = c;
          slotData.sep.textContent = c;
        }
      }
    }
  }

  function updateElementWithHit(el, formattedStr, numericVal, threshold = 0.02) {
    if (!el) return;
    const oldVal = previousValuesMap.has(el) ? previousValuesMap.get(el) : null;
    
    // Dynamic rolling digit slot machine odometer
    updateRollingTicker(el, formattedStr);

    if (oldVal !== null && !isNaN(oldVal) && !isNaN(numericVal)) {
      const diff = numericVal - oldVal;
      if (Math.abs(diff) >= threshold) {
        triggerHitAnimation(el, diff > 0);
      }
    }
    previousValuesMap.set(el, numericVal);
  }

  function triggerTareZeroSettle() {
    const targets = [
      elements.grossWeightVal,
      elements.netWeightVal,
      elements.calcMetersVal,
      elements.calcYardsVal
    ].filter(Boolean);

    targets.forEach(el => {
      el.classList.remove("num-hit-gain", "num-hit-loss", "num-tare-settle");
      void el.offsetWidth;
      el.classList.add("num-tare-settle");
      setTimeout(() => el.classList.remove("num-tare-settle"), 600);
    });

    if (elements.readingStabilityBadge) {
      elements.readingStabilityBadge.classList.add("tare-calibrated-flash");
      setTimeout(() => elements.readingStabilityBadge.classList.remove("tare-calibrated-flash"), 800);
    }
  }

  let tareCountdownTimer = null;

  function performSmoothTareZero() {
    if (tareCountdownTimer) {
      cancelAnimationFrame(tareCountdownTimer);
      tareCountdownTimer = null;
    }

    const startGross = state.grossWeight;
    if (startGross <= 0.01) {
      window.scaleDriver.zeroScale();
      state.grossWeight = 0.00;
      updateCalculations();
      triggerTareZeroSettle();
      return;
    }

    state.isTareZeroing = true;
    if (window.scaleDriver && typeof window.scaleDriver.setSimulatedTarget === "function") {
      window.scaleDriver.setSimulatedTarget(0.00);
    }

    const duration = 500; // Smooth 500ms descent
    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    let lastStepTime = 0;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      // Throttle intermediate steps to ~35ms so rolling ticker digits roll visibly
      if (currentTime - lastStepTime >= 35 || progress >= 1) {
        lastStepTime = currentTime;
        const currentGross = Math.max(0, parseFloat((startGross * (1 - eased)).toFixed(2)));
        state.grossWeight = currentGross;
        updateCalculations();
      }

      if (progress < 1) {
        tareCountdownTimer = requestAnimationFrame(step);
      } else {
        tareCountdownTimer = null;
        window.scaleDriver.zeroScale();
        state.grossWeight = 0.00;
        state.isTareZeroing = false;
        updateCalculations();
        triggerTareZeroSettle();
      }
    }

    tareCountdownTimer = requestAnimationFrame(step);
  }

  function pulseCalculatedOutputs() {
    const els = [elements.grossWeightVal, elements.netWeightVal, elements.calcMetersVal, elements.calcYardsVal, elements.netDeductionFormula].filter(Boolean);
    els.forEach(el => {
      el.classList.remove("metric-updated-pulse");
      void el.offsetWidth;
      el.classList.add("metric-updated-pulse");
    });
  }

  function setTubeWeight(newVal, notify = false) {
    const rawVal = parseFloat(newVal);
    if (isNaN(rawVal)) return;

    // Convert display input to internal KG
    const valInKg = state.unit === "lb" ? (rawVal / 2.20462) : rawVal;
    const parsed = Math.max(0, Math.min(25, valInKg));
    state.currentTubeWeight = parseFloat(parsed.toFixed(2));

    if (elements.tubeWeightInput) {
      const displayVal = state.unit === "lb" ? (state.currentTubeWeight * 2.20462).toFixed(2) : state.currentTubeWeight.toFixed(2);
      elements.tubeWeightInput.value = displayVal;
    }

    // Sync to active fabric in fabricStore so the whole app is updated
    const active = window.fabricStore.getActiveFabric();
    if (active) {
      if (typeof window.fabricStore.updateTubeTare === "function") {
        window.fabricStore.updateTubeTare(active.id, state.currentTubeWeight);
      } else {
        active.defaultTubeWeight = state.currentTubeWeight;
      }
      renderFabricCatalog();
      renderFabricSwitchDropdown();
    }

    updateCalculations();
    pulseCalculatedOutputs();

    if (notify) {
      showToast("Tube Tare Updated", `Hole tube weight set to ${state.currentTubeWeight.toFixed(2)} kg (deducted from gross).`, "info");
    }
  }

  // Direct numeric typing on HOLE TUBE WEIGHT (instant real-time input)
  if (elements.tubeWeightInput) {
    const handleTubeInputChange = () => {
      const rawVal = parseFloat(elements.tubeWeightInput.value);
      if (!isNaN(rawVal)) {
        const valInKg = state.unit === "lb" ? (rawVal / 2.20462) : rawVal;
        state.currentTubeWeight = Math.max(0, parseFloat(valInKg.toFixed(2)));

        // Synchronize with active fabric in fabricStore
        const active = window.fabricStore.getActiveFabric();
        if (active) {
          if (typeof window.fabricStore.updateTubeTare === "function") {
            window.fabricStore.updateTubeTare(active.id, state.currentTubeWeight);
          } else {
            active.defaultTubeWeight = state.currentTubeWeight;
          }
          renderFabricCatalog();
          renderFabricSwitchDropdown();
        }

        updateCalculations();
        pulseCalculatedOutputs();
      }
    };

    elements.tubeWeightInput.addEventListener("input", handleTubeInputChange);
    elements.tubeWeightInput.addEventListener("change", handleTubeInputChange);
    elements.tubeWeightInput.addEventListener("keyup", handleTubeInputChange);

    elements.tubeWeightInput.addEventListener("blur", () => {
      const displayVal = state.unit === "lb" ? (state.currentTubeWeight * 2.20462).toFixed(2) : state.currentTubeWeight.toFixed(2);
      elements.tubeWeightInput.value = displayVal;
    });
  }

  // Active input tracking for + / - buttons and keyboard controls
  let activeTareInput = elements.tubeAmountInput;

  function stepTubeWeight(direction) {
    const step = (state.unit === "lb" ? 0.10 : 0.05) * direction;
    const currentDisplay = state.unit === "lb" ? (state.currentTubeWeight * 2.20462) : state.currentTubeWeight;
    const nextDisplay = Math.max(0, parseFloat((currentDisplay + step).toFixed(2)));
    if (elements.tubeWeightInput) {
      triggerHitAnimation(elements.tubeWeightInput, direction > 0);
    }
    setTubeWeight(nextDisplay);
  }

  function stepAmount(direction) {
    const nextAmount = Math.max(1, (state.currentTubeAmount || 1) + direction);
    state.currentTubeAmount = nextAmount;
    if (elements.tubeAmountInput) {
      elements.tubeAmountInput.value = nextAmount;
      triggerHitAnimation(elements.tubeAmountInput, direction > 0);
    }
    updateCalculations();
    pulseCalculatedOutputs();
  }

  function handleInputStepKey(e, inputEl) {
    if (e.key === "+" || e.key === "=" || e.key === "ArrowUp") {
      e.preventDefault();
      if (inputEl === elements.tubeWeightInput) {
        stepTubeWeight(1);
      } else {
        stepAmount(1);
      }
    } else if (e.key === "-" || e.key === "_" || e.key === "ArrowDown") {
      e.preventDefault();
      if (inputEl === elements.tubeWeightInput) {
        stepTubeWeight(-1);
      } else {
        stepAmount(-1);
      }
    }
  }

  // Stepper +- buttons for HOLE TUBE WEIGHT
  if (elements.tubeMinusBtn) {
    elements.tubeMinusBtn.addEventListener("click", () => {
      stepTubeWeight(-1);
    });
  }

  if (elements.tubePlusBtn) {
    elements.tubePlusBtn.addEventListener("click", () => {
      stepTubeWeight(1);
    });
  }

  // Stepper +- buttons for AMOUNT
  if (elements.amountMinusBtn) {
    elements.amountMinusBtn.addEventListener("click", () => {
      stepAmount(-1);
    });
  }

  if (elements.amountPlusBtn) {
    elements.amountPlusBtn.addEventListener("click", () => {
      stepAmount(1);
    });
  }

  // Tracking active focus and keyboard +/- controls
  if (elements.tubeWeightInput) {
    elements.tubeWeightInput.addEventListener("focus", () => {
      activeTareInput = elements.tubeWeightInput;
    });
    elements.tubeWeightInput.addEventListener("keydown", (e) => handleInputStepKey(e, elements.tubeWeightInput));
  }

  if (elements.tubeAmountInput) {
    elements.tubeAmountInput.addEventListener("focus", () => {
      activeTareInput = elements.tubeAmountInput;
    });
    elements.tubeAmountInput.addEventListener("keydown", (e) => handleInputStepKey(e, elements.tubeAmountInput));

    const handleAmountChange = (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1) {
        state.currentTubeAmount = val;
        updateCalculations();
        pulseCalculatedOutputs();
      }
    };
    elements.tubeAmountInput.addEventListener("input", handleAmountChange);
    elements.tubeAmountInput.addEventListener("change", handleAmountChange);
    elements.tubeAmountInput.addEventListener("blur", () => {
      if (!elements.tubeAmountInput.value || parseInt(elements.tubeAmountInput.value, 10) < 1) {
        state.currentTubeAmount = 1;
        elements.tubeAmountInput.value = 1;
        updateCalculations();
        pulseCalculatedOutputs();
      }
    });
  }

  /* =========================================================================
     Scale Telemetry & Net Weight Calculation Engine
     Formula:
     1. Total Tare = Hole Tube Tare Weight * Amount
     2. Net Fabric Weight = Gross Scale Weight - Total Tare
     3. Computed Roll Length (meters) = (Net Weight in grams) / (Width in meters * GSM)
     4. Computed Roll Length (yards) = Meters * 1.09361
     ========================================================================= */
  function updateCalculations() {
    const active = window.fabricStore.getActiveFabric();
    if (!active) return;

    // Both gross & tube always maintained in raw kilograms
    const grossKg = state.grossWeight;
    const tubeKg = state.currentTubeWeight;
    const tubeAmount = state.currentTubeAmount || 1;
    const totalTareKg = tubeKg * tubeAmount;
    
    // Net Fabric Weight (pure fabric minus total tube core tare)
    const netKg = grossKg <= 0.001 ? 0.00 : Math.max(0, parseFloat((grossKg - totalTareKg).toFixed(2)));
    
    // Units conversion for display
    const displayGross = state.unit === "lb" ? (grossKg * 2.20462) : grossKg;
    const displayTube = state.unit === "lb" ? (tubeKg * 2.20462) : tubeKg;
    const displayTotalTare = state.unit === "lb" ? (totalTareKg * 2.20462) : totalTareKg;
    const displayNet = state.unit === "lb" ? (netKg * 2.20462) : netKg;

    updateElementWithHit(elements.grossWeightVal, displayGross.toFixed(2), displayGross, 0.02);
    if (elements.grossWeightUnit) elements.grossWeightUnit.textContent = state.unit;
    if (elements.tubeUnitLabel) elements.tubeUnitLabel.textContent = state.unit;
    updateElementWithHit(elements.netWeightVal, displayNet.toFixed(2), displayNet, 0.02);
    if (elements.netWeightUnit) elements.netWeightUnit.textContent = state.unit;

    if (elements.netDeductionFormula) {
      if (grossKg <= 0.001) {
        elements.netDeductionFormula.textContent = `0.00 ${state.unit} (Scale Zeroed / Platform Empty)`;
      } else {
        elements.netDeductionFormula.textContent = `${displayGross.toFixed(2)} ${state.unit} − ${displayTube.toFixed(2)} ${state.unit} tare`;
      }
    }

    if (elements.netFormulaExplainer) {
      elements.netFormulaExplainer.textContent = `${displayGross.toFixed(2)} ${state.unit} (Gross) - ${displayTube.toFixed(2)} ${state.unit} (Tube Tare) = ${displayNet.toFixed(2)} ${state.unit} (Pure Fabric)`;
    }

    // Length calculation based on pure fabric net weight
    let calculatedMeters = 0;
    let calculatedYards = 0;
    let yieldRatio = 0;

    if (netKg > 0 && active.gsm > 0 && active.widthMeters > 0) {
      // Length = (Net in grams) / (GSM * Width in meters)
      const netGrams = netKg * 1000;
      const areaSqMeters = netGrams / active.gsm;
      calculatedMeters = parseFloat((areaSqMeters / active.widthMeters).toFixed(2));
      calculatedYards = parseFloat((calculatedMeters * 1.09361).toFixed(2));

      if (active.targetLength > 0) {
        yieldRatio = parseFloat(((calculatedMeters / active.targetLength) * 100).toFixed(1));
      }
    }

    if (elements.calcMetersVal) updateElementWithHit(elements.calcMetersVal, calculatedMeters.toFixed(2), calculatedMeters, 0.04);
    if (elements.calcYardsVal) updateElementWithHit(elements.calcYardsVal, calculatedYards.toFixed(2), calculatedYards, 0.04);
    if (elements.targetYieldVal) elements.targetYieldVal.textContent = yieldRatio > 0 ? `${yieldRatio}%` : "—";
    if (elements.rollGsmYieldVal) elements.rollGsmYieldVal.textContent = active.gsm;

    // Quality Spec Check (if indicators are present)
    const expected = active.expectedNetWeight;
    if (elements.specVarianceText && elements.specStatusPill && elements.specStatusText) {
      if (netKg > 0.5 && expected > 0) {
        const variance = parseFloat((((netKg - expected) / expected) * 100).toFixed(2));
        const absVar = Math.abs(variance);
        const tolerance = active.tolerancePercent || 3.5;
        const sign = variance >= 0 ? "+" : "";
        elements.specVarianceText.textContent = `Variance: ${sign}${variance}% (Target: ${expected} kg, Tol: ±${tolerance}%)`;

        if (absVar <= tolerance) {
          elements.specStatusPill.className = "spec-status-pill";
          elements.specStatusPill.style.color = "var(--apple-green)";
          elements.specStatusText.innerHTML = `Within Tolerance Spec (${sign}${variance}%)`;
        } else if (absVar <= tolerance * 1.5) {
          elements.specStatusPill.className = "spec-status-pill out-of-range";
          elements.specStatusPill.style.color = "var(--apple-orange)";
          elements.specStatusText.innerHTML = `Borderline Variance (${sign}${variance}%)`;
        } else {
          elements.specStatusPill.className = "spec-status-pill out-of-range";
          elements.specStatusPill.style.color = "var(--apple-red)";
          elements.specStatusText.innerHTML = `Out of Specification (${sign}${variance}%)`;
        }
      } else {
        elements.specStatusText.innerHTML = `Scale Ready — Waiting for roll`;
        elements.specVarianceText.textContent = `Target: ${expected} kg (±${active.tolerancePercent}%)`;
      }
    }
  }

  /* =========================================================================
     Scale Sparkline Canvas Rendering
     ========================================================================= */
  function renderSparkline(history) {
    const canvas = elements.scaleSparkline;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    if (!history || history.length < 2) return;

    const maxVal = Math.max(...history, 35);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // Gradient background under curve
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isLight) {
      gradient.addColorStop(0, "rgba(0, 113, 227, 0.18)");
      gradient.addColorStop(1, "rgba(0, 113, 227, 0.0)");
    } else {
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    }

    ctx.beginPath();
    const step = width / (history.length - 1);

    for (let i = 0; i < history.length; i++) {
      const x = i * step;
      const y = height - ((history[i] - minVal) / range) * (height - 12) - 6;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevY = height - ((history[i - 1] - minVal) / range) * (height - 12) - 6;
        const cx = (prevX + x) / 2;
        ctx.bezierCurveTo(cx, prevY, cx, y, x, y);
      }
    }

    ctx.strokeStyle = isLight ? "rgba(0, 113, 227, 0.85)" : "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw active dot at head
    const lastX = width;
    const lastY = height - ((history[history.length - 1] - minVal) / range) * (height - 12) - 6;
    ctx.beginPath();
    ctx.arc(lastX - 2, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = state.isStable 
      ? (isLight ? "#0071e3" : "#ffffff") 
      : (isLight ? "rgba(0, 113, 227, 0.5)" : "rgba(255, 255, 255, 0.6)");
    ctx.fill();
    ctx.strokeStyle = isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* =========================================================================
     Scale Driver Subscription & Events
     ========================================================================= */
  window.scaleDriver.subscribe((scaleState) => {
    if (state.isTareZeroing) return; // Allow smooth ease-out countdown without sensor stutter
    state.grossWeight = scaleState.grossWeightKg !== undefined ? scaleState.grossWeightKg : scaleState.grossWeight;
    state.isStable = scaleState.isStable;

    // Stability Badge
    if (elements.readingStabilityBadge && elements.readingStabilityText) {
      if (scaleState.isStable) {
        elements.readingStabilityBadge.className = "reading-stability";
        elements.readingStabilityText.textContent = "Stable";
      } else {
        elements.readingStabilityBadge.className = "reading-stability motion";
        elements.readingStabilityText.textContent = "Motion";
      }
    }

    // Hardware status pill in navbar (if present)
    if (elements.scaleStatusDot && elements.scaleStatusText) {
      if (scaleState.isHardware) {
        elements.scaleStatusDot.className = "status-dot pulsing";
        elements.scaleStatusText.textContent = "USB Scale Active";
      } else {
        elements.scaleStatusDot.className = "status-dot simulated";
        elements.scaleStatusText.textContent = "Live Scale (Demo)";
      }
    }

    updateCalculations();
    renderSparkline(scaleState.history);
  });

  // Zero Scale Tare Button (Smooth Animated Tare Zero)
  elements.zeroScaleBtn.addEventListener("click", () => {
    performSmoothTareZero();
  });

  // Unit switcher (kg / lb)
  elements.unitBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.unitBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.unit = btn.getAttribute("data-unit");
      window.scaleDriver.setUnit(state.unit);

      // Synchronize tube weight input display with newly selected unit
      if (elements.tubeWeightInput) {
        const displayVal = state.unit === "lb" ? (state.currentTubeWeight * 2.20462).toFixed(2) : state.currentTubeWeight.toFixed(2);
        elements.tubeWeightInput.value = displayVal;
      }

      updateCalculations();
      pulseCalculatedOutputs();
    });
  });

  // Simulation Controls on live screen
  elements.simulatePlaceRollBtn.addEventListener("click", () => {
    const active = window.fabricStore.getActiveFabric();
    // Simulate realistic weight close to expected + random tiny variation
    const expected = active ? active.expectedNetWeight : 25.0;
    const tube = state.currentTubeWeight;
    const randomVariation = (Math.random() - 0.48) * 0.8;
    const rollGross = parseFloat((expected + tube + randomVariation).toFixed(2));
    
    window.scaleDriver.simulateRollPlaced(rollGross);
    showToast("Roll Placed on Scale", `Placed ${active ? active.name : "Fabric"} roll on digital load cell (~${rollGross} kg).`, "info");
  });

  if (elements.simulateRemoveRollBtn) {
    elements.simulateRemoveRollBtn.addEventListener("click", () => {
      window.scaleDriver.simulateRemoveRoll();
      state.grossWeight = 0.00;
      updateCalculations();
      pulseCalculatedOutputs();
      showToast("Roll Removed", "Digital scale platform is now empty (0.00 kg).", "info");
    });
  }

  /* =========================================================================
     Log & Save Roll to Inventory Action
     ========================================================================= */
  function initializeNextRollSequence() {
    if (elements.nextRollIdInput) elements.nextRollIdInput.value = window.inventoryStore.getNextRollId();
    if (elements.batchLotInput) elements.batchLotInput.value = state.batchLot;
    if (elements.operatorInput) elements.operatorInput.value = state.operatorName;
  }
  initializeNextRollSequence();

  if (elements.logRollBtn) {
    elements.logRollBtn.addEventListener("click", () => {
    const active = window.fabricStore.getActiveFabric();
    if (!active) {
      showToast("Error", "No active fabric selected.", "warning");
      return;
    }

    if (state.grossWeight < 0.2) {
      showToast("Scale Empty", "Please place a fabric roll on the scale before recording.", "warning");
      return;
    }

    const netKg = Math.max(0, parseFloat((state.grossWeight - state.currentTubeWeight).toFixed(2)));
    const netGrams = netKg * 1000;
    const calculatedMeters = parseFloat(((netGrams / active.gsm) / active.widthMeters).toFixed(2));
    const calculatedYards = parseFloat((calculatedMeters * 1.09361).toFixed(2));

    const rollData = {
      id: elements.nextRollIdInput.value.trim() || window.inventoryStore.getNextRollId(),
      fabricId: active.id,
      fabricCode: active.code,
      fabricName: active.name,
      grossWeight: state.grossWeight,
      tubeWeight: state.currentTubeWeight,
      expectedNetWeight: active.expectedNetWeight,
      tolerancePercent: active.tolerancePercent,
      calculatedLengthMeters: calculatedMeters,
      calculatedLengthYards: calculatedYards,
      batchLot: elements.batchLotInput.value.trim() || state.batchLot,
      operator: elements.operatorInput.value.trim() || state.operatorName
    };

    const saved = window.inventoryStore.logRoll(rollData);
    showToast("Roll Logged Successfully", `${saved.id} (${saved.netWeight} kg net) saved to inventory.`, "success");

    // Advance roll sequence
    initializeNextRollSequence();

    // Show label modal preview
    showLabelPreview(saved);
    });
  }

  /* =========================================================================
     Thermal Roll Label Preview & Printing
     ========================================================================= */
  function showLabelPreview(roll) {
    elements.labelContent.innerHTML = `
      <div class="roll-label-preview">
        <div class="roll-label-header">
          <div>
            <strong style="font-size: 16px;">FABRIC QUALITY PASS</strong><br>
            <span style="font-size: 11px;">TEXTILE INSPECTION STATION</span>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 14px;">${roll.id}</strong><br>
            <span style="font-size: 11px;">${new Date(roll.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        <div style="font-size: 13px; line-height: 1.6; margin: 10px 0;">
          <div><strong>FABRIC:</strong> ${roll.fabricCode} — ${roll.fabricName}</div>
          <div><strong>BATCH / LOT:</strong> ${roll.batchLot} | <strong>OPERATOR:</strong> ${roll.operator}</div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #ddd;">
            <div>GROSS: <strong>${roll.grossWeight.toFixed(2)} kg</strong></div>
            <div style="color: #b45309;">HOLE TUBE: <strong>-${roll.tubeWeight.toFixed(2)} kg</strong></div>
            <div style="color: #15803d; font-size: 15px;">NET FABRIC: <strong>${roll.netWeight.toFixed(2)} kg</strong></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px;">
            <div>CALC LENGTH: <strong>${roll.calculatedLengthMeters} m</strong> (${roll.calculatedLengthYards} yd)</div>
            <div>VARIANCE: <strong>${roll.variancePercent > 0 ? "+" : ""}${roll.variancePercent}%</strong></div>
          </div>
        </div>

        <svg class="barcode-svg" viewBox="0 0 240 40">
          <rect x="0" y="0" width="4" height="40" fill="#000"/>
          <rect x="6" y="0" width="2" height="40" fill="#000"/>
          <rect x="12" y="0" width="6" height="40" fill="#000"/>
          <rect x="22" y="0" width="2" height="40" fill="#000"/>
          <rect x="28" y="0" width="8" height="40" fill="#000"/>
          <rect x="40" y="0" width="3" height="40" fill="#000"/>
          <rect x="46" y="0" width="5" height="40" fill="#000"/>
          <rect x="56" y="0" width="2" height="40" fill="#000"/>
          <rect x="62" y="0" width="7" height="40" fill="#000"/>
          <rect x="74" y="0" width="3" height="40" fill="#000"/>
          <rect x="80" y="0" width="4" height="40" fill="#000"/>
          <rect x="88" y="0" width="6" height="40" fill="#000"/>
          <rect x="98" y="0" width="2" height="40" fill="#000"/>
          <rect x="104" y="0" width="8" height="40" fill="#000"/>
          <rect x="116" y="0" width="4" height="40" fill="#000"/>
          <rect x="124" y="0" width="5" height="40" fill="#000"/>
          <rect x="134" y="0" width="3" height="40" fill="#000"/>
          <rect x="142" y="0" width="7" height="40" fill="#000"/>
          <rect x="154" y="0" width="2" height="40" fill="#000"/>
          <rect x="160" y="0" width="6" height="40" fill="#000"/>
          <rect x="170" y="0" width="4" height="40" fill="#000"/>
          <rect x="180" y="0" width="8" height="40" fill="#000"/>
          <rect x="192" y="0" width="3" height="40" fill="#000"/>
          <rect x="200" y="0" width="5" height="40" fill="#000"/>
          <rect x="210" y="0" width="2" height="40" fill="#000"/>
          <rect x="216" y="0" width="6" height="40" fill="#000"/>
          <rect x="226" y="0" width="4" height="40" fill="#000"/>
        </svg>
        <div style="text-align: center; font-size: 10px; letter-spacing: 2px;">*${roll.id}-${roll.fabricCode}*</div>
      </div>
    `;
    elements.printLabelModal.classList.add("open");
  }

  elements.closeLabelModalBtn.addEventListener("click", () => {
    elements.printLabelModal.classList.remove("open");
  });

  elements.printLabelActionBtn.addEventListener("click", () => {
    window.print();
  });

  /* =========================================================================
     Fabric Catalog & Types Tab (Management)
     "here user can add the Add New Fabric Type and show it in below table
     where user can edit and changfe the type of fabric and also delete it"
     ========================================================================= */
  function renderFabricCatalog() {
    const list = window.fabricStore.getAll();
    const query = state.searchFabricQuery.toLowerCase();
    const activeFabric = window.fabricStore.getActiveFabric();

    const filtered = list.filter(f => {
      const matchCat = state.filterCategory === "all" || f.category.toLowerCase() === state.filterCategory.toLowerCase();
      const matchQuery = !query || 
        f.name.toLowerCase().includes(query) || 
        f.code.toLowerCase().includes(query) || 
        f.category.toLowerCase().includes(query) ||
        (f.composition && f.composition.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    // 1. Render Table View
    elements.fabricTableBody.innerHTML = "";
    if (filtered.length === 0) {
      elements.fabricTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
            No fabric types found matching "${query || state.filterCategory}". Add a new fabric above.
          </td>
        </tr>
      `;
    } else {
      const categories = getAllCategories();

      filtered.forEach(fabric => {
        const isSelected = activeFabric && activeFabric.id === fabric.id;
        const tr = document.createElement("tr");

        // Options for changing type of fabric directly in the table
        const categoryOptions = categories.map(cat => 
          `<option value="${cat}" ${fabric.category === cat ? "selected" : ""}>${cat}</option>`
        ).join("") + `<option value="__custom__">+ Custom...</option>`;

        tr.innerHTML = `
          <td>
            <div class="fabric-profile-cell">
              <div class="fabric-profile-meta">
                <span class="fabric-name-txt">${fabric.name}</span>
                <span class="fabric-code-txt">${fabric.code}</span>
              </div>
            </div>
          </td>
          <td>
            <select class="fabric-category-select-pill" title="Change Type of Fabric" data-id="${fabric.id}">
              ${categoryOptions}
            </select>
          </td>
          <td class="tabular-nums">
            <strong>${fabric.gsm}</strong> <span style="font-size: 11px; color: var(--text-tertiary);">g/m²</span>
          </td>
          <td class="tabular-nums">
            <strong>${fabric.widthMeters} m</strong> <span style="font-size: 11px; color: var(--text-tertiary);">(${Math.round(fabric.widthMeters * 39.3701)}")</span>
          </td>
          <td class="tabular-nums">
            <span class="table-tube-tare-badge">−${fabric.defaultTubeWeight.toFixed(2)} kg</span>
          </td>
          <td class="tabular-nums">
            <div>${fabric.targetLength} m</div>
            <div style="font-size: 11px; color: var(--text-tertiary);">~${fabric.expectedNetWeight} kg pure</div>
          </td>
          <td>
            ${isSelected ? '<span class="status-badge pass">● Active on Scale</span>' : '<span style="font-size: 11px; color: var(--text-tertiary);">Standby</span>'}
          </td>
          <td>
            <div class="table-actions-cell">
              <button class="btn-table-use ${isSelected ? 'active-now' : 'btn-select-fabric-row'}" data-id="${fabric.id}">
                ${isSelected ? 'Active' : 'Use on Scale'}
              </button>
              <button class="btn-table-action-icon btn-edit-fabric-row" title="Edit Fabric Specifications" data-id="${fabric.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-table-action-icon delete btn-delete-fabric-row" title="Delete Fabric Type" data-id="${fabric.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        `;

        // Direct Change Type of Fabric Event in table
        const catSelect = tr.querySelector(".fabric-category-select-pill");
        catSelect.addEventListener("change", (e) => {
          let newType = e.target.value;
          if (newType === "__custom__") {
            const custom = prompt("Enter custom fabric type / category:", "");
            if (!custom || !custom.trim()) {
              e.target.value = fabric.category;
              return;
            }
            newType = custom.trim();
          }
          window.fabricStore.changeFabricCategory(fabric.id, newType);
          showToast("Fabric Type Changed", `${fabric.name} is now classified as ${newType}.`, "success");
          syncActiveFabricDisplay();
          renderFabricCatalog();
        });

        // Use on Live Scale
        const selectBtn = tr.querySelector(".btn-select-fabric-row");
        if (selectBtn) {
          selectBtn.addEventListener("click", () => {
            window.fabricStore.setActiveFabric(fabric.id);
            syncActiveFabricDisplay();
            renderFabricCatalog();
            showToast("Active Fabric Set", `Scale calibrated for ${fabric.name} (${fabric.code}).`, "info");
          });
        }

        // Edit Fabric Row
        tr.querySelector(".btn-edit-fabric-row").addEventListener("click", () => {
          openEditFabricModal(fabric.id);
        });

        // Delete Fabric Row
        tr.querySelector(".btn-delete-fabric-row").addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete fabric "${fabric.name}" (${fabric.code}) from catalog?`)) {
            try {
              window.fabricStore.deleteFabric(fabric.id);
              showToast("Fabric Deleted", `Removed "${fabric.name}" from catalog.`, "info");
              syncActiveFabricDisplay();
              renderFabricCatalog();
            } catch (err) {
              showToast("Cannot Delete", err.message, "warning");
            }
          }
        });

        elements.fabricTableBody.appendChild(tr);
      });
    }

    // 2. Render Cards View (Alternative)
    elements.fabricCardsContainer.innerHTML = "";
    if (filtered.length > 0) {
      filtered.forEach(fabric => {
        const isSelected = activeFabric && activeFabric.id === fabric.id;
        const card = document.createElement("div");
        card.className = `fabric-card-item ${isSelected ? "selected-active" : ""}`;
        
        card.innerHTML = `
          <div class="fabric-card-top">
            <div class="fabric-card-title-group">
              <div class="fabric-card-swatch" style="background-color: ${fabric.colorHex || '#3b82f6'};">
                <span style="font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 0.04em;">${fabric.tag || fabric.code.slice(0, 3)}</span>
              </div>
              <div>
                <div class="fabric-card-code">${fabric.code} • ${fabric.category}</div>
                <div class="fabric-card-name">${fabric.name}</div>
              </div>
            </div>
            ${isSelected ? `<span class="status-badge pass">● Active on Scale</span>` : ""}
          </div>

          <div style="font-size: 12px; color: var(--text-secondary);">${fabric.composition || fabric.category}</div>

          <div class="fabric-spec-grid-mini">
            <div class="mini-spec">
              <span class="mini-spec-label">GSM</span>
              <span class="mini-spec-val">${fabric.gsm} g/m²</span>
            </div>
            <div class="mini-spec">
              <span class="mini-spec-label">Roll Width</span>
              <span class="mini-spec-val">${fabric.widthMeters} m</span>
            </div>
            <div class="mini-spec">
              <span class="mini-spec-label">Tube Tare</span>
              <span class="mini-spec-val tube-val">−${fabric.defaultTubeWeight.toFixed(2)} kg</span>
            </div>
            <div class="mini-spec">
              <span class="mini-spec-label">Target Length</span>
              <span class="mini-spec-val">${fabric.targetLength} m (~${fabric.expectedNetWeight}kg)</span>
            </div>
          </div>

          <div class="fabric-card-actions">
            <button class="apple-btn apple-btn-secondary btn-card-edit" data-id="${fabric.id}">
              Edit
            </button>
            <button class="apple-btn ${isSelected ? 'apple-btn-secondary' : 'apple-btn-primary'} btn-card-select" data-id="${fabric.id}">
              ${isSelected ? 'Selected' : 'Use on Scale'}
            </button>
            <button class="icon-btn btn-card-delete" data-id="${fabric.id}" title="Delete Fabric" style="color: var(--apple-red); width: 32px; height: 32px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `;

        card.querySelector(".btn-card-select").addEventListener("click", () => {
          window.fabricStore.setActiveFabric(fabric.id);
          syncActiveFabricDisplay();
          renderFabricCatalog();
          showToast("Active Fabric Changed", `Scale calibrated for ${fabric.name}.`, "info");
        });

        card.querySelector(".btn-card-edit").addEventListener("click", () => {
          openEditFabricModal(fabric.id);
        });

        card.querySelector(".btn-card-delete").addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete fabric "${fabric.name}"?`)) {
            try {
              window.fabricStore.deleteFabric(fabric.id);
              showToast("Fabric Deleted", `Removed "${fabric.name}".`, "info");
              syncActiveFabricDisplay();
              renderFabricCatalog();
            } catch (err) {
              showToast("Cannot Delete", err.message, "warning");
            }
          }
        });

        elements.fabricCardsContainer.appendChild(card);
      });
    }

    // Toggle Table vs Cards display
    if (state.fabricViewMode === "table") {
      elements.fabricTableCard.style.display = "block";
      elements.fabricCardsContainer.style.display = "none";
      elements.viewToggleTable.classList.add("active");
      elements.viewToggleCards.classList.remove("active");
    } else {
      elements.fabricTableCard.style.display = "none";
      elements.fabricCardsContainer.style.display = "grid";
      elements.viewToggleTable.classList.remove("active");
      elements.viewToggleCards.classList.add("active");
    }
  }

  // Fast Inline Add Fabric Form Submit
  if (elements.inlineAddFabricForm) {
    elements.inlineAddFabricForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        code: elements.quickFabricCode.value.trim(),
        name: elements.quickFabricName.value.trim(),
        category: elements.quickFabricCategory.value,
        gsm: elements.quickFabricGsm.value,
        widthMeters: elements.quickFabricWidth.value,
        defaultTubeWeight: elements.quickFabricTube.value,
        targetLength: elements.quickFabricLength.value,
        colorHex: elements.quickFabricColor.value
      };

      const added = window.fabricStore.addFabric(data);
      showToast("Fabric Created", `${added.name} added to catalog & table below.`, "success");

      // Reset form fields
      elements.quickFabricCode.value = "";
      elements.quickFabricName.value = "";
      elements.quickFabricGsm.value = "220";
      elements.quickFabricWidth.value = "1.50";
      elements.quickFabricTube.value = "0.85";
      elements.quickFabricLength.value = "50";

      syncActiveFabricDisplay();
      renderFabricCatalog();
    });
  }



  // View Switcher (Table vs Cards)
  if (elements.viewToggleTable && elements.viewToggleCards) {
    elements.viewToggleTable.addEventListener("click", () => {
      state.fabricViewMode = "table";
      renderFabricCatalog();
    });

    elements.viewToggleCards.addEventListener("click", () => {
      state.fabricViewMode = "cards";
      renderFabricCatalog();
    });
  }

  // Filter pills
  elements.categoryFilterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      elements.categoryFilterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.filterCategory = pill.getAttribute("data-category");
      renderFabricCatalog();
    });
  });

  // Search input
  elements.fabricSearchInput.addEventListener("input", (e) => {
    state.searchFabricQuery = e.target.value.trim();
    renderFabricCatalog();
  });

  /* =========================================================================
     Fabric Modal Form (Add / Edit) & Custom Categories
     ========================================================================= */
  function getAllCategories() {
    const base = ["Woven", "Denim", "Knit", "Silk", "Linen", "Technical", "Wool", "Blend"];
    const set = new Set(base);
    if (window.fabricStore) {
      window.fabricStore.getAll().forEach(f => {
        if (f.category) set.add(f.category);
      });
    }
    return Array.from(set);
  }

  function populateCategorySelect(selectedCategory) {
    const select = document.getElementById("fabricCategorySelect");
    const customWrapper = document.getElementById("customCategoryWrapper");
    const customInput = document.getElementById("customCategoryInput");
    if (!select) return;

    const categories = getAllCategories();
    if (selectedCategory && selectedCategory !== "__custom__" && !categories.includes(selectedCategory)) {
      categories.push(selectedCategory);
    }

    select.innerHTML = categories.map(cat => 
      `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`
    ).join("") + `<option value="__custom__">+ Add Custom Type...</option>`;

    if (selectedCategory === "__custom__") {
      select.value = "__custom__";
      if (customWrapper) customWrapper.style.display = "block";
      if (customInput) customInput.focus();
    } else {
      select.value = selectedCategory || categories[0];
      if (customWrapper) customWrapper.style.display = "none";
      if (customInput) customInput.value = "";
    }
  }

  // Handle Category select changes (toggle custom text field)
  const categorySelectEl = document.getElementById("fabricCategorySelect");
  const customCategoryWrapperEl = document.getElementById("customCategoryWrapper");
  const customCategoryInputEl = document.getElementById("customCategoryInput");
  if (categorySelectEl) {
    categorySelectEl.addEventListener("change", (e) => {
      if (e.target.value === "__custom__") {
        if (customCategoryWrapperEl) customCategoryWrapperEl.style.display = "block";
        if (customCategoryInputEl) {
          customCategoryInputEl.focus();
          customCategoryInputEl.required = true;
        }
      } else {
        if (customCategoryWrapperEl) customCategoryWrapperEl.style.display = "none";
        if (customCategoryInputEl) {
          customCategoryInputEl.required = false;
        }
      }
    });
  }

  function openAddFabricModal() {
    state.editingFabricId = null;
    elements.fabricModalTitle.textContent = "New Fabric Specification";
    elements.fabricForm.reset();
    populateCategorySelect("Woven");
    document.getElementById("fabricColorHex").value = "#3b82f6";
    document.getElementById("fabricDefaultTube").value = "0.85";
    document.getElementById("fabricTolerance").value = "3.5";
    if (elements.deleteFabricModalBtn) elements.deleteFabricModalBtn.style.display = "none";
    elements.fabricModal.classList.add("open");
  }

  function openEditFabricModal(id) {
    const fabric = window.fabricStore.getById(id);
    if (!fabric) return;

    state.editingFabricId = id;
    elements.fabricModalTitle.textContent = `Edit Fabric: ${fabric.code}`;
    
    document.getElementById("fabricCodeInput").value = fabric.code;
    document.getElementById("fabricNameInput").value = fabric.name;
    populateCategorySelect(fabric.category);
    document.getElementById("fabricCompositionInput").value = fabric.composition || "";
    document.getElementById("fabricGsmInput").value = fabric.gsm;
    document.getElementById("fabricWidthInput").value = fabric.widthMeters;
    document.getElementById("fabricDefaultTube").value = fabric.defaultTubeWeight;
    document.getElementById("fabricTargetLength").value = fabric.targetLength;
    document.getElementById("fabricTolerance").value = fabric.tolerancePercent;
    document.getElementById("fabricColorHex").value = fabric.colorHex || "#3b82f6";
    document.getElementById("fabricNotesInput").value = fabric.notes || "";

    if (elements.deleteFabricModalBtn) elements.deleteFabricModalBtn.style.display = "inline-flex";
    elements.fabricModal.classList.add("open");
  }

  elements.openAddFabricModalBtn.addEventListener("click", openAddFabricModal);
  elements.closeFabricModalBtn.addEventListener("click", () => elements.fabricModal.classList.remove("open"));
  elements.cancelFabricModalBtn.addEventListener("click", () => elements.fabricModal.classList.remove("open"));

  if (elements.deleteFabricModalBtn) {
    elements.deleteFabricModalBtn.addEventListener("click", () => {
      if (!state.editingFabricId) return;
      const fabric = window.fabricStore.getById(state.editingFabricId);
      if (!fabric) return;

      if (confirm(`Are you sure you want to delete fabric "${fabric.name}" (${fabric.code})?`)) {
        try {
          window.fabricStore.deleteFabric(fabric.id);
          elements.fabricModal.classList.remove("open");
          showToast("Fabric Deleted", `Removed "${fabric.name}" from catalog.`, "info");
          syncActiveFabricDisplay();
          renderFabricCatalog();
        } catch (err) {
          showToast("Cannot Delete", err.message, "warning");
        }
      }
    });
  }

  elements.fabricForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let categoryValue = document.getElementById("fabricCategorySelect").value;
    if (categoryValue === "__custom__") {
      const customEntered = document.getElementById("customCategoryInput")?.value.trim();
      categoryValue = customEntered || "Custom";
    }

    const data = {
      code: document.getElementById("fabricCodeInput").value,
      name: document.getElementById("fabricNameInput").value,
      category: categoryValue,
      composition: document.getElementById("fabricCompositionInput").value,
      gsm: document.getElementById("fabricGsmInput").value,
      widthMeters: document.getElementById("fabricWidthInput").value,
      defaultTubeWeight: document.getElementById("fabricDefaultTube").value,
      targetLength: document.getElementById("fabricTargetLength").value,
      tolerancePercent: document.getElementById("fabricTolerance").value,
      colorHex: document.getElementById("fabricColorHex").value,
      notes: document.getElementById("fabricNotesInput").value
    };

    if (state.editingFabricId) {
      window.fabricStore.updateFabric(state.editingFabricId, data);
      showToast("Fabric Updated", `${data.name} specs updated.`, "success");
    } else {
      const added = window.fabricStore.addFabric(data);
      showToast("Fabric Created", `${added.name} added to catalog.`, "success");
    }

    elements.fabricModal.classList.remove("open");
    syncActiveFabricDisplay();
    renderFabricCatalog();
  });

  /* =========================================================================
     Quick Fabric Switcher Modal (from Live Scale Screen)
     ========================================================================= */
  if (elements.quickSelectFabricBtn) {
    elements.quickSelectFabricBtn.addEventListener("click", () => {
      const list = window.fabricStore.getAll();
      elements.quickSelectFabricList.innerHTML = "";

      list.forEach(f => {
        const isSelected = window.fabricStore.getActiveFabric()?.id === f.id;
        const row = document.createElement("div");
        row.className = `fabric-quick-item ${isSelected ? "active" : ""}`;
        row.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        `;

        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: ${f.colorHex || '#3b82f6'}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 0.04em;">${f.tag || f.code.slice(0, 3)}</div>
            <div>
              <div style="font-weight: 600; font-size: 14px;">${f.name}</div>
              <div style="font-size: 11px; color: var(--text-tertiary);">${f.code} • ${f.gsm} g/m² • Tube Tare: ${f.defaultTubeWeight.toFixed(2)}kg</div>
            </div>
          </div>
          ${isSelected ? `<span style="font-size: 12px; color: var(--apple-green); font-weight: 600;">Selected</span>` : `<button class="apple-btn apple-btn-secondary" style="padding: 4px 10px; font-size: 11px;">Select</button>`}
        `;

        row.addEventListener("click", () => {
          window.fabricStore.setActiveFabric(f.id);
          syncActiveFabricDisplay();
          elements.quickSelectModal.classList.remove("open");
          showToast("Switched Fabric", `Now inspecting ${f.name}.`, "info");
        });

        elements.quickSelectFabricList.appendChild(row);
      });

      elements.quickSelectModal.classList.add("open");
    });
  }

  elements.closeQuickSelectBtn.addEventListener("click", () => {
    elements.quickSelectModal.classList.remove("open");
  });

  /* =========================================================================
     Inventory & Log Table Rendering
     ========================================================================= */
  function renderInventoryTable() {
    const rolls = window.inventoryStore.getAll();
    const metrics = window.inventoryStore.getMetrics();
    const query = state.inventorySearchQuery.toLowerCase();

    // KPIs
    elements.kpiTotalRolls.textContent = metrics.totalRolls;
    elements.kpiTotalNetKg.textContent = `${metrics.totalNetKg} kg`;
    elements.kpiAvgNetKg.textContent = `${metrics.avgNetKg} kg`;
    elements.kpiPassRate.textContent = `${metrics.passRate}%`;

    const filtered = rolls.filter(r => {
      if (!query) return true;
      return (
        r.id.toLowerCase().includes(query) ||
        r.fabricCode.toLowerCase().includes(query) ||
        r.fabricName.toLowerCase().includes(query) ||
        r.batchLot.toLowerCase().includes(query) ||
        r.operator.toLowerCase().includes(query)
      );
    });

    elements.inventoryTableBody.innerHTML = "";

    if (filtered.length === 0) {
      elements.inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
            No roll weigh sessions recorded yet. Place fabric on scale and click "Log & Save Roll".
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(roll => {
      const tr = document.createElement("tr");
      const sign = roll.variancePercent > 0 ? "+" : "";
      
      let badgeClass = "pass";
      let statusLabel = "Pass";
      if (roll.status === "warning") {
        badgeClass = "warning";
        statusLabel = "Warning";
      } else if (roll.status === "fail") {
        badgeClass = "fail";
        statusLabel = "Rejected";
      }

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--apple-blue);">${roll.id}</td>
        <td>
          <div style="font-weight: 600;">${roll.fabricCode}</div>
          <div style="font-size: 11px; color: var(--text-tertiary);">${roll.fabricName}</div>
        </td>
        <td class="tabular-nums">${roll.grossWeight.toFixed(2)} kg</td>
        <td class="tabular-nums" style="color: var(--apple-orange); font-weight: 600;">-${roll.tubeWeight.toFixed(2)} kg</td>
        <td class="tabular-nums" style="font-weight: 700; color: #ffffff;">${roll.netWeight.toFixed(2)} kg</td>
        <td class="tabular-nums">${roll.calculatedLengthMeters} m</td>
        <td class="tabular-nums" style="font-size: 12px;">${sign}${roll.variancePercent}%</td>
        <td><span class="status-badge ${badgeClass}">${statusLabel}</span></td>
        <td>
          <div style="font-size: 12px;">${roll.batchLot}</div>
          <div style="font-size: 10px; color: var(--text-tertiary);">${roll.operator}</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="icon-btn btn-print-row" title="Print Roll Label" style="width: 28px; height: 28px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </button>
            <button class="icon-btn btn-delete-row" title="Delete Roll" style="width: 28px; height: 28px; color: var(--apple-red);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector(".btn-print-row").addEventListener("click", () => showLabelPreview(roll));
      tr.querySelector(".btn-delete-row").addEventListener("click", () => {
        if (confirm(`Delete record for ${roll.id}?`)) {
          window.inventoryStore.deleteRoll(roll.id);
          renderInventoryTable();
          showToast("Deleted", `Removed ${roll.id} from inventory.`, "info");
        }
      });

      elements.inventoryTableBody.appendChild(tr);
    });
  }

  // Inventory search
  elements.inventorySearchInput.addEventListener("input", (e) => {
    state.inventorySearchQuery = e.target.value.trim();
    renderInventoryTable();
  });

  // Export CSV
  elements.exportCsvBtn.addEventListener("click", () => {
    try {
      window.inventoryStore.exportCSV();
      showToast("CSV Exported", "Inventory logs downloaded successfully.", "success");
    } catch (err) {
      showToast("Export Failed", err.message, "warning");
    }
  });

  // Clear all
  elements.clearInventoryBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all roll inventory records?")) {
      window.inventoryStore.clearAll();
      renderInventoryTable();
      showToast("Cleared", "All inventory logs cleared.", "info");
    }
  });

  /* =========================================================================
     Hardware Scale Serial Setup Modal
     ========================================================================= */
  if (elements.hardwareConnectBtn) {
    elements.hardwareConnectBtn.addEventListener("click", () => {
      elements.scaleHardwareModal.classList.add("open");
    });
  }

  if (elements.closeHardwareModalBtn) {
    elements.closeHardwareModalBtn.addEventListener("click", () => {
      elements.scaleHardwareModal.classList.remove("open");
    });
  }

  // Manual weight slider in hardware modal for testing
  elements.simWeightSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    elements.simWeightSliderVal.textContent = `${val.toFixed(1)} kg`;
    window.scaleDriver.setSimulatedTarget(val);
  });

  elements.confirmSerialConnectBtn.addEventListener("click", async () => {
    try {
      window.scaleDriver.baudRate = parseInt(elements.baudRateSelect.value, 10);
      await window.scaleDriver.connectHardware();
      elements.scaleHardwareModal.classList.remove("open");
      showToast("Scale Connected", "Physical USB Digital Scale connected via Web Serial.", "success");
    } catch (err) {
      console.warn("Serial connection canceled or failed:", err);
      showToast("Connection Note", err.message || "No serial scale selected. Continuing in high-precision simulated scale mode.", "warning");
    }
  });

  /* =========================================================================
     Industrial Login Portal Handlers (Matching Design Reference)
     ========================================================================= */
  const loginOverlay = document.getElementById("loginOverlay");
  const loginForm = document.getElementById("loginForm");
  const loginDemoBtn = document.getElementById("loginDemoBtn");
  const loginPassword = document.getElementById("loginPassword");
  const loginEyeToggleBtn = document.getElementById("loginEyeToggleBtn");

  function unlockAccessPortal() {
    if (loginOverlay) {
      loginOverlay.classList.add("hidden");
      sessionStorage.setItem("nishat_auth", "true");
    }
  }

  function lockAccessPortal() {
    if (loginOverlay) {
      loginOverlay.classList.remove("hidden");
      sessionStorage.removeItem("nishat_auth");
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      unlockAccessPortal();
      showToast("Access Granted", "Signed into Nishat Linen Operations Centre.", "success");
    });
  }

  if (loginDemoBtn) {
    loginDemoBtn.addEventListener("click", () => {
      unlockAccessPortal();
      showToast("Demo Access Active", "Operating in high-precision simulated environment.", "info");
    });
  }

  if (loginEyeToggleBtn && loginPassword) {
    loginEyeToggleBtn.addEventListener("click", () => {
      const isPass = loginPassword.type === "password";
      loginPassword.type = isPass ? "text" : "password";
      loginEyeToggleBtn.innerHTML = isPass
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  }

  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", () => {
      lockAccessPortal();
      showToast("Signed Out", "Portal session locked.", "info");
    });
  }

  // Check initial login session state
  if (sessionStorage.getItem("nishat_auth") === "true") {
    if (loginOverlay) loginOverlay.classList.add("hidden");
  } else {
    if (loginOverlay) loginOverlay.classList.remove("hidden");
  }

  /* =========================================================================
     Initial App Boot
     ========================================================================= */
  applyTheme(state.theme);
  syncActiveFabricDisplay();
  renderFabricCatalog();
  renderInventoryTable();
});
