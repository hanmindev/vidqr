import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from './Button';
export default {
    title: 'Button',
    component: Button,
} as ComponentMeta<typeof Button>;

export const Primary: ComponentStory<typeof Button> = () => <Button className="w-24 bg-gradient-to-r from-green-400 to-blue-500">yea</Button>;

