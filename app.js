const express = require('express');
const { Company, JobAd, User, UserJobAd } = require('./models'); // Sequelize model import

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/jobad', async (req, res) => {
    try {
        const jobAds = await JobAd.findAll();
        res.json(jobAds);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

app.post('/jobad', async (req, res) => {
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
});

app.put('/jobad/:id', async (req, res) => {
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
});

app.delete('/jobad/:id', async (req, res) => {
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
});

app.get('/jobad/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const jobAd = await JobAd.findOne({
            where: { id },
            attributes: ['id', 'position', 'reward', 'skills', 'content'],
            include: [{
                model: Company,
                attributes: ['name', 'location', 'country']
            }]
        });

        if (!jobAd) {
            return res.status(404).send({ message: 'No JobAd record found' });
        }

        const jobAdsCompanyHas = await JobAd.findAll({
            where: { companyId: id },
            attributes: ['id']
        });

        const jobAdIds = jobAdsCompanyHas.map(ad => ad.id);

        const result = {
            ...jobAd.dataValues,
            ...jobAd.Company.dataValues,
            OtherJobAdIds: jobAdIds
        };

        res.send(result);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

app.post('/user-job-ad', async (req, res) => {
    try {
        const { userId, jobAdId } = req.body;

        // User 찾기 또는 생성하기
        const [user, created] = await User.findOrCreate({
            where: { id: userId }
        });

        // JobAd가 존재하는지 확인
        const jobAd = await JobAd.findByPk(jobAdId);

        if (!jobAd) {
            return res.status(400).json({ message: 'JobAd not found' });
        }

        const newUserJobAd = await UserJobAd.create({
            userId: user.id,
            jobAdId
        });

        // Created a new job application info
        res.status(201).json(newUserJobAd);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
