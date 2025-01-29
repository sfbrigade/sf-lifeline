import PropTypes from 'prop-types';
import { Menu, ActionIcon } from '@mantine/core';
import { TbDotsVertical as IconDotsVertical } from 'react-icons/tb';

const tableMenuProps = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      to: PropTypes.string,
      color: PropTypes.string,
      component: PropTypes.elementType,
      divider: PropTypes.bool,
      isLabel: PropTypes.bool,
    })
  ).isRequired,
};

/**
 * Reusable table menu component
 * @param {PropTypes.InferProps<typeof tableMenuProps>} props
 */
export default function TableMenu ({ menuItems }) {
  return (
    <Menu shadow='md'>
      <Menu.Target>
        <ActionIcon variant='subtle' color='gray'>
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Menu.Divider key={`divider-${index}`} />;
          }
          if (item.isLabel) {
            return <Menu.Label key={`label-${index}`}>{item.label}</Menu.Label>;
          }
          return (
            <Menu.Item
              key={item.label}
              leftSection={item.icon}
              onClick={item.onClick}
              to={item.to}
              color={item.color}
              component={item.component}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}

TableMenu.propTypes = tableMenuProps;
