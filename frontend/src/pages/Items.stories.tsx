import type { Meta, StoryObj } from '@storybook/react-vite';

import Items from './Items';

const meta = {
  component: Items,
} satisfies Meta<typeof Items>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
