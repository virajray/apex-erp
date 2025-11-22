// 1. Import the express library
const express = require('express');

// 2. Create an instance of an express app
const app = express();
const PORT = 5000; // We'll run our backend on port 5000

// 3. Create our first "endpoint" or "route"
app.get('/api/message', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// 4. Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});