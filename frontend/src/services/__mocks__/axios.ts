import { vi } from 'vitest';

const mockAxios = {
  create: vi.fn(() => ({
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  })),
};

export default mockAxios;