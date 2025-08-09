import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert } from './alert';

const meta = {
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};