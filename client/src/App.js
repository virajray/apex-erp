import { useState, useEffect } from 'react'; // Import hooks
import './App.css';

function App() {
  // Create a state variable to hold our message
  const [message, setMessage] = useState('');

  // useEffect runs once when the component loads
  useEffect(() => {
    // Fetch the message from our backend API
    fetch('http://localhost:5000/api/message')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []); // The empty array means "only run this once"

  return (
    <div className="App">
      <h1>My ERP System</h1>
      {/* Display the message from the backend */}
      <h2>{message}</h2>
    </div>
  );
}

export default App;