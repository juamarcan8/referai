import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainPage from '../src/pages/MainPage';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';

// Mock de las dependencias de API
const mockPredResponse = {
    results: [
        {
            filename: "video1.mp4",
            is_foul: true,
            foul_confidence: 88.5,
            no_foul_confidence: 11.5,
            foul_model_results: [{ model: "modelA", prediction: 1 }],
            severity: { no_card: 10.5, red_card: 60.5, yellow_card: 29.0 },
            severity_model_results: [{ model: "modelB", prediction: 1 }],
        },
    ],
};

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

// Mock URL.createObjectURL
beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mocked-url');
    global.URL.revokeObjectURL = vi.fn();
});

describe('MainPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'header.payload.signature');
        localStorage.setItem('last_action_id', 'action123');

        fetchMock.mockImplementation((url, options) => {
            if (url.includes('/action/action123')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        clips: [
                            { content: btoa('mocked-binary-data-1') },
                            { content: btoa('mocked-binary-data-2') },
                        ],
                    }),
                });
            }

            if (url.includes('/v1/predict/action123') && options?.method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPredResponse),
                });
            }

            if (url.includes('/v1/predict/action123') && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPredResponse),
                });
            }

            return Promise.reject(new Error('Unexpected request'));
        });
    });

    const renderPage = () =>
        render(
            <AuthProvider>
                <BrowserRouter>
                    <MainPage />
                </BrowserRouter>
            </AuthProvider>
        );

    it('runs prediction when clicking "Run Prediction"', async () => {
        renderPage();

        // Esperar que se cargue completamente
        await screen.findByText(/foul prediction/i);

        const predictButton = screen.getByRole('button', { name: /run prediction/i });
        fireEvent.click(predictButton);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/v1/predict/action123'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: expect.stringContaining('Bearer'),
                    }),
                })
            );
        });
    });
});
