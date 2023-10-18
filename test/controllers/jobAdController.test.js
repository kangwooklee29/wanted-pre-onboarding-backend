const { getAllJobAds, postJobAd, updateJobAd, deleteJobAd, getJobAd } = require('../../controllers/jobAdController');
const { Company, JobAd } = require('../../models');
const { fetchJobAd } = require('../../utils/utils');

jest.mock('../../utils/utils');
jest.mock('../../models', () => {
    return {
        Company: {
            findOrCreate: jest.fn()
        },
        JobAd: {
            create: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
            findAll: jest.fn()
        }
    };
});

let mockReq, mockRes, mockNext;

beforeEach(() => {
    mockReq = {};
    mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
    };
    mockNext = jest.fn();
});

describe('getAllJobAds controller function', () => {
    it('should fetch and return all job ads', async () => {
        const mockJobAds = [{ id: 1, title: 'Developer' }, { id: 2, title: 'Designer' }];
        fetchJobAd.mockResolvedValue(mockJobAds);

        await getAllJobAds(mockReq, mockRes, mockNext);

        expect(fetchJobAd).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith(mockJobAds);
    });

    it('should return 500 if there is an error', async () => {
        const mockError = new Error('Test error');
        fetchJobAd.mockRejectedValue(mockError);

        await getAllJobAds(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: mockError.message });
    });
});

describe('postJobAd controller function', () => {
    beforeEach(() => {
        mockReq = {
            body: {
                companyId: 1,
                position: 'Test Position',
                reward: 'Test Reward',
                content: 'Test Content',
                skills: 'Test Skills',
                companyName: 'Test Company',
                companyLocation: 'Test Location',
                companyCountry: 'Test Country'
            }
        }; // postJobAd에 대한 요청 객체 초기화
    });

    it('should create and return a new job ad', async () => {
        const mockCompany = { id: 1, name: 'Test Company' };
        const mockJob = { id: 1, ...mockReq.body };
        
        Company.findOrCreate.mockResolvedValue([mockCompany, true]);
        JobAd.create.mockResolvedValue(mockJob);

        await postJobAd(mockReq, mockRes, mockNext);

        expect(Company.findOrCreate).toHaveBeenCalledWith({
            where: { id: mockReq.body.companyId },
            defaults: {
                name: mockReq.body.companyName,
                location: mockReq.body.companyLocation,
                country: mockReq.body.companyCountry
            }
        });
        expect(JobAd.create).toHaveBeenCalledWith({
            companyId: mockCompany.id,
            position: mockReq.body.position,
            reward: mockReq.body.reward,
            content: mockReq.body.content,
            skills: mockReq.body.skills
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockJob);
    });

    it('should return 500 if there is an error', async () => {
        const mockError = new Error('Test error');
        Company.findOrCreate.mockRejectedValue(mockError);

        await postJobAd(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });
});

describe('updateJobAd controller function', () => {
    beforeEach(() => {
        mockReq = {
            params: {
                id: 1
            },
            body: {
                position: 'Updated Position'
            }
        }; // updateJobAd에 대한 요청 객체 초기화
    });

    it('should update a job ad successfully', async () => {
        JobAd.update.mockResolvedValue([1]); // 1 indicates one row was updated
        
        await updateJobAd(mockReq, mockRes, mockNext);

        expect(JobAd.update).toHaveBeenCalledWith(mockReq.body, { where: { id: mockReq.params.id } });
        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 if no record is found to update', async () => {
        JobAd.update.mockResolvedValue([0]); // 0 indicates no rows were updated
        
        await updateJobAd(mockReq, mockRes, mockNext);

        expect(JobAd.update).toHaveBeenCalledWith(mockReq.body, { where: { id: mockReq.params.id } });
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'No record found to update' });
    });

    it('should return 500 if there is an error', async () => {
        const mockError = new Error('Test error');
        JobAd.update.mockRejectedValue(mockError);
        
        await updateJobAd(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: mockError.message });
    });
});

describe('deleteJobAd controller function', () => {
    beforeEach(() => {
        mockReq = {
            params: {
                id: 1
            }
        }; // deleteJobAd에 대한 요청 객체 초기화
    });

    it('should successfully delete a job ad', async () => {
        // 하나의 레코드가 삭제됨
        JobAd.destroy.mockResolvedValue(1);

        await deleteJobAd(mockReq, mockRes, mockNext);

        expect(JobAd.destroy).toHaveBeenCalledWith({ where: { id: mockReq.params.id } });
        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 if no record is found to delete', async () => {
        // 삭제할 레코드가 없음
        JobAd.destroy.mockResolvedValue(0);

        await deleteJobAd(mockReq, mockRes, mockNext);

        expect(JobAd.destroy).toHaveBeenCalledWith({ where: { id: mockReq.params.id } });
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'No record found to delete' });
    });

    it('should return 500 if there is an error', async () => {
        const mockError = new Error('Test error');
        JobAd.destroy.mockRejectedValue(mockError);

        await deleteJobAd(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: mockError.message });
    });
});

describe('getJobAd controller function', () => {
    beforeEach(() => {
        mockReq = {
            params: {
                id: 1
            }
        }; // getJobAd에 대한 요청 객체 초기화
    });

    it('should return job ad details', async () => {
        const mockJobAd = {
            dataValues: { id: 1, position: 'Test Position' },
        };
        fetchJobAd.mockResolvedValue(mockJobAd);
        JobAd.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

        await getJobAd(mockReq, mockRes, mockNext);

        expect(fetchJobAd).toHaveBeenCalledWith({
            additionalAttributes: ['content'],
            where: { id: mockReq.params.id }
        });
        expect(JobAd.findAll).toHaveBeenCalledWith({
            where: { companyId: mockReq.params.id },
            attributes: ['id']
        });
        expect(mockRes.send).toHaveBeenCalledWith({
            ...mockJobAd.dataValues,
            OtherJobAdIds: [1]
        });
    });

    it('should return 404 if no job ad record is found', async () => {
        fetchJobAd.mockResolvedValue(null);

        await getJobAd(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'No JobAd record found' });
    });

    it('should return 500 if there is an error', async () => {
        const mockError = new Error('Test error');
        fetchJobAd.mockRejectedValue(mockError);

        await getJobAd(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: mockError.message });
    });
});
