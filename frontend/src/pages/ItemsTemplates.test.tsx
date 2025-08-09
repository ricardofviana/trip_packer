import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { itemsRepo } from '@/services/repos/itemsRepo';
import ItemsTemplatesPage from './ItemsTemplates';

// Mock the itemsRepo to avoid actual API calls
vi.mock('@/services/repos/itemsRepo');

describe('ItemsTemplatesPage', () => {
  test('should render the page title and the create form', () => {
    // Arrange: Mock an empty list of items for the initial load
    vi.mocked(itemsRepo.listItems).mockResolvedValue({ data: [] });

    // Act
    render(<ItemsTemplatesPage />);

    // Assert
    expect(screen.getByRole('heading', { name: /item templates/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /create item template/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  test('should fetch and display a list of existing items', async () => {
    // Arrange
    const mockItems = [
      { id: '1', name: 'Sunscreen', category: 'TOILETRIES' },
      { id: '2', name: 'Passport', category: 'DOCUMENTS' },
      { id: '3', name: 'Hiking Boots', category: 'CLOTHING' },
    ];
    vi.mocked(itemsRepo.listItems).mockResolvedValue({ data: mockItems });

    // Act
    render(<ItemsTemplatesPage />);

    // Assert
    // Use `waitFor` to handle the asynchronous rendering of items
    await waitFor(() => {
      // Check that each item's name is rendered on the page
      mockItems.forEach(item => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      });
    });
  });
});
