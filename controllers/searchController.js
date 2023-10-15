const { Op } = require('sequelize');
const { Company } = require('../models'); // Sequelize model import
const { fetchJobAd } = require('../utils/utils');

exports.getSearchResult = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).send({ message: 'q parameter is required' });
        }

        const matchedCompanies = await Company.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { location: { [Op.like]: `%${query}%` } },
                    { country: { [Op.like]: `%${query}%` } }
                ]
            }
        });

        const companyIds = matchedCompanies.map(company => company.id);
        const resultFromCompany = await fetchJobAd({
            where: {
                companyId: {
                    [Op.in]: companyIds
                }
            }
        });

        const resultFromJobAd = await fetchJobAd({
            where: {
                [Op.or]: [
                    { position: { [Op.like]: `%${query}%` } },
                    { reward: { [Op.like]: `%${query}%` } },
                    { skills: { [Op.like]: `%${query}%` } },
                    { content: { [Op.like]: `%${query}%` } },
                ]
            }
        });

        res.json([
            ...resultFromCompany,
            ...resultFromJobAd
        ]);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
