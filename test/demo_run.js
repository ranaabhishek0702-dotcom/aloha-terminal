import { CHEMICALS, getChemicalById } from '../src/chemicals.js';
import { calculatePipeLeakScenario } from '../src/scenarios.js';
import {
  determineStabilityClass,
  findThresholdDistance,
  calculatePlumeWidth,
  generateDistanceProfile
} from '../src/dispersion.js';
import { printBanner, printSimulationResults } from '../src/display.js';

printBanner();

const chemical = getChemicalById('chlorine');
const weather = {
  temperatureC: 32,
  humidity: 65,
  terrain: 'rural',
  windSpeed: 3.5,
  windDirection: 'NE'
};

const scenario = calculatePipeLeakScenario({
  rateKgMin: 5.0,
  durationMin: 20,
  releaseHeightM: 1.0
});

const stabilityClass = determineStabilityClass(weather.windSpeed, weather.temperatureC, weather.terrain);
weather.stabilityClass = stabilityClass;

const redZoneDist = findThresholdDistance(
  chemical.idlh,
  scenario.emissionRateGPerSec,
  weather.windSpeed,
  scenario.releaseHeightM,
  stabilityClass,
  weather.terrain,
  chemical.mw,
  weather.temperatureC
);

const yellowZoneDist = findThresholdDistance(
  chemical.idlh * 0.5,
  scenario.emissionRateGPerSec,
  weather.windSpeed,
  scenario.releaseHeightM,
  stabilityClass,
  weather.terrain,
  chemical.mw,
  weather.temperatureC
);

const redPlumeWidth = calculatePlumeWidth(
  Math.max(10, Math.round(redZoneDist * 0.5)),
  chemical.idlh,
  scenario.emissionRateGPerSec,
  weather.windSpeed,
  scenario.releaseHeightM,
  stabilityClass,
  weather.terrain,
  chemical.mw,
  weather.temperatureC
);

const yellowPlumeWidth = calculatePlumeWidth(
  Math.max(10, Math.round(yellowZoneDist * 0.5)),
  chemical.idlh * 0.5,
  scenario.emissionRateGPerSec,
  weather.windSpeed,
  scenario.releaseHeightM,
  stabilityClass,
  weather.terrain,
  chemical.mw,
  weather.temperatureC
);

const results = {
  redZoneDistanceMeters: redZoneDist,
  yellowZoneDistanceMeters: yellowZoneDist,
  safeDistanceMeters: yellowZoneDist,
  redPlumeWidthMeters: redPlumeWidth,
  yellowPlumeWidthMeters: yellowPlumeWidth
};

const profile = generateDistanceProfile(
  scenario.emissionRateGPerSec,
  weather.windSpeed,
  scenario.releaseHeightM,
  stabilityClass,
  weather.terrain,
  chemical,
  weather.temperatureC
);

printSimulationResults({ chemical, scenario, weather, results, profile });
