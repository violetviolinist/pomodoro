const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logRouter = require('./routes/log');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())

app.use("/log", logRouter)

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
