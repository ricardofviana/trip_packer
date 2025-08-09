import type { Meta, StoryObj } from '@storybook/react-vite';

import ItemsTemplates from './ItemsTemplates';

const meta = {
  component: ItemsTemplates,
} satisfies Meta<typeof ItemsTemplates>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};