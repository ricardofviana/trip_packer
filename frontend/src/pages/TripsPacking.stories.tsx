import type { Meta, StoryObj } from '@storybook/react-vite';

import TripsPacking from './TripsPacking';

const meta = {
  component: TripsPacking,
} satisfies Meta<typeof TripsPacking>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};