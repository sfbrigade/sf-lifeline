import PropTypes from 'prop-types';

import { useState, useContext, useCallback } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Context from '../../Context';

import HospitalsTableRow from './HospitalsTableRow';
import DataTable from '../../components/DataTable/DataTable';
import { useDeleteHopsital } from './useDeleteHospital';

const hospitalsTableProps = {
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
 * Hospitals table component
 * @param {PropTypes.InferProps<typeof hospitalsTableProps>} props
 */
export default function HospitalsTable ({ headers, data }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [hospital, setSelectedHospital] = useState(null);
  const { mutateAsync: deleteHospital, isPending } = useDeleteHopsital();
  const { user } = useContext(Context);

  const showDeleteConfirmation = useCallback(
    (hospitals) => {
      setSelectedHospital(hospitals);
      open();
    },
    [open]
  );

  const confirmHospitalDeletion = async () => {
    try {
      await deleteHospital(hospital.id);
      notifications.show({
        title: 'Success',
        message: 'Hospital deleted successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete Hospital:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete Hospital.',
        color: 'red',
      });
    }
    if (!isPending) {
      setSelectedHospital(null);
      close();
    }
  };

  const cancelHospitalDeletion = () => {
    setSelectedHospital(null);
    close();
  };

  const renderRow = useCallback(
    (hospitals) => (
      <HospitalsTableRow
        key={hospitals.id}
        hospitals={hospitals}
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
        emptyStateMessage='No hospitals found.'
      />
      <Modal
        opened={opened}
        onClose={close}
        title='Delete Hospital'
      >
        <Text fw={600}>
          Are you sure you want to delete this hospital {hospital?.name}?
        </Text>
        <Button
          color='red'
          fullWidth
          onClick={confirmHospitalDeletion}
          loading={isPending}
        >
          Yes
        </Button>
        <Button
          color='blue'
          fullWidth
          onClick={cancelHospitalDeletion}
          disabled={isPending}
        >
          No
        </Button>
      </Modal>
    </>
  );
}

HospitalsTable.propTypes = hospitalsTableProps;
