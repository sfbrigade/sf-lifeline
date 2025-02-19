import PropTypes from 'prop-types';

import { useState, useContext, useCallback } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useDeletePhysicians } from './useDeletePhysicians';
import { notifications } from '@mantine/notifications';
import classes from './Physicians.module.css';
import Context from '../../Context';

import PhysiciansTableRow from './PhysiciansTableRow';
import DataTable from '../../components/DataTable/DataTable';

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
      createdBy: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedBy: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Patients table component
 * @param {PropTypes.InferProps<typeof physiciansTableProps>} props
 */
export default function PhysiciansTable ({ headers, data }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { mutateAsync: deletePatient, isPending } = useDeletePhysicians();
  const { user } = useContext(Context);

  const showDeleteConfirmation = useCallback(
    (patient) => {
      setSelectedPatient(patient);
      open();
    },
    [open]
  );
  const confirmPatientDeletion = async () => {
    try {
      await deletePatient(selectedPatient.id);
      notifications.show({
        title: 'Success',
        message: 'Patient deleted successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete patient:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete patient.',
        color: 'red',
      });
    }
    if (!isPending) {
      setSelectedPatient(null);
      close();
    }
  };

  const cancelPatientDeletion = () => {
    setSelectedPatient(null);
    close();
  };

  const renderRow = useCallback(
    (patient) => (
      <PhysiciansTableRow
        key={patient.id}
        patient={patient}
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
        classNames={{ title: classes.title }}
      >
        <Text fw={600}>
          Are you sure you want to delete this patient record?
        </Text>
        <Button
          classNames={{ root: classes.button }}
          color='red'
          fullWidth
          onClick={confirmPatientDeletion}
          loading={isPending}
        >
          Yes
        </Button>
        <Button
          classNames={{ root: classes.button }}
          color='blue'
          fullWidth
          onClick={cancelPatientDeletion}
          disabled={isPending}
        >
          No
        </Button>
      </Modal>
    </>
  );
}

PhysiciansTable.propTypes = physiciansTableProps;
