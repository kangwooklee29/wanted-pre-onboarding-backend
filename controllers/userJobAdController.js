const { JobAd, User, UserJobAd } = require('../models'); // Sequelize model import

exports.postUserJobAd = async (req, res) => {
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
};
