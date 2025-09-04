'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('vehicles', [
      // Hatchback vehicles (type_id: 1)
      { name: 'Swift', type_id: 1, price_per_day: 1500.00, is_available: true },
{ name: 'Alto', type_id: 1, price_per_day: 1200.00, is_available: true },
{ name: 'Tiago', type_id: 1, price_per_day: 1400.00, is_available: true },
{ name: 'Scorpio', type_id: 2, price_per_day: 2500.00, is_available: true },
{ name: 'XUV500', type_id: 2, price_per_day: 2800.00, is_available: true },
{ name: 'Creta', type_id: 2, price_per_day: 2200.00, is_available: true },
{ name: 'City', type_id: 3, price_per_day: 2000.00, is_available: true },
{ name: 'Verna', type_id: 3, price_per_day: 1900.00, is_available: true },
{ name: 'Ciaz', type_id: 3, price_per_day: 1800.00, is_available: true },
{ name: 'Royal Enfield Classic 350', type_id: 4, price_per_day: 800.00, is_available: true },
{ name: 'Avenger 220 Cruise', type_id: 4, price_per_day: 700.00, is_available: true },
{ name: 'Jawa Perak', type_id: 4, price_per_day: 900.00, is_available: true }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vehicles', null, {});
  }
};
