import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Report from './Report';
import AddPrice from './AddPrice';
import ViewPriceList from './ViewPriceList';
import NiewPriceRule from './NiewPriceRule';
import UploadInvoice from './UploadInvoice';
import { apiUrl } from './apiClient';

function App() {
  const [screen, setScreen] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('user')));

  // Check session from backend only on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setIsLoggedIn(true);
        setScreen('dashboard');
      }

      try {
        const res = await fetch(apiUrl('/api/auth/session'), { credentials: 'include' });
        let data = {};
        try {
          data = await res.json();
        } catch {
          if (!savedUser) {
            setIsLoggedIn(false);
            setScreen('login');
          }
          return;
        }

        if (data.loggedIn) {
          setIsLoggedIn(true);
          setScreen('dashboard');
          return;
        }

        if (!savedUser) {
          setIsLoggedIn(false);
          setScreen('login');
        }
      } catch {
        if (!savedUser) {
          setIsLoggedIn(false);
          setScreen('login');
        }
      }
    };
    checkSession();
    // eslint-disable-next-line
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('user');
    await fetch(apiUrl('/api/logout'), { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setScreen('login');
  };

  if (!isLoggedIn) {
    return <Login onSignInSuccess={(userData) => {
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoggedIn(true);
      setScreen('dashboard');
    }} />;
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard
        onNavigateToReport={() => setScreen('report')}
        onNavigateToViewPriceList={() => setScreen('viewPriceList')}
        onNavigateToNiewPriceRule={() => setScreen('niewPriceRule')}
        onNavigateToUploadInvoice={() => setScreen('uploadInvoice')}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'report') {
    return <Report onBackToDashboard={() => setScreen('dashboard')} onRequireLogin={handleLogout} />;
  }

  if (screen === 'addPrice') {
    return <AddPrice onBackToDashboard={() => setScreen('dashboard')} />;
  }

  if (screen === 'viewPriceList') {
    return <ViewPriceList onBackToDashboard={() => setScreen('dashboard')} />;
  }

  if (screen === 'niewPriceRule') {
    return <NiewPriceRule onBackToDashboard={() => setScreen('dashboard')} />;
  }

  if (screen === 'uploadInvoice') {
    return <UploadInvoice onBackToDashboard={() => setScreen('dashboard')} />;
  }

  return <Login onSignInSuccess={(userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setScreen('dashboard');
  }} />;
}

export default App;
