const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logRouter = require('./routes/log');
const analysisRouter = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())

app.use("/log", logRouter)
app.use("/analysis", analysisRouter)

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
