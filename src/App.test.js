import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    if (String(url).includes('/api/auth/session')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ loggedIn: false }),
      });
    }

    if (String(url).includes('/api/visitors')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, visitors: [] }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('keeps the user signed in until logout when a saved user exists', async () => {
  localStorage.setItem('user', JSON.stringify({ email: 'user@example.com' }));

  render(<App />);

  expect(await screen.findByText(/Emirates ID Dashboard/i)).toBeInTheDocument();
});
