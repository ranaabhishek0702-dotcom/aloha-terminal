/**
 * Interactive Prompts Handler for Guided Simulation Workflow
 */

import inquirer from 'inquirer';
import { CHEMICALS } from './chemicals.js';
import { SCENARIO_TYPES } from './scenarios.js';

export async function promptSimulationWorkflow() {
  // Step 1: Select Chemical
  const chemicalChoices = CHEMICALS.map(c => ({
    name: `${c.name} [${c.formula}] - IDLH: ${c.idlh} ppm (${c.toxicClassification})`,
    value: c.id
  }));

  const { chemicalId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'chemicalId',
      message: 'Select hazardous industrial chemical:',
      choices: chemicalChoices,
      default: 'chlorine'
    }
  ]);

  // Step 2: Select Scenario
  const scenarioChoices = SCENARIO_TYPES.map(s => ({
    name: `${s.name} - ${s.description}`,
    value: s.id
  }));

  const { scenarioType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scenarioType',
      message: 'Select release incident scenario:',
      choices: scenarioChoices,
      default: 'pipe_leak'
    }
  ]);

  // Step 3: Scenario Parameters
  let scenarioParams = {};
  if (scenarioType === 'pipe_leak') {
    scenarioParams = await inquirer.prompt([
      {
        type: 'input',
        name: 'rateKgMin',
        message: 'Enter continuous release rate (kg/min):',
        default: '5.0',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ? true : 'Please enter a valid positive number'
      },
      {
        type: 'input',
        name: 'durationMin',
        message: 'Enter estimated release duration (minutes):',
        default: '30',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ? true : 'Please enter a valid positive number'
      },
      {
        type: 'input',
        name: 'releaseHeightM',
        message: 'Enter release elevation above ground (meters):',
        default: '1.0',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) >= 0) ? true : 'Please enter a valid non-negative number'
      }
    ]);
  } else {
    // cylinder_breach
    scenarioParams = await inquirer.prompt([
      {
        type: 'input',
        name: 'cylinderCapacityKg',
        message: 'Enter total cylinder content capacity (kg):',
        default: '100',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ? true : 'Please enter a valid positive number'
      },
      {
        type: 'input',
        name: 'breachSizeMm',
        message: 'Enter equivalent breach hole diameter (mm):',
        default: '15',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ? true : 'Please enter a valid positive number'
      },
      {
        type: 'input',
        name: 'operatingPressureBar',
        message: 'Enter cylinder storage pressure (bar):',
        default: '8.0',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ? true : 'Please enter a valid positive number'
      },
      {
        type: 'input',
        name: 'releaseHeightM',
        message: 'Enter cylinder breach elevation (meters):',
        default: '0.5',
        validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) >= 0) ? true : 'Please enter a valid non-negative number'
      }
    ]);
  }

  // Step 4: Weather & Environmental Inputs
  const weatherAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'temperatureC',
      message: 'Enter ambient temperature (°C):',
      default: '32',
      validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) >= -20 && parseFloat(val) <= 60)
        ? true : 'Please enter realistic temperature (-20°C to 60°C)'
    },
    {
      type: 'input',
      name: 'humidity',
      message: 'Enter ambient relative humidity (%):',
      default: '60',
      validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100)
        ? true : 'Please enter humidity between 0 and 100%'
    },
    {
      type: 'list',
      name: 'terrain',
      message: 'Select terrain type:',
      choices: [
        { name: 'Rural / Open Flat Ground (Agricultural, Open Field)', value: 'rural' },
        { name: 'Urban / Industrial Built-Up (Factories, Structures, Obstacles)', value: 'urban' }
      ],
      default: 'rural'
    },
    {
      type: 'input',
      name: 'windSpeed',
      message: 'Enter wind speed (m/s):',
      default: '3.0',
      validate: val => (!isNaN(parseFloat(val)) && parseFloat(val) > 0)
        ? true : 'Please enter a positive wind speed (m/s)'
    },
    {
      type: 'input',
      name: 'windDirection',
      message: 'Enter wind direction (e.g. NW, East, 270°):',
      default: 'NW'
    }
  ]);

  return {
    chemicalId,
    scenarioType,
    scenarioParams,
    weather: {
      temperatureC: parseFloat(weatherAnswers.temperatureC),
      humidity: parseFloat(weatherAnswers.humidity),
      terrain: weatherAnswers.terrain,
      windSpeed: parseFloat(weatherAnswers.windSpeed),
      windDirection: weatherAnswers.windDirection.toUpperCase().trim()
    }
  };
}

export async function promptRepeatOrExit() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do next?',
      choices: [
        { name: '🔄 Run another hazard simulation', value: 'repeat' },
        { name: '❌ Exit ALOHA application', value: 'exit' }
      ]
    }
  ]);
  return action === 'repeat';
}
