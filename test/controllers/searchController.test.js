const { getSearchResult } = require('../../controllers/searchController');
const { Company } = require('../../models');
const { fetchJobAd } = require('../../utils/utils');

jest.mock('../../models');
jest.mock('../../utils/utils');

let mockReq, mockRes, mockNext;

beforeEach(() => {
    mockReq = {
        query: {}
    };
    mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
    };
    mockNext = jest.fn();
});

describe('getSearchResult controller function', () => {
    it('should return 400 if q parameter is missing', async () => {
        await getSearchResult(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'q parameter is required' });
    });

    it('should fetch and return search results', async () => {
        mockReq.query.q = 'test';
        const mockCompanies = [{ id: 1 }, { id: 2 }];
        Company.findAll.mockResolvedValue(mockCompanies);
        fetchJobAd
            .mockResolvedValueOnce([{ id: 3 }])
            .mockResolvedValueOnce([{ id: 4 }, { id: 5 }]);

        await getSearchResult(mockReq, mockRes);

        expect(Company.findAll).toBeCalledWith({
            where: expect.anything()
        });
        expect(fetchJobAd).toHaveBeenCalledTimes(2);
        expect(mockRes.json).toHaveBeenCalledWith([{ id: 3 }, { id: 4 }, { id: 5 }]);
    });

    it('should return 500 if there is an error', async () => {
        mockReq.query.q = 'test';
        Company.findAll.mockRejectedValue(new Error('Test error'));

        await getSearchResult(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'Test error' });
    });
});
