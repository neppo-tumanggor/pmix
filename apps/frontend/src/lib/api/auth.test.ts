import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, AxiosHeaders } from 'axios';

describe('API authentication recovery', () => {
  beforeEach(() => {
    vi.resetModules();
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    vi.stubGlobal('window', { location: { href: '/dashboard' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function setup(refreshToken: string | null = null) {
    const { default: client } = await import('./auth');
    const { useAuthStore } = await import('../../stores');
    useAuthStore.setState({ token: 'expired', refreshToken, isAuthenticated: true });
    client.defaults.adapter = async (config) => {
      if (config.headers.Authorization === 'Bearer renewed') {
        return { data: { ok: true }, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config };
      }
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
        data: {}, status: 401, statusText: 'Unauthorized', headers: new AxiosHeaders(), config,
      });
    };
    return { client, useAuthStore };
  }

  it('clears an unrecoverable session and redirects to login', async () => {
    const { client, useAuthStore } = await setup();
    await expect(client.get('/dashboard')).rejects.toThrow('Unauthorized');
    expect(window.location.href).toBe('/login');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('keeps invalid login credentials in the login flow', async () => {
    const { client } = await setup('refresh');
    const refresh = vi.spyOn(axios, 'post');
    await expect(client.post('/auth/login')).rejects.toThrow('Unauthorized');
    expect(refresh).not.toHaveBeenCalled();
    expect(window.location.href).toBe('/dashboard');
  });

  it('retries with renewed tokens and preserves them on later store writes', async () => {
    const { client, useAuthStore } = await setup('refresh');
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'renewed', refreshToken: 'rotated' } } });
    await expect(client.get('/dashboard')).resolves.toMatchObject({ data: { ok: true } });
    useAuthStore.getState().clearError();
    const persisted = JSON.parse(localStorage.getItem('auth-storage')!);
    expect(persisted.state.token).toBe('renewed');
    expect(persisted.state.refreshToken).toBe('rotated');
  });

  it('clears the session when refresh is rejected', async () => {
    const { client, useAuthStore } = await setup('refresh');
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Refresh expired'));
    await expect(client.get('/dashboard')).rejects.toThrow('Refresh expired');
    expect(useAuthStore.getState().token).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});
