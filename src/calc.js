// Copyright 2019 Wholegrain Digital
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// All calculations below are just the JS version of https://gitlab.com/wholegrain/carbon-api-2-0 by Wholegrain Digital

const KWG_PER_GB = 1.805;
const RETURNING_VISITOR_PERCENTAGE = 0.75;
const FIRST_TIME_VIEWING_PERCENTAGE = 0.25;
const PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD = 0.02;
const CARBON_PER_KWG_GRID = 475;
const CARBON_PER_KWG_RENEWABLE = 33.4;
const PERCENTAGE_OF_ENERGY_IN_DATACENTER = 0.1008;
const PERCENTAGE_OF_ENERGY_IN_TRANSMISSION_AND_END_USER = 0.8992;
const CO2_GRAMS_TO_LITRES = 0.5562;

/**
 * @param {number} value
 * @returns number
 */
function adjustDataTransfer(value) {
  return (
    value * RETURNING_VISITOR_PERCENTAGE +
    PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD *
      value *
      FIRST_TIME_VIEWING_PERCENTAGE
  );
}

/**
 * @param {number} value
 * @returns number
 */
function energyConsumption(value) {
  return value * (KWG_PER_GB / 1073741824);
}

/**
 * @param {number} value
 * @returns number
 */
function getCo2Grid(value) {
  return value * CARBON_PER_KWG_GRID;
}

/**
 * @param {number} value
 * @returns number
 */
function getCo2Renewable(value) {
  return (
    value * PERCENTAGE_OF_ENERGY_IN_DATACENTER * CARBON_PER_KWG_RENEWABLE +
    value *
      PERCENTAGE_OF_ENERGY_IN_TRANSMISSION_AND_END_USER *
      CARBON_PER_KWG_GRID
  );
}

/**
 * @param {number} value
 * @returns number
 */
function co2ToLitres(value) {
  return value * CO2_GRAMS_TO_LITRES;
}

/**
 * @typedef {Object} Stats The stats of the website based on its transferred bytes.
 * @property {number} adjustedBytes Maths (adjusted bytes based on user bahaviour).
 * @property {number} energy Energy used in kWh.
 * @property {co2} co2 CO2 stats.
 */

/**
 * @typedef {Object} co2 The co2 stats for grid and renewable energy of the website based on its transferred bytes.
 * @property {co2glt} grid Bog standard energy stats.
 * @property {co2glt} renewable Renewable energy stats.
 */

/**
 * @typedef {Object} co2glt The co2 stats in grams and litres of the website based on its transferred bytes.
 * @property {number} grams Grams of CO2.
 * @property {number} litres Litres of CO2.
 */

/**
 * @param {number} bytes
 * @returns {Stats}
 */
exports.genData = (bytes) => {
  bytesAdjusted = adjustDataTransfer(bytes);
  energy = energyConsumption(bytesAdjusted);
  co2Grid = getCo2Grid(energy);
  co2Renewable = getCo2Renewable(energy);

  return {
    adjustedBytes: bytesAdjusted,
    energy: energy,
    co2: {
      grid: {
        grams: co2Grid,
        litres: co2ToLitres(co2Grid),
      },
      renewable: {
        grams: co2Renewable,
        litres: co2ToLitres(co2Renewable),
      },
    },
  };
};
