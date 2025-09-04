'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('vehicle_types', [
      { name: 'Hatchback', wheels: 4 },
{ name: 'SUV', wheels: 4 },
{ name: 'Sedan', wheels: 4 },
{ name: 'Cruiser', wheels: 2 }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vehicle_types', null, {});
  }
};
