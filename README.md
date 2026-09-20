# ALOHA - Areal Location of Hazardous Atmosphere (Terminal Disaster Management System)

**Source Metadata:**
- **Year**: 2023
- **Domain / Technology Bucket**: Disaster Management
- **Category (SW/HW)**: Software
- **Organization**: Ministry of Home Affairs (MHA) / Disaster Management Cell

---

## Overview
This terminal-based application estimates the atmospheric dispersion of hazardous and toxic chemical releases in industrial accident scenarios. Built using Node.js and Gaussian Plume dispersion equations, the tool provides rapid threat zone estimation (IDLH levels) and emergency response advisories for disaster response teams and industrial safety officers.

---

## Features
- **Hazardous Chemical Registry**: Pre-configured with major industrial chemicals:
  - Chlorine ($\text{Cl}_2$) - IDLH: 10 ppm
  - Ammonia ($\text{NH}_3$) - IDLH: 300 ppm
  - Hydrogen Sulfide ($\text{H}_2\text{S}$) - IDLH: 100 ppm
  - Sulfur Dioxide ($\text{SO}_2$) - IDLH: 100 ppm
  - Phosgene ($\text{COCl}_2$) - IDLH: 2 ppm
  - Methyl Isocyanate (MIC) - IDLH: 3 ppm
  - Liquefied Petroleum Gas (LPG / Propane) - IDLH/Safety threshold: 2100 ppm
- **Release Scenarios**:
  1. *Continuous Pipe Leak*: Steady-state mass discharge from piping manifolds.
  2. *Pressurized Gas Cylinder Breach*: Choked orifice discharge model for storage cylinders and ton-containers.
- **Atmospheric Modeling**:
  - Gaussian Plume Dispersion Model ($C(x, y, z)$).
  - Pasquill-Gifford stability class estimation (A to F) based on wind speed, temperature, and terrain.
  - Urban/Industrial vs Rural/Flat terrain Briggs coefficient adjustments.
- **Color-Coded Threat Zones**:
  - 🔴 **Red Zone (Hot / IDLH)**: $\ge \text{IDLH}$. Immediate life threat, full evacuation perimeter, Level-A SCBA mandatory.
  - 🟡 **Yellow Zone (Warm / Advisory)**: $50\% - 100\% \text{IDLH}$. Injury hazard, shelter-in-place advisory.
  - 🟢 **Green Zone (Cold / Buffer)**: Safe boundary for incident command post and triage.
- **Centerline Downwind Distance Profile**: Concentration milestones from 25m to 5,000m in both ppm and $\text{mg/m}^3$.
- **First Responder Action Guides**: Immediate tactical guidance, health hazard alerts, and wind-relative evacuation vectors.

---

## Installation & Running

### Prerequisites
- Node.js (v18 or higher)
- npm

### Launching the Application
In your terminal, navigate to the project root and run:

```bash
npm start
```

Or run directly:

```bash
node index.js
```

### Running Automated Verification Tests
```bash
npm test
```

---

## Project Structure
```
terminal_project/
├── index.js                  # CLI Entry point & workflow loop
├── package.json              # App configuration & scripts
├── README.md                 # Project documentation
├── src/
│   ├── chemicals.js          # Chemical properties & NIOSH IDLH data
│   ├── dispersion.js         # Gaussian Plume physics & bisection solvers
│   ├── scenarios.js          # Release emission rate models
│   ├── display.js           # Colored tables & tactical output rendering
│   └── prompts.js            # Guided interactive Inquirer prompts
└── test/
    ├── verify_dispersion.js  # Automated mathematical validation tests
    └── demo_run.js           # Non-interactive test demonstration
```
