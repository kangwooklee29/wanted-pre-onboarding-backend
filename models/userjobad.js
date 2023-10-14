'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserJobAd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserJobAd.init({
    userId: DataTypes.INTEGER,
    jobAdId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserJobAd',
  });
  return UserJobAd;
};