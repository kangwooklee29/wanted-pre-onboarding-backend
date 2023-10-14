'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserJobAds', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      jobAdId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'JobAds',
          key: 'id'
        }
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
    await queryInterface.addIndex('UserJobAds', ['userId', 'jobAdId'], {
      unique: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserJobAds');
  }
};