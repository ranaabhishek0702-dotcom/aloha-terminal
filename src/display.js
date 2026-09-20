/**
 * Terminal UI and Tabular Display Component
 * Formats ALOHA dispersion calculations into color-coded tables for emergency disaster management.
 */

import chalk from 'chalk';
import Table from 'cli-table3';

export function printBanner() {
  console.clear();
  console.log(chalk.bold.redBright('================================================================================'));
  console.log(chalk.bold.whiteBright('       MINISTRY OF HOME AFFAIRS (MHA) - DISASTER MANAGEMENT CELL'));
  console.log(chalk.bold.cyanBright('          ALOHA: Areal Location of Hazardous Atmosphere (Terminal)'));
  console.log(chalk.gray('              Atmospheric Dispersion & Threat Zone Estimator (2023)'));
  console.log(chalk.bold.redBright('================================================================================\n'));
}

export function printSimulationResults({
  chemical,
  scenario,
  weather,
  results,
  profile
}) {
  console.log(chalk.bold.cyan('\n--------------------------------------------------------------------------------'));
  console.log(chalk.bold.whiteBright('               INCIDENT SIMULATION & HAZARD EVALUATION REPORT'));
  console.log(chalk.bold.cyan('--------------------------------------------------------------------------------\n'));

  // Table 1: Chemical & Environmental Conditions
  const incidentTable = new Table({
    head: [chalk.bold.yellow('Parameter Category'), chalk.bold.yellow('Configuration & Input Value')],
    colWidths: [32, 48],
    wordWrap: true
  });

  incidentTable.push(
    [chalk.bold('Chemical Name'), chalk.bold.magentaBright(`${chemical.name} (${chemical.formula})`)],
    ['CAS Registry Number', chemical.cas],
    ['Molecular Weight', `${chemical.mw} g/mol`],
    ['NIOSH IDLH Threshold', chalk.bold.redBright(`${chemical.idlh} ppm`)],
    ['Classification', chemical.toxicClassification],
    ['Release Scenario', chalk.whiteBright(scenario.scenarioLabel)],
    ['Source Emission Rate (Q)', chalk.whiteBright(`${scenario.emissionRateGPerSec} g/s (${scenario.rateKgMin} kg/min)`)],
    ['Release Height (H)', `${scenario.releaseHeightM} meters above ground`],
    ['Estimated Release Duration', `${scenario.releaseDurationMin} minutes`],
    ['Ambient Temperature', `${weather.temperatureC} °C`],
    ['Relative Humidity', `${weather.humidity}%`],
    ['Wind Speed & Direction', `${weather.windSpeed} m/s (Bearing: ${weather.windDirection})`],
    ['Terrain Classification', weather.terrain.toUpperCase()],
    ['Atmospheric Stability Class', chalk.bold.cyan(`Class ${weather.stabilityClass}`)]
  );

  console.log(chalk.bold.underline.white('1. Incident & Atmospheric Parameters:'));
  console.log(incidentTable.toString());
  console.log('\n');

  // Table 2: Threat Zones Summary (Red, Yellow, Green)
  const threatTable = new Table({
    head: [
      chalk.bold('Threat Zone Level'),
      chalk.bold('Threshold (ppm)'),
      chalk.bold('Downwind Distance (Radius)'),
      chalk.bold('Max Plume Width'),
      chalk.bold('Tactical Response Directive')
    ],
    colWidths: [20, 16, 22, 16, 32],
    wordWrap: true
  });

  const redDist = results.redZoneDistanceMeters > 0 ? `${results.redZoneDistanceMeters} meters` : 'Localized (<5m)';
  const yellowDist = results.yellowZoneDistanceMeters > 0 ? `${results.yellowZoneDistanceMeters} meters` : 'Localized (<5m)';
  const safeDist = results.safeDistanceMeters > 0 ? `Beyond ${results.safeDistanceMeters} m` : 'At Source';

  threatTable.push(
    [
      chalk.bold.redBright('🔴 RED ZONE\n(HOT / IDLH)'),
      chalk.redBright(`≥ ${chemical.idlh} ppm`),
      chalk.bold.redBright(redDist),
      results.redPlumeWidthMeters ? `${results.redPlumeWidthMeters} meters` : 'N/A',
      chalk.redBright('IMMEDIATE LIFE THREAT.\nEvacuate perimeter immediately. Level-A / SCBA gear mandatory.')
    ],
    [
      chalk.bold.yellowBright('🟡 YELLOW ZONE\n(WARM / ADVISORY)'),
      chalk.yellowBright(`${chemical.idlh * 0.5} - ${chemical.idlh} ppm`),
      chalk.bold.yellowBright(yellowDist),
      results.yellowPlumeWidthMeters ? `${results.yellowPlumeWidthMeters} meters` : 'N/A',
      chalk.yellowBright('POTENTIAL INJURY THREAT.\nShelter in place, seal doors/windows. Sensitive groups evacuate.')
    ],
    [
      chalk.bold.greenBright('🟢 GREEN ZONE\n(COLD / BUFFER)'),
      chalk.greenBright(`< ${chemical.idlh * 0.5} ppm`),
      chalk.bold.greenBright(safeDist),
      'Dispersed',
      chalk.greenBright('BASELINE SAFE PERIMETER.\nEstablish command post, triage, and staging area upwind.')
    ]
  );

  console.log(chalk.bold.underline.white('2. Chemical Threat Zone Assessment:'));
  console.log(threatTable.toString());
  console.log('\n');

  // Table 3: Downwind Concentration Profile Table
  const profileTable = new Table({
    head: [
      chalk.bold('Distance Downwind'),
      chalk.bold('Concentration (ppm)'),
      chalk.bold('Concentration (mg/m³)'),
      chalk.bold('Hazard Classification')
    ],
    colWidths: [22, 22, 24, 24],
    wordWrap: true
  });

  for (const step of profile) {
    let coloredLevel = step.dangerLevel;
    let coloredPpm = `${step.concPpm} ppm`;
    if (step.dangerLevel.includes('RED')) {
      coloredLevel = chalk.bold.redBright(step.dangerLevel);
      coloredPpm = chalk.bold.redBright(coloredPpm);
    } else if (step.dangerLevel.includes('YELLOW')) {
      coloredLevel = chalk.bold.yellowBright(step.dangerLevel);
      coloredPpm = chalk.bold.yellowBright(coloredPpm);
    } else {
      coloredLevel = chalk.green(step.dangerLevel);
      coloredPpm = chalk.green(coloredPpm);
    }

    profileTable.push([
      `${step.distanceMeters} meters`,
      coloredPpm,
      `${step.concMgM3} mg/m³`,
      coloredLevel
    ]);
  }

  console.log(chalk.bold.underline.white('3. Centerline Downwind Concentration Profile:'));
  console.log(profileTable.toString());
  console.log('\n');

  // Table 4: Responder Guidance & First Action
  console.log(chalk.bold.underline.white('4. First Responder & Disaster Management Protocols:'));
  console.log(chalk.bold.redBright(`[CRITICAL ACTION]: `) + chalk.whiteBright(chemical.firstAction));
  console.log(chalk.bold.yellow(`[HEALTH WARNING]: `) + chalk.white(chemical.healthHazards));
  console.log(chalk.bold.cyan(`[EVACUATION VECTOR]: `) + chalk.whiteBright(`Evacuate PERPENDICULAR to wind direction (${weather.windDirection}) towards UPWIND high ground.`));
  console.log(chalk.bold.cyan('--------------------------------------------------------------------------------\n'));
}
