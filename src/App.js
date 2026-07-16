import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Report from './Report';
import AddPrice from './AddPrice';
import ViewPriceList from './ViewPriceList';
import NiewPriceRule from './NiewPriceRule';
import UploadInvoice from './UploadInvoice';
import ComplaintForm from './ComplaintForm';
import ComplaintTrack from './ComplaintTrack';
import QRCodeGenerator from './QRCodeGenerator';
import { apiUrl } from './apiClient';

const getPublicScreenFromUrl = () => {
  const path = window.location.pathname.toLowerCase();
  const queryScreen = new URLSearchParams(window.location.search).get('screen');

  if (queryScreen === 'complaintForm' || queryScreen === 'complaintTrack') {
    return queryScreen;
  }

  if (path === '/complaint' || path === '/complaint-form') {
    return 'complaintForm';
  }

  if (path === '/complaint-track') {
    return 'complaintTrack';
  }

  return null;
};

function App() {
  const [screen, setScreen] = useState(() => getPublicScreenFromUrl() || 'login');
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('user')));
  const isPublicScreen = screen === 'complaintForm' || screen === 'complaintTrack';

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

  if (!isLoggedIn && !isPublicScreen) {
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
        onNavigateToComplaintForm={() => setScreen('complaintForm')}
        onNavigateToComplaintTrack={() => setScreen('complaintTrack')}
        onNavigateToQRCode={() => setScreen('qrCode')}
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

  if (screen === 'complaintForm') {
    return <ComplaintForm />;
  }

  if (screen === 'complaintTrack') {
    return <ComplaintTrack />;
  }

  if (screen === 'qrCode') {
    return <QRCodeGenerator />;
  }

  return <Login onSignInSuccess={(userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setScreen('dashboard');
  }} />;
}

export default App;
