/**
 * Automated Verification Script for ALOHA Dispersion Physics & Scenarios
 */

import { CHEMICALS, getChemicalById } from '../src/chemicals.js';
import {
  determineStabilityClass,
  calculateSigmas,
  calculateConcentrationGPerM3,
  convertGPerM3ToPpm,
  findThresholdDistance,
  calculatePlumeWidth,
  generateDistanceProfile
} from '../src/dispersion.js';
import {
  calculatePipeLeakScenario,
  calculateCylinderBreachScenario
} from '../src/scenarios.js';

console.log('--- RUNNING ALOHA DISPERSION MODEL VERIFICATION ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Chemicals verification
assert(CHEMICALS.length >= 7, `Chemical database loaded with ${CHEMICALS.length} chemicals`);
const chlorine = getChemicalById('chlorine');
assert(chlorine && chlorine.idlh === 10, 'Chlorine IDLH is correctly 10 ppm');
const ammonia = getChemicalById('ammonia');
assert(ammonia && ammonia.idlh === 300, 'Ammonia IDLH is correctly 300 ppm');

// 2. Stability class estimation
const stab1 = determineStabilityClass(1.5, 35, 'rural');
assert(stab1 === 'A', `Light wind (1.5 m/s) and high temp (35C) correctly resolves to Stability Class A (got ${stab1})`);
const stab2 = determineStabilityClass(4.0, 25, 'rural');
assert(stab2 === 'C', `Moderate wind (4.0 m/s) resolves to Stability Class C (got ${stab2})`);
const stab3 = determineStabilityClass(6.5, 25, 'urban');
assert(stab3 === 'D', `High wind (6.5 m/s) resolves to Stability Class D (got ${stab3})`);

// 3. Sigmas verification (positive and monotonic with distance)
const sigmas100 = calculateSigmas(100, 'D', 'rural');
const sigmas500 = calculateSigmas(500, 'D', 'rural');
assert(sigmas500.sigma_y > sigmas100.sigma_y, 'Plume width sigma_y increases monotonically downwind');
assert(sigmas500.sigma_z > sigmas100.sigma_z, 'Plume height sigma_z increases monotonically downwind');

// 4. Gaussian concentration & conversion
// For Q = 100 g/s, u = 3 m/s, H = 0, at x = 100m in rural Class D
const concG = calculateConcentrationGPerM3(100, 100, 3, 0, 'D', 'rural');
assert(concG > 0, `Concentration at 100m is positive: ${concG.toFixed(4)} g/m3`);
const concPpmCl2 = convertGPerM3ToPpm(concG, chlorine.mw, 30);
assert(concPpmCl2 > 0, `Converted Chlorine concentration is: ${concPpmCl2.toFixed(1)} ppm`);

// 5. Threshold distance solver
const redDistCl2 = findThresholdDistance(chlorine.idlh, 100, 3, 0, 'D', 'rural', chlorine.mw, 30);
assert(redDistCl2 > 100 && redDistCl2 < 5000, `Chlorine IDLH (10 ppm) distance solved within realistic bounds: ${redDistCl2} m`);

const yellowDistCl2 = findThresholdDistance(chlorine.idlh * 0.5, 100, 3, 0, 'D', 'rural', chlorine.mw, 30);
assert(yellowDistCl2 > redDistCl2, `Yellow zone distance (${yellowDistCl2}m) is strictly greater than Red zone distance (${redDistCl2}m)`);

// 6. Plume width
const widthAtHalf = calculatePlumeWidth(Math.round(redDistCl2 * 0.5), chlorine.idlh, 100, 3, 0, 'D', 'rural', chlorine.mw, 30);
assert(widthAtHalf > 0, `Plume crosswind width is positive: ${widthAtHalf} m`);

// 7. Scenarios verification
const pipeLeak = calculatePipeLeakScenario({ rateKgMin: 6, durationMin: 15, releaseHeightM: 1.5 });
assert(pipeLeak.emissionRateGPerSec === 100, `6 kg/min equals 100 g/s emission rate (got ${pipeLeak.emissionRateGPerSec} g/s)`);

const cylinderBreach = calculateCylinderBreachScenario({
  cylinderCapacityKg: 100,
  breachSizeMm: 15,
  operatingPressureBar: 8,
  releaseHeightM: 0.5
});
assert(cylinderBreach.emissionRateGPerSec > 0, `Cylinder breach emission rate calculated: ${cylinderBreach.emissionRateGPerSec} g/s`);
assert(cylinderBreach.releaseDurationMin > 0, `Cylinder discharge duration: ${cylinderBreach.releaseDurationMin} minutes`);

// 8. Distance profile check
const profile = generateDistanceProfile(100, 3, 0, 'D', 'rural', chlorine, 30);
assert(profile.length === 8, `Distance profile generated 8 checkpoints`);
assert(profile[0].concPpm > profile[profile.length - 1].concPpm, 'Centerline concentration decreases downwind');

console.log(`\nResults: ${passedTests} / ${totalTests} assertions passed successfully.`);
if (passedTests === totalTests) {
  console.log('ALL VERIFICATION CHECKS PASSED ✨');
}
