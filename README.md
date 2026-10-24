# Fabric Scale & Inventory Management Terminal

An industrial-grade digital scale and textile inventory management system built with an Apple-inspired glassmorphic interface. Supports physical USB/Serial load cell scales via the Web Serial API as well as high-fidelity real-time physics simulation.

## Features

- **Live Digital Scale Terminal**:
  - Real-time gross weight readout with rolling digit odometer animations.
  - Interactive hit zoom-in count effects (vibrant Apple Green on weight/length additions, Apple Red on losses).
  - Smooth 60fps cubic ease-out tare zero countdown settling into `0.00`.
  - Real-time load cell waveform sparkline.
- **Precision Textile Calculation Engine**:
  - Live adjustable hole tube core tare deduction with stepper controls.
  - Pure net fabric weight calculation.
  - Calculated length in meters: `Length = (Net Grams) / (Width × GSM)`.
  - Equivalent US yardage with automatic unit conversions (`kg` and `lb`).
- **Hardware & Simulation**:
  - Web Serial API driver for RS232 / USB digital scale communication (CAS, Toledo, Ohaus, Avery, etc.).
  - Built-in spring-damped load cell physics simulator for live testing without physical hardware.
- **Fabric Catalog & Specification Management**:
  - Standard GSM, fabric categories, default tube tares, roll widths, and swatch color profiles.
- **Roll Inventory & Audit Logging**:
  - Barcode label previews, batch/lot tracking, operator logging, and CSV export.

## Tech Stack

- Vanilla JavaScript (ES6+ Modules)
- Vanilla CSS with Apple design tokens (dark & light mode support)
- Web Serial API for hardware scale communication
- Vite for local development

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Ahmad-Abudllah-Ahmad/fabric-scale.git
   cd fabric-scale
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
