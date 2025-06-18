import PropTypes from 'prop-types';

import { useState, useCallback } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useDeletePhysician } from './useDeletePhysician';
import { notifications } from '@mantine/notifications';

import { useAppContext } from '#app/AppContext';
import DataTable from '#components/DataTable/DataTable';
import PhysiciansTableRow from './PhysiciansTableRow';

const physiciansTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Patients table component
 * @param {PropTypes.InferProps<typeof physiciansTableProps>} props
 */
export default function PhysiciansTable ({ headers, data }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [physician, setSelectedPhysician] = useState(null);
  const { mutateAsync: deletePhysican, isPending } = useDeletePhysician();
  const { user } = useAppContext();

  const showDeleteConfirmation = useCallback(
    (physicians) => {
      setSelectedPhysician(physicians);
      open();
    },
    [open]
  );

  const confirmPhysicianDeletion = async () => {
    try {
      await deletePhysican(physician.id);
      notifications.show({
        title: 'Success',
        message: 'Physician deleted successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete physician:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete physician.',
        color: 'red',
      });
    }
    if (!isPending) {
      setSelectedPhysician(null);
      close();
    }
  };

  const cancelPhysiciantDeletion = () => {
    setSelectedPhysician(null);
    close();
  };

  const renderRow = useCallback(
    (physician) => (
      <PhysiciansTableRow
        key={physician.id}
        physician={physician}
        headers={headers}
        onDelete={showDeleteConfirmation}
        showDeleteMenu={user?.role === 'ADMIN'}
      />
    ),
    [headers, user?.role, showDeleteConfirmation]
  );

  return (
    <>
      <DataTable
        headers={headers}
        data={data}
        renderRow={renderRow}
        emptyStateMessage='No patients found.'
      />
      <Modal
        opened={opened}
        onClose={close}
        title='Delete Patient'
      >
        <Text fw={600}>
          Are you sure you want to delete this physician record?
        </Text>
        <Button
          color='red'
          fullWidth
          onClick={confirmPhysicianDeletion}
          loading={isPending}
        >
          Yes
        </Button>
        <Button
          color='blue'
          fullWidth
          onClick={cancelPhysiciantDeletion}
          disabled={isPending}
        >
          No
        </Button>
      </Modal>
    </>
  );
}

PhysiciansTable.propTypes = physiciansTableProps;
