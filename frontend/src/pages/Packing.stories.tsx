import type { Meta, StoryObj } from '@storybook/react-vite';

import Packing from './Packing';

const meta = {
  component: Packing,
} satisfies Meta<typeof Packing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};