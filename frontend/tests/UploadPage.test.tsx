import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadPage from '../src/pages/UploadPage';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { uploadClips } from '../src/api/upload';
import { getLastAction } from '../src/api/action';

vi.mock('../src/api/upload', () => ({
  uploadClips: vi.fn(),
}));

vi.mock('../src/api/action', () => ({
  getLastAction: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSetSelectedVideos = vi.fn();
vi.mock('../src/context/SelectedVideosContext', async () => {
  const actual = await vi.importActual('../src/context/SelectedVideosContext');
  return {
    ...actual,
    useSelectedVideos: () => ({
      selectedVideos: ['url1', 'url2', 'url3'],
      setSelectedVideos: mockSetSelectedVideos,
    }),
  };
});

describe('UploadPage', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'mocked-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'header.payload.signature');
    mockSetSelectedVideos.mockClear();
  });

  const renderPage = () =>
    render(
      <AuthProvider>
        <BrowserRouter>
          <UploadPage />
        </BrowserRouter>
      </AuthProvider>
    );

  it('removes a selected video when the remove button is clicked', async () => {
    renderPage();

    const removeButtons = await screen.findAllByRole('button', { name: '✕' });

    fireEvent.click(removeButtons[1]);

    expect(mockSetSelectedVideos).toHaveBeenCalledTimes(1);

    const updateFn = mockSetSelectedVideos.mock.calls[0][0];
    expect(updateFn(['url1', 'url2', 'url3'])).toEqual(['url1', 'url3']);
  });

  it('enables Continue button when 2-4 videos are selected', () => {
    renderPage();
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).not.toBeDisabled();
  });

  it('handles continue: calls uploadClips, stores last action, and navigates', async () => {
    vi.mocked(uploadClips).mockResolvedValue({ action_id: 42 });
    renderPage();

    const file = new File(['vid'], 'vid.mp4', { type: 'video/mp4' });
    const input = screen.getByLabelText(/Drag & drop your videos here/i);
    fireEvent.change(input, { target: { files: [file, file] } });

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(uploadClips).toHaveBeenCalledWith([file, file], 'header.payload.signature');
      expect(localStorage.getItem('last_action_id')).toBe('42');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

});
