import PropTypes from 'prop-types';

import { useState, useCallback } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { useAppContext } from '#app/AppContext';
import AllergiesTableRow from './AllergiesTableRow';
import DataTable from '#components/DataTable/DataTable';
import { useDeleteAllergy } from './useDeleteAllergy';

const allergiesTableProps = {
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
      type: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Allergies table component
 * @param {PropTypes.InferProps<typeof allergiesTableProps>} props
 */
export default function AllergiesTable ({ headers, data }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [allergy, setSelectedAllergy] = useState(null);
  const { mutateAsync: deleteAllergy, isPending } = useDeleteAllergy();
  const { user } = useAppContext();

  const showDeleteConfirmation = useCallback(
    (allergies) => {
      setSelectedAllergy(allergies);
      open();
    },
    [open]
  );

  const confirmAllergyDeletion = async () => {
    try {
      await deleteAllergy(allergy.id);
      notifications.show({
        title: 'Success',
        message: 'Allergy deleted successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete Allergy:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete Allergy.',
        color: 'red',
      });
    }
    if (!isPending) {
      setSelectedAllergy(null);
      close();
    }
  };

  const cancelAllergyDeletion = () => {
    setSelectedAllergy(null);
    close();
  };

  const renderRow = useCallback(
    (allergy) => (
      <AllergiesTableRow
        key={allergy.id}
        allergy={allergy}
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
        emptyStateMessage='No allergies found.'
      />
      <Modal
        opened={opened}
        onClose={close}
        title='Delete Allergy'
      >
        <Text fw={600}>
          Are you sure you want to delete this Allergy {allergy?.name}?
        </Text>
        <Button
          color='red'
          fullWidth
          onClick={confirmAllergyDeletion}
          loading={isPending}
        >
          Yes
        </Button>
        <Button
          color='blue'
          fullWidth
          onClick={cancelAllergyDeletion}
          disabled={isPending}
        >
          No
        </Button>
      </Modal>
    </>
  );
}

AllergiesTable.propTypes = allergiesTableProps;
