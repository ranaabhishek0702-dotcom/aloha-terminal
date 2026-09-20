#!/usr/bin/env node

/**
 * ALOHA Terminal Disaster Management Application
 * Ministry of Home Affairs - Industrial Hazard Evaluation System
 */

import chalk from 'chalk';
import { CHEMICALS, getChemicalById } from './src/chemicals.js';
import {
  calculatePipeLeakScenario,
  calculateCylinderBreachScenario
} from './src/scenarios.js';
import {
  determineStabilityClass,
  findThresholdDistance,
  calculatePlumeWidth,
  generateDistanceProfile
} from './src/dispersion.js';
import { printBanner, printSimulationResults } from './src/display.js';
import { promptSimulationWorkflow, promptRepeatOrExit } from './src/prompts.js';

async function main() {
  printBanner();

  let keepRunning = true;

  while (keepRunning) {
    try {
      // 1. Gather interactive parameters
      const { chemicalId, scenarioType, scenarioParams, weather } = await promptSimulationWorkflow();

      const chemical = getChemicalById(chemicalId);
      if (!chemical) {
        console.error(chalk.red(`Chemical ${chemicalId} not found.`));
        return;
      }

      // 2. Compute Release Scenario
      let scenario;
      if (scenarioType === 'pipe_leak') {
        scenario = calculatePipeLeakScenario({
          rateKgMin: parseFloat(scenarioParams.rateKgMin),
          durationMin: parseFloat(scenarioParams.durationMin),
          releaseHeightM: parseFloat(scenarioParams.releaseHeightM)
        });
      } else {
        scenario = calculateCylinderBreachScenario({
          cylinderCapacityKg: parseFloat(scenarioParams.cylinderCapacityKg),
          breachSizeMm: parseFloat(scenarioParams.breachSizeMm),
          operatingPressureBar: parseFloat(scenarioParams.operatingPressureBar),
          releaseHeightM: parseFloat(scenarioParams.releaseHeightM)
        });
      }

      // 3. Compute Atmospheric Stability
      const stabilityClass = determineStabilityClass(
        weather.windSpeed,
        weather.temperatureC,
        weather.terrain
      );
      weather.stabilityClass = stabilityClass;

      // 4. Compute Threat Zones
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

      // 5. Downwind concentration profile
      const profile = generateDistanceProfile(
        scenario.emissionRateGPerSec,
        weather.windSpeed,
        scenario.releaseHeightM,
        stabilityClass,
        weather.terrain,
        chemical,
        weather.temperatureC
      );

      // 6. Display formatted tables & instructions
      printSimulationResults({
        chemical,
        scenario,
        weather,
        results,
        profile
      });

      // 7. Check if user wants another run
      keepRunning = await promptRepeatOrExit();
      if (keepRunning) {
        printBanner();
      }
    } catch (err) {
      if (err.name === 'ExitPromptError' || err.message?.includes('User force closed')) {
        console.log(chalk.gray('\nSimulation session ended by user.'));
        break;
      }
      console.error(chalk.red('Error during simulation:'), err);
      break;
    }
  }

  console.log(chalk.bold.greenBright('\n[MHA ALOHA] Incident analysis concluded. Stay safe!'));
}

main();
