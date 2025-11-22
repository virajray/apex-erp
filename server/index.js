// 1. Import the express library
const express = require('express');
const cors = require('cors');

// 2. Create an instance of an express app
const app = express();
const PORT = 5000; // We'll run our backend on port 5000

// --- MIDDLEWARE ---
// Use cors to allow our frontend (on port 3000) to talk to our backend (on port 5000)
app.use(cors()); 

// **NEW:** Use express.json() to allow our server to understand JSON data.
// This is crucial for reading the email and password from the login form.
app.use(express.json()); 


// --- ROUTES ---

// 3. Our original "message" endpoint
app.get('/api/message', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});


// **NEW:** Our new login endpoint
app.post('/api/auth/login', (req, res) => {
  // Get the email and password sent from the frontend form
  const { email, password } = req.body;

  console.log(`Login attempt from: ${email}`);

  // --- THIS IS A TEMPORARY, FAKE LOGIN CHECK ---
  // Later, we will replace this by checking a real database.
  if (email === 'admin@test.com' && password === 'password123') {
    // If the email and password are correct...
    console.log('Login successful');
    // Send a success response with a fake "token"
    res.status(200).json({ 
      message: "Login successful!", 
      token: "fake-jwt-token-for-now-12345" 
    });
  } else {
    // If the email or password is wrong...
    console.log('Login failed: Invalid credentials');
    // Send an "Unauthorized" error response
    res.status(401).json({ message: "Invalid email or password" });
  }
});


// 4. Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});