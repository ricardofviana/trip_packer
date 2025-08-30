import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { itemsRepo } from '@/services/repos';
import ItemsPage from './Items';

// Mock the itemsRepo to avoid actual API calls
vi.mock('@/services/repos');

describe('ItemsPage', () => {
  test('should render the page title and the create form', async () => {
    // Arrange: Mock an empty list of items for the initial load
    vi.mocked(itemsRepo.listItems).mockResolvedValue([]);

    // Act
    render(<ItemsPage />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    // Simulate typing a name to enable the create button
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Test Item');

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /items/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /create item/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).not.toBeDisabled();
    });
  });

  test('should fetch and display a list of existing items', async () => {
    // Arrange
    const mockItems = [
      { id: '1', name: 'Sunscreen', category: 'TOILETRIES' },
      { id: '2', name: 'Passport', category: 'DOCUMENTS' },
      { id: '3', name: 'Hiking Boots', category: 'CLOTHING' },
    ];
    vi.mocked(itemsRepo.listItems).mockResolvedValue(mockItems);

    // Act
    render(<ItemsPage />);

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
