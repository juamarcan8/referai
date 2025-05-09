import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../src/pages/RegisterPage';
import { vi } from 'vitest';

// Mock del servicio de registro
vi.mock('../src/services/auth.ts', () => ({
  register: vi.fn(),
}));

import { register } from '../src/services/auth.ts';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders all input fields and the submit button', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('allows typing into input fields', () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '12345678' },
    });

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
  });

  it('calls register on form submission and redirects on success', async () => {
    (register as any).mockResolvedValueOnce({ ok: true, data: {} });
    delete window.location;
    window.location = { href: '' } as any;

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '12345678' },
    });

    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('test@example.com', '12345678', '12345678');
      expect(window.location.href).toBe('/login');
    });
  });

  it('shows error message if register fails with general error', async () => {
    (register as any).mockRejectedValueOnce(new Error('Something went wrong'));

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '12345678' },
    });

    fireEvent.submit(screen.getByRole('button'));

    await screen.findByText(/registration failed/i);
  });

  it('shows validation error messages when status is 422', async () => {
    const error = {
      status: 422,
      data: {
        detail: [{ msg: 'Invalid email' }, { msg: 'Passwords do not match' }],
      },
    };
    (register as any).mockRejectedValueOnce(error);

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bademail' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '321' },
    });

    fireEvent.submit(screen.getByRole('button'));

    await screen.findByText(/validation error: invalid email/i);
  });
  
});
