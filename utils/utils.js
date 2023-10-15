const { Company, JobAd } = require('../models'); // Sequelize model import

exports.fetchJobAd = async (param = {}) => {
    /*

    이 함수가 호출되는 케이스 구분
    1. /jobad, GET: 모든 채용공고 목록을 리턴해야. 이때, JobAd에서 'content' field는 생략해야.
    2. /jobad/:id, GET: 주어진 id의 채용공고를 리턴해야. 이때, JobAd에서 'content' field를 가져와야.
    3. /search?q=.., GET: 주어진 쿼리에 해당하는 채용공고 목록을 리턴해야. 이때, JobAd에서 'content' field는 생략해야.

    */

    const {
        additionalAttributes = [],
        where
    } = param;

    const options = {
        attributes: ['id', 'position', 'reward', 'skills', ...additionalAttributes],
        include: [{
            model: Company,
            attributes: ['name', 'location', 'country']
        }]
    };

    let id;

    if (where) {
        options.where = where;
        id = where.id;
    }

    if (id) {
        return await JobAd.findOne(options);
    } else {
        return await JobAd.findAll(options);
    }
};
