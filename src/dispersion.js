/**
 * Atmospheric Dispersion Engine - Gaussian Plume Model
 * Designed for Industrial Chemical Hazard Assessment (ALOHA Framework)
 */

/**
 * Estimate Pasquill-Gifford atmospheric stability class (A through F)
 * based on wind speed, ambient conditions, and terrain.
 */
export function determineStabilityClass(windSpeed, temperatureC, terrain = 'rural') {
  // Classification standard based on wind speed and daytime insolation
  if (windSpeed < 2) {
    return temperatureC > 30 ? 'A' : 'B';
  } else if (windSpeed >= 2 && windSpeed < 3) {
    return temperatureC > 25 ? 'B' : 'C';
  } else if (windSpeed >= 3 && windSpeed < 5) {
    return 'C';
  } else if (windSpeed >= 5 && windSpeed < 6) {
    return 'D';
  } else {
    return 'D'; // High winds induce neutral mechanical turbulence
  }
}

/**
 * Compute Briggs dispersion coefficients sigma_y and sigma_z (in meters)
 * based on downwind distance x (meters), stability class, and terrain type.
 */
export function calculateSigmas(x, stabilityClass = 'D', terrain = 'rural') {
  const isUrban = terrain.toLowerCase().includes('urban') || terrain.toLowerCase().includes('industrial');
  let sigma_y = 0;
  let sigma_z = 0;

  if (isUrban) {
    switch (stabilityClass.toUpperCase()) {
      case 'A':
      case 'B':
        sigma_y = 0.32 * x * Math.pow(1 + 0.0004 * x, -0.5);
        sigma_z = 0.24 * x * Math.pow(1 + 0.001 * x, 0.5);
        break;
      case 'C':
        sigma_y = 0.22 * x * Math.pow(1 + 0.0004 * x, -0.5);
        sigma_z = 0.20 * x;
        break;
      case 'D':
      default:
        sigma_y = 0.16 * x * Math.pow(1 + 0.0004 * x, -0.5);
        sigma_z = 0.14 * x * Math.pow(1 + 0.0003 * x, -0.5);
        break;
      case 'E':
      case 'F':
        sigma_y = 0.11 * x * Math.pow(1 + 0.0004 * x, -0.5);
        sigma_z = 0.08 * x * Math.pow(1 + 0.0015 * x, -0.5);
        break;
    }
  } else {
    // Rural / open / flat terrain
    switch (stabilityClass.toUpperCase()) {
      case 'A':
        sigma_y = 0.22 * x * Math.pow(1 + 0.0001 * x, -0.5);
        sigma_z = 0.20 * x;
        break;
      case 'B':
        sigma_y = 0.16 * x * Math.pow(1 + 0.0001 * x, -0.5);
        sigma_z = 0.12 * x;
        break;
      case 'C':
        sigma_y = 0.11 * x * Math.pow(1 + 0.0001 * x, -0.5);
        sigma_z = 0.08 * x * Math.pow(1 + 0.0002 * x, -0.5);
        break;
      case 'D':
      default:
        sigma_y = 0.08 * x * Math.pow(1 + 0.0001 * x, -0.5);
        sigma_z = 0.06 * x * Math.pow(1 + 0.0015 * x, -0.5);
        break;
      case 'E':
        sigma_y = 0.06 * x * Math.pow(1 + 0.0001 * x, -0.5);
        sigma_z = 0.03 * x * Math.pow(1 + 0.0003 * x, -1.0);
        break;
      case 'F':
        sigma_y = 0.04 * x * Math.pow(1 + 0.0001 * x, -0.5);
        sigma_z = 0.016 * x * Math.pow(1 + 0.0003 * x, -1.0);
        break;
    }
  }

  return {
    sigma_y: Math.max(0.01, sigma_y),
    sigma_z: Math.max(0.01, sigma_z)
  };
}

/**
 * Calculate ground-level centerline atmospheric concentration
 * using standard Gaussian Plume equation.
 * 
 * @param {number} x - Downwind distance (meters)
 * @param {number} Q - Emission rate (g/s)
 * @param {number} u - Wind speed (m/s)
 * @param {number} H - Effective release height (meters)
 * @param {string} stabilityClass - Pasquill stability (A-F)
 * @param {string} terrain - Terrain classification ('rural' | 'urban')
 * @returns {number} Concentration in g/m^3
 */
export function calculateConcentrationGPerM3(x, Q, u, H = 0, stabilityClass = 'D', terrain = 'rural') {
  if (x <= 0) return 0;
  const wind = Math.max(0.5, u); // Prevent division by zero
  const { sigma_y, sigma_z } = calculateSigmas(x, stabilityClass, terrain);

  const denom = Math.PI * wind * sigma_y * sigma_z;
  if (denom <= 0) return 0;

  const verticalTerm = Math.exp(-0.5 * Math.pow(H / sigma_z, 2));
  return (Q / denom) * verticalTerm;
}

/**
 * Convert concentration from g/m^3 to parts-per-million (ppm)
 * at given ambient temperature (°C) and atmospheric pressure.
 */
export function convertGPerM3ToPpm(concGPerM3, mw, tempC = 25) {
  const concMgPerM3 = concGPerM3 * 1000;
  const tempK = tempC + 273.15;
  // Ideal gas constant factor: molar volume at T (liters/mol) = 24.45 * (T_K / 298.15)
  const molarVolume = 24.45 * (tempK / 298.15);
  return (concMgPerM3 * molarVolume) / mw;
}

/**
 * Find exact downwind distance where concentration reaches a threshold in ppm.
 * Uses numerical bisection search between x_min (5m) and x_max (30,000m).
 */
export function findThresholdDistance(targetPpm, Q, u, H, stabilityClass, terrain, mw, tempC) {
  let low = 5;
  let high = 30000;
  const tolerance = 0.5; // within 0.5 meter precision

  // Check if even near source exceeds threshold
  const concAtLow = convertGPerM3ToPpm(
    calculateConcentrationGPerM3(low, Q, u, H, stabilityClass, terrain),
    mw,
    tempC
  );

  // If even at 5m the concentration is lower than target, threat distance is < 5m
  if (concAtLow < targetPpm && H === 0) {
    return 0;
  }

  // Check if at 30km it still exceeds threshold
  const concAtHigh = convertGPerM3ToPpm(
    calculateConcentrationGPerM3(high, Q, u, H, stabilityClass, terrain),
    mw,
    tempC
  );
  if (concAtHigh >= targetPpm) {
    return high; // Exceeds 30 km radius
  }

  // If elevated release, find peak first then search downstream
  if (H > 0) {
    // Find peak concentration location
    let peakX = low;
    let maxConc = 0;
    for (let sampleX = 10; sampleX <= 5000; sampleX += 20) {
      const c = convertGPerM3ToPpm(
        calculateConcentrationGPerM3(sampleX, Q, u, H, stabilityClass, terrain),
        mw,
        tempC
      );
      if (c > maxConc) {
        maxConc = c;
        peakX = sampleX;
      }
    }
    if (maxConc < targetPpm) {
      return 0; // Ground concentration never reaches threshold
    }
    low = peakX; // Search from peak downward
  }

  // Bisection search
  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    const concMid = convertGPerM3ToPpm(
      calculateConcentrationGPerM3(mid, Q, u, H, stabilityClass, terrain),
      mw,
      tempC
    );

    if (Math.abs(concMid - targetPpm) < 0.05 || (high - low) < tolerance) {
      return Math.round(mid);
    }

    if (concMid > targetPpm) {
      low = mid; // Threshold lies further downwind
    } else {
      high = mid; // Threshold lies closer
    }
  }

  return Math.round((low + high) / 2);
}

/**
 * Calculate maximum plume crosswind width (plume spread) at a given distance
 * where concentration exceeds the threshold.
 */
export function calculatePlumeWidth(x, targetPpm, Q, u, H, stabilityClass, terrain, mw, tempC) {
  if (x <= 0) return 0;
  const centerlineConc = convertGPerM3ToPpm(
    calculateConcentrationGPerM3(x, Q, u, H, stabilityClass, terrain),
    mw,
    tempC
  );

  if (centerlineConc <= targetPpm) return 0;

  const { sigma_y } = calculateSigmas(x, stabilityClass, terrain);
  // y = sigma_y * sqrt(2 * ln(C_centerline / C_target))
  const ratio = centerlineConc / targetPpm;
  const halfWidth = sigma_y * Math.sqrt(2 * Math.log(ratio));
  return Math.round(2 * halfWidth); // Total crosswind width in meters
}

/**
 * Generate a complete dispersion profile across key downwind milestones
 */
export function generateDistanceProfile(Q, u, H, stabilityClass, terrain, chemical, tempC) {
  const distances = [25, 50, 100, 200, 500, 1000, 2000, 5000];
  return distances.map(dist => {
    const concG = calculateConcentrationGPerM3(dist, Q, u, H, stabilityClass, terrain);
    const concPpm = convertGPerM3ToPpm(concG, chemical.mw, tempC);
    const concMgM3 = concG * 1000;
    
    let dangerLevel = 'SAFE';
    if (concPpm >= chemical.idlh) {
      dangerLevel = 'RED (>= IDLH)';
    } else if (concPpm >= chemical.idlh * 0.5) {
      dangerLevel = 'YELLOW (Advisory)';
    } else {
      dangerLevel = 'GREEN (Safe)';
    }

    return {
      distanceMeters: dist,
      concPpm: Math.round(concPpm * 10) / 10,
      concMgM3: Math.round(concMgM3 * 10) / 10,
      dangerLevel
    };
  });
}
