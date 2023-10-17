const { postUserJobAd } = require('../../controllers/userJobAdController');
const { User, JobAd, UserJobAd } = require('../../models');

jest.mock('../../models');

let mockReq, mockRes, mockNext;

beforeEach(() => {
  mockReq = {
    body: {}
  };
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  };
  mockNext = jest.fn();
});

describe('postUserJobAd controller function', () => {
  it('should create and return new UserJobAd if inputs are valid', async () => {
    mockReq.body = {
      userId: 1,
      jobAdId: 2
    };
    User.findOrCreate.mockResolvedValue([{ id: 1 }, true]);
    JobAd.findByPk.mockResolvedValue({ id: 2 });

    await postUserJobAd(mockReq, mockRes);

    expect(UserJobAd.create).toBeCalledWith({
      userId: 1,
      jobAdId: 2
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('should return 400 if jobAd does not exist', async () => {
    mockReq.body = {
      userId: 1,
      jobAdId: 2
    };
    User.findOrCreate.mockResolvedValue([{ id: 1 }, true]);
    JobAd.findByPk.mockResolvedValue(null);

    await postUserJobAd(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'JobAd not found' });
  });

  it('should return 500 if there is an error', async () => {
    mockReq.body = {
      userId: 1,
      jobAdId: 2
    };
    User.findOrCreate.mockRejectedValue(new Error('Test error'));

    await postUserJobAd(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Test error' });
  });
});
