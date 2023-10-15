'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobAd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Company, { foreignKey: 'companyId' });
      this.belongsToMany(models.User, { through: 'UserJobAd', foreignKey: 'jobAdId' });
    }
  }
  JobAd.init({
    position: DataTypes.STRING,
    companyId: DataTypes.INTEGER,
    reward: DataTypes.INTEGER,
    content: DataTypes.STRING,
    skills: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'JobAd',
  });
  return JobAd;
};