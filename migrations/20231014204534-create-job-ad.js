'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobAds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      position: {
        type: Sequelize.STRING
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Companies',
          key: 'id',
        },
        allowNull: false,
      },
      reward: {
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.STRING
      },
      skills: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('JobAds');
  }
};