const { Company, JobAd } = require('../models'); // Sequelize model import
const { fetchJobAd } = require('../utils/utils');

exports.getAllJobAds = async (req, res) => {
    try {
        const jobAds = await fetchJobAd();
        res.json(jobAds);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.postJobAd = async (req, res) => {
    try {
        const {
            companyId,
            position,
            reward,
            content,
            skills,
            companyName,
            companyLocation,
            companyCountry
        } = req.body;

        // companyId에 해당하는 레코드가 Companies 테이블에 있는지 확인하고 없으면 생성
        const [company, created] = await Company.findOrCreate({
            where: { id: companyId },
            defaults: {
                name: companyName,
                location: companyLocation,
                country: companyCountry
            }
        });

        const newJob = await JobAd.create({
            companyId: company.id, // 여기서 생성된 또는 조회된 companyId를 사용
            position,
            reward,
            content,
            skills
        });

        // Created a new job ad
        res.status(201).json(newJob);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateJobAd = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const result = await JobAd.update(data, {
            where: { id }
        });

        if (result[0] === 0) {
            return res.status(404).send({ message: 'No record found to update' });
        }

        res.status(204).send();

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.deleteJobAd = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await JobAd.destroy({
            where: { id }
        });

        if (result === 0) {
            return res.status(404).send({ message: 'No record found to delete' });
        }

        res.status(204).send();

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getJobAd = async (req, res) => {
    try {
        const { id } = req.params;

        const jobAd = await fetchJobAd({
            additionalAttributes: [ 'content' ],
            where: { id }
        });

        if (!jobAd) {
            return res.status(404).send({ message: 'No JobAd record found' });
        }

        const jobAdsCompanyHas = await JobAd.findAll({
            where: { companyId: id },
            attributes: ['id']
        });

        const jobAdIds = jobAdsCompanyHas
            .filter(ad => ad.id === id)
            .map(ad => ad.id);

        const result = {
            ...jobAd.dataValues,
            OtherJobAdIds: jobAdIds
        };

        res.send(result);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
