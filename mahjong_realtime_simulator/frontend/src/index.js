import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18+
// import ReactDOM from 'react-dom'; // React 17以前
import './index.css'; // グローバルCSSなど
import App from './App'; // メインのReactコンポーネント
// import reportWebVitals from './reportWebVitals'; // 必要であれば

const container = document.getElementById('react-app'); // マウント先のID
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.warn('Target container #react-app not found in the DOM. Make sure your Django template has an element with this ID.');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();