const { fetchJobAd } = require('../../utils/utils');
const { Company, JobAd } = require('../../models');

// Mocking the Sequelize models
jest.mock('../../models', () => ({
  Company: {},
  JobAd: {
    findOne: jest.fn(),
    findAll: jest.fn()
  }
}));

describe('fetchJobAd function', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all job ads without content field', async () => {
    JobAd.findAll.mockResolvedValue([]);
    
    const result = await fetchJobAd();
    
    expect(result).toEqual([]);
    expect(JobAd.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'position', 'reward', 'skills'],
      include: [{
        model: Company,
        attributes: ['name', 'location', 'country']
      }]
    });
  });

  it('should fetch a specific job ad by id with content field', async () => {
    const mockData = { id: 1, position: 'Developer' };
    JobAd.findOne.mockResolvedValue(mockData);
    
    const result = await fetchJobAd({
      additionalAttributes: ['content'],
      where: { id: 1 }
    });
    
    expect(result).toEqual(mockData);
    expect(JobAd.findOne).toHaveBeenCalledWith({
      attributes: ['id', 'position', 'reward', 'skills', 'content'],
      include: [{
        model: Company,
        attributes: ['name', 'location', 'country']
      }],
      where: { id: 1 }
    });
  });

  it('should fetch job ads by a search query without content field', async () => {
    const mockData = [{ id: 1, position: 'Developer' }, { id: 2, position: 'Designer' }];
    JobAd.findAll.mockResolvedValue(mockData);
    
    const result = await fetchJobAd({
      where: { position: 'Developer' }
    });
    
    expect(result).toEqual(mockData);
    expect(JobAd.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'position', 'reward', 'skills'],
      include: [{
        model: Company,
        attributes: ['name', 'location', 'country']
      }],
      where: { position: 'Developer' }
    });
  });

});
