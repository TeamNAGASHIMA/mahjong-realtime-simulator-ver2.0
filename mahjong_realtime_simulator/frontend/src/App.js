import React, { useEffect, useState } from 'react';
import logo from './logo.svg'; // CRAのデフォルトロゴ
import './App.css';

function App() {
  const [djangoData, setDjangoData] = useState(null);

  useEffect(() => {
    const jsonDataElement = document.getElementById('react-initial-data');
    if (jsonDataElement) {
      try {
        const parsedData = JSON.parse(jsonDataElement.textContent);
        setDjangoData(parsedData);
        console.log('Data from Django (CRA):', parsedData);
      } catch (error) {
        console.error('Failed to parse Django data for CRA:', error);
      }
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {djangoData ? (
          <div style={{ marginTop: '20px', border: '1px solid white', padding: '10px' }}>
            <h3>Data from Django:</h3>
            <p>User: {djangoData.user_name}</p>
            <p>App Version: {djangoData.app_version}</p>
            <p>Features Enabled: {djangoData.features_enabled?.join(', ')}</p>
          </div>
        ) : (
          <p>Loading Django data...</p>
        )}
      </header>
    </div>
  );
}

export default App;