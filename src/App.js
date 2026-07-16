import React, { useEffect, useRef, useState } from 'react';
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
import './App.css';

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
  const screenHistoryRef = useRef([]);
  const isPublicScreen = screen === 'complaintForm' || screen === 'complaintTrack';

  const navigateTo = (nextScreen) => {
    setScreen((currentScreen) => {
      if (currentScreen === nextScreen) {
        return currentScreen;
      }
      screenHistoryRef.current.push(currentScreen);
      return nextScreen;
    });
  };

  const goBack = () => {
    setScreen((currentScreen) => {
      const previousScreen = screenHistoryRef.current.pop();
      if (previousScreen) {
        return previousScreen;
      }
      if (currentScreen === 'complaintTrack') {
        return 'complaintForm';
      }
      return isLoggedIn ? 'dashboard' : 'login';
    });
  };

  // Check session from backend only on mount
  useEffect(() => {
    const requestedPublicScreen = getPublicScreenFromUrl();
    if (requestedPublicScreen) {
      screenHistoryRef.current = [];
      setScreen(requestedPublicScreen);
      return;
    }

    const checkSession = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setIsLoggedIn(true);
        screenHistoryRef.current = [];
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
          screenHistoryRef.current = [];
          setScreen('dashboard');
          return;
        }

        if (!savedUser) {
          setIsLoggedIn(false);
          screenHistoryRef.current = [];
          setScreen('login');
        }
      } catch {
        if (!savedUser) {
          setIsLoggedIn(false);
          screenHistoryRef.current = [];
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
    screenHistoryRef.current = [];
    setScreen('login');
  };

  if (!isLoggedIn && !isPublicScreen) {
    return <Login onSignInSuccess={(userData) => {
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoggedIn(true);
      screenHistoryRef.current = [];
      setScreen('dashboard');
    }} />;
  }

  let content = null;

  if (screen === 'dashboard') {
    content = (
      <Dashboard
        onNavigateToReport={() => navigateTo('report')}
        onNavigateToComplaintTrack={() => navigateTo('complaintTrack')}
        onNavigateToQRCode={() => navigateTo('qrCode')}
        onLogout={handleLogout}
      />
    );
  } else if (screen === 'report') {
    content = <Report onBackToDashboard={goBack} onRequireLogin={handleLogout} />;
  } else if (screen === 'addPrice') {
    content = <AddPrice onBackToDashboard={goBack} />;
  } else if (screen === 'viewPriceList') {
    content = <ViewPriceList onBackToDashboard={goBack} />;
  } else if (screen === 'niewPriceRule') {
    content = <NiewPriceRule onBackToDashboard={goBack} />;
  } else if (screen === 'uploadInvoice') {
    content = <UploadInvoice onBackToDashboard={goBack} />;
  } else if (screen === 'complaintForm') {
    content = <ComplaintForm onBackToDashboard={goBack} />;
  } else if (screen === 'complaintTrack') {
    content = <ComplaintTrack onBackToDashboard={goBack} />;
  } else if (screen === 'qrCode') {
    content = <QRCodeGenerator onBackToDashboard={goBack} />;
  } else {
    content = <Login onSignInSuccess={(userData) => {
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoggedIn(true);
      screenHistoryRef.current = [];
      setScreen('dashboard');
    }} />;
  }

  return (
    <div className="app-shell">
      {content}
    </div>
  );
}

export default App;
