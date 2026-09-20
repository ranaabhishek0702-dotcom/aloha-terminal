/**
 * Chemical Database for ALOHA Terminal Disaster Management Application
 * Values sourced from NIOSH Pocket Guide to Chemical Hazards & Indian Chemical Safety Standards.
 */

export const CHEMICALS = [
  {
    id: 'ammonia',
    name: 'Ammonia (Anhydrous)',
    formula: 'NH3',
    cas: '7664-41-7',
    mw: 17.03, // g/mol
    idlh: 300, // ppm (Immediately Dangerous to Life or Health)
    boilingPoint: -33.34, // °C
    vaporDensity: 0.59, // relative to air (air = 1.0)
    toxicClassification: 'Toxic Gas / Corrosive',
    healthHazards: 'Severe irritation to respiratory tract, lung edema, skin burns',
    firstAction: 'Evacuate downwind, full protective gear with SCBA, water fog to knock down vapor'
  },
  {
    id: 'chlorine',
    name: 'Chlorine',
    formula: 'Cl2',
    cas: '7782-50-5',
    mw: 70.90, // g/mol
    idlh: 10, // ppm
    boilingPoint: -34.04, // °C
    vaporDensity: 2.49, // heavier than air, sinks and hugs ground
    toxicClassification: 'Toxic Inhalation Hazard / Strong Oxidizer',
    healthHazards: 'Suffocation, chemical burns to airways, acute pulmonary edema',
    firstAction: 'Evacuate immediately perpendicular to wind, seek higher elevation, do not spray water into liquid leak'
  },
  {
    id: 'hydrogen_sulfide',
    name: 'Hydrogen Sulfide',
    formula: 'H2S',
    cas: '7783-06-4',
    mw: 34.08, // g/mol
    idlh: 100, // ppm
    boilingPoint: -60.28, // °C
    vaporDensity: 1.19, // slightly heavier than air
    toxicClassification: 'Extremely Toxic / Flammable Gas',
    healthHazards: 'Olfactory fatigue (loss of smell warning), rapid collapse, respiratory arrest',
    firstAction: 'Stop ignition sources, stay upwind and uphill, monitor LEL and toxic gas levels'
  },
  {
    id: 'sulfur_dioxide',
    name: 'Sulfur Dioxide',
    formula: 'SO2',
    cas: '7446-09-5',
    mw: 64.07, // g/mol
    idlh: 100, // ppm
    boilingPoint: -10.0, // °C
    vaporDensity: 2.26, // heavier than air
    toxicClassification: 'Toxic Gas / Respiratory Irritant',
    healthHazards: 'Bronchospasm, severe eye irritation, reflex larynx closure',
    firstAction: 'Isolate hazard area for at least 150m, downwind evacuation, use alkaline fog curtain'
  },
  {
    id: 'phosgene',
    name: 'Phosgene (Carbonyl Chloride)',
    formula: 'COCl2',
    cas: '75-44-5',
    mw: 98.92, // g/mol
    idlh: 2, // ppm (Very low threshold)
    boilingPoint: 8.2, // °C
    vaporDensity: 3.4, // heavy gas
    toxicClassification: 'Severe Pulmonary Agent / Chemical Warfare / Industrial Intermediate',
    healthHazards: 'Insidious delayed pulmonary edema (6-24 hrs post-exposure), fatal lung damage',
    firstAction: 'Absolute priority evacuation, enforce complete physical rest for exposed victims'
  },
  {
    id: 'methyl_isocyanate',
    name: 'Methyl Isocyanate (MIC)',
    formula: 'C2H3NO',
    cas: '624-83-9',
    mw: 57.05, // g/mol
    idlh: 3, // ppm (Historical Bhopal Reference)
    boilingPoint: 39.1, // °C
    vaporDensity: 1.42, // heavier than air
    toxicClassification: 'Severe Toxic Inhalation Hazard / Lacrimator',
    healthHazards: 'Severe corneal burning, necrosis of alveolar tissue, acute respiratory failure',
    firstAction: 'Immediate mass evacuation downwind, cover face with wet cloth if trapped, decontamination'
  },
  {
    id: 'lpg',
    name: 'Liquefied Petroleum Gas (Propane/Butane)',
    formula: 'C3H8 / C4H10',
    cas: '68476-85-7',
    mw: 44.1, // approx avg g/mol
    idlh: 2100, // ppm (flammability / asphyxiation risk threshold)
    boilingPoint: -42.0, // °C
    vaporDensity: 1.55, // heavier than air, accumulates in trenches and basements
    toxicClassification: 'Flammable Gas / Simple Asphyxiant',
    healthHazards: 'Fire and vapor cloud explosion (VCE), rapid asphyxiation in confined spaces',
    firstAction: 'Eliminate all ignition sources immediately, deluge water spray on tanks, evacuate blast perimeter'
  }
];

export function getChemicalById(id) {
  return CHEMICALS.find(chem => chem.id === id);
}
