'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.JobAd, { through: 'UserJobAd', foreignKey: 'userId' });
    }
  }
  User.init({
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};