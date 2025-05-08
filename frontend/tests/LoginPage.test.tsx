import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../src/pages/LoginPage';
import { vi } from 'vitest';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders email and password inputs and submit button', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('allows typing into the email and password fields', () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
  });

  it('submits form and stores token on successful login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'mock_token' }),
    });

    delete window.location;
    window.location = { href: '' } as any;

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret' },
    });

    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/login'), expect.any(Object));
      expect(localStorage.getItem('token')).toBe('mock_token');
      expect(window.location.href).toBe('/upload');
    });
  });

  it('displays an error message on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid credentials' }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.submit(screen.getByRole('button'));

    await screen.findByText(/invalid credentials/i);
  });

  it('disables the button while loading', async () => {
    mockFetch.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: async () => ({ access_token: 'token' }),
          }), 500
        )
      )
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123456' },
    });

    fireEvent.submit(screen.getByRole('button'));

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
