const express = require('express');
const userJobAdRoutes = require('./routes/userJobAdRoutes');
const searchRoutes = require('./routes/searchRoutes');
const jobAdRoutes = require('./routes/jobAdRoutes');

const app = express();

app.use(express.json());

app.use('/user-job-ad', userJobAdRoutes);
app.use('/search', searchRoutes);
app.use('/jobad', jobAdRoutes);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
