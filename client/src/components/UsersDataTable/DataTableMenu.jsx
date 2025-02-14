import React from 'react';
import { rem } from '@mantine/core';
import {
  TbSettings as IconSettings,
  TbMessageCircle as IconMessageCircle,
  TbTrash as IconTrash,
  TbArrowsLeftRight as IconArrowsLeftRight,
} from 'react-icons/tb';
import TableMenu from '../DataTable/TableMenu';

/**
 *
 */
export function DataTableMenu () {
  const menuItems = [
    {
      icon: <></>,
      isLabel: true,
      label: 'Account',
    },
    {
      icon: <IconSettings style={{ width: rem(14), height: rem(14) }} />,
      label: 'Account',
      onClick: () => { /* implement account action */ },
    },
    {
      icon: <IconMessageCircle style={{ width: rem(14), height: rem(14) }} />,
      label: 'Message',
      onClick: () => { /* implement message action */ },
    },
    {
      icon: <></>,
      label: '',
      divider: true,
    },
    {
      icon: <></>,
      label: '',
      isLabel: true,
      label: 'Danger zone',
    },
    {
      icon: <IconArrowsLeftRight style={{ width: rem(14), height: rem(14) }} />,
      label: 'Update role',
      onClick: () => { /* implement role update action */ },
    },
    {
      icon: <IconTrash style={{ width: rem(14), height: rem(14) }} />,
      label: 'Delete account',
      color: 'red',
      onClick: () => { /* implement delete action */ },
    },
  ];

  return <TableMenu menuItems={menuItems} />;
}
