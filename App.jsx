import React, { useState, useEffect } from 'react';
import { LogIn, Database } from 'lucide-react';

// NOTE: This internal URL assumes the Kubernetes Service is named 'zomota-api-service'
// and listens on port 3001, as defined in the backend-deployment.yml file.
const API_URL = "http://zomota-api-service:3001/api/public-message"; 

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiMessage, setApiMessage] = useState('Loading API message...');
  const [apiSource, setApiSource] = useState('...');
  const [loading, setLoading] = useState(true);

  // --- API CALL DEMO ---
  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setApiMessage(data.message);
        setApiSource(data.source);
      })
      .catch(error => {
        setApiMessage(`API Error: Cannot connect to backend or DB. Check K8s Service: ${error.message}`);
        setApiSource("Connection Failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you'd send { email, password } to the backend here.
    alert("Login simulated! Data would be sent to the backend for authentication.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
            <LogIn size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          
          {/* API Status Display */}
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-indigo-500 mr-2" />
              <p className="text-sm font-medium text-indigo-700">
                Backend DB Status:
              </p>
            </div>
            <p className={`mt-1 ml-7 text-sm ${loading ? 'text-gray-500' : (apiSource === 'Connection Failed' ? 'text-red-600' : 'text-green-600')}`}>
              {loading ? 'Fetching...' : apiMessage}
            </p>
            <p className="mt-0 ml-7 text-xs text-indigo-500 italic">
              Source: {apiSource}
            </p>
          </div>
          
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
