/**
 * Release Scenario Estimator
 * Models emission rates (Q in g/s) for industrial accident scenarios.
 */

export const SCENARIO_TYPES = [
  {
    id: 'pipe_leak',
    name: 'Continuous Pipe Leak (Steady-State Release)',
    description: 'Continuous chemical discharge from process piping or manifold flange failure.'
  },
  {
    id: 'cylinder_breach',
    name: 'Toxic Gas Cylinder Breach (Pressurized Vessel Leak)',
    description: 'Breach/rupture of pressurized gas storage cylinder or ton-container valve.'
  }
];

/**
 * Compute emission rate Q (g/s) and effective duration for a continuous pipe leak.
 * 
 * @param {Object} params
 * @param {number} params.rateKgMin - Release rate in kg/minute (or kg/s)
 * @param {number} params.durationMin - Release duration in minutes
 * @param {number} params.releaseHeightM - Elevation of pipe leak above ground
 * @returns {Object} Scenario emission result
 */
export function calculatePipeLeakScenario({ rateKgMin, durationMin = 30, releaseHeightM = 1.0 }) {
  // Convert kg/min to g/s: (kg * 1000) / 60
  const rateGramsPerSec = (rateKgMin * 1000) / 60;
  const totalMassKg = rateKgMin * durationMin;

  return {
    scenarioType: 'pipe_leak',
    scenarioLabel: 'Continuous Industrial Pipe Leak',
    emissionRateGPerSec: Math.round(rateGramsPerSec * 100) / 100,
    rateKgMin: Number(rateKgMin),
    releaseDurationMin: Number(durationMin),
    totalMassReleasedKg: Math.round(totalMassKg * 10) / 10,
    releaseHeightM: Number(releaseHeightM)
  };
}

/**
 * Compute emission rate Q (g/s) for a pressurized cylinder or ton-container breach.
 * 
 * Can accept direct discharge rate or estimate based on cylinder mass & breach orifice.
 * 
 * @param {Object} params
 * @param {number} params.cylinderCapacityKg - Total cylinder content mass in kg
 * @param {number} params.breachSizeMm - Equivalent breach hole diameter (mm)
 * @param {number} params.operatingPressureBar - Cylinder storage pressure in bar
 * @param {number} params.releaseHeightM - Elevation of breach
 * @returns {Object} Scenario emission result
 */
export function calculateCylinderBreachScenario({
  cylinderCapacityKg = 100,
  breachSizeMm = 15,
  operatingPressureBar = 8,
  releaseHeightM = 0.5
}) {
  // Choked flow estimation for compressed gas / vapor discharge
  // Approximate mass flux for typical industrial toxic gases:
  // Area = pi * (d / 2)^2 in m^2
  const diameterM = breachSizeMm / 1000;
  const areaM2 = Math.PI * Math.pow(diameterM / 2, 2);
  const pressurePa = operatingPressureBar * 100000;
  
  // Approximate orifice gas discharge: Q_kg_s ~ Cd * A * P * sqrt(M / (R * T))
  // Cd ~ 0.62, average factor gives ~ 200 to 400 kg/(s * m^2 * bar)
  const dischargeCoefficient = 0.62;
  const estimatedRateKgSec = Math.max(0.05, dischargeCoefficient * areaM2 * pressurePa * 0.0022);
  
  // Cap discharge rate so release duration is physically realistic
  const rateKgSec = Math.min(cylinderCapacityKg / 10, estimatedRateKgSec);
  const rateGramsPerSec = rateKgSec * 1000;
  const dischargeDurationSec = cylinderCapacityKg / rateKgSec;
  const dischargeDurationMin = Math.round((dischargeDurationSec / 60) * 10) / 10;

  return {
    scenarioType: 'cylinder_breach',
    scenarioLabel: 'Pressurized Gas Cylinder Breach',
    emissionRateGPerSec: Math.round(rateGramsPerSec * 100) / 100,
    rateKgMin: Math.round((rateKgSec * 60) * 10) / 10,
    cylinderCapacityKg: Number(cylinderCapacityKg),
    breachSizeMm: Number(breachSizeMm),
    operatingPressureBar: Number(operatingPressureBar),
    releaseDurationMin: dischargeDurationMin,
    totalMassReleasedKg: Number(cylinderCapacityKg),
    releaseHeightM: Number(releaseHeightM)
  };
}
