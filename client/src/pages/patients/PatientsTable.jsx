import PropTypes from 'prop-types';

import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Paper, Table, ActionIcon, Menu, Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useDeletePatient } from './useDeletePatient';
import { notifications } from '@mantine/notifications';
import {
  IconDotsVertical,
  IconUser,
  IconQrcode,
  IconTrash,
} from '@tabler/icons-react';
import classes from './Patients.module.css';
import Context from '../../Context';

const patientTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    }),
  ),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdBy: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedBy: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    }),
  ),
};

/**
 * Patients table component
 * @param {PropTypes.InferProps<typeof patientTableProps>} props
 */
export default function PatientsTable({ headers, data }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { mutate: deletePatient } = useDeletePatient();
  const { user } = useContext(Context);

  const showDeleteConfirmation = (patient) => {
    setSelectedPatient(patient);
    open();
  };

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
    close();
  };

  return (
    <>
      <Paper withBorder className={classes.tableWrapper}>
        <Table.ScrollContainer minWidth={500} type="native">
          <Table
            stickyHeader
            highlightOnHover
            verticalSpacing="lg"
            classNames={{ table: classes.table }}
          >
            <Table.Thead>
              <Table.Tr>
                {headers.map((header) => (
                  <Table.Th key={header.key}>{header.text}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.length > 0 ? (
                data?.map((patient) => (
                  <Table.Tr key={patient.id}>
                    {headers.map((header) => (
                      <Table.Td key={patient[header.key] + header.key}>
                        {patient[header.key]}
                      </Table.Td>
                    ))}
                    <Table.Td>
                      <Menu shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconUser size={18} />}
                            component={Link}
                            to={`/patients/${patient.id}`}
                          >
                            View/Edit
                          </Menu.Item>
                          <Menu.Item leftSection={<IconQrcode size={18} />}>
                            Reprint QR Code
                          </Menu.Item>
                          {user?.role === 'ADMIN' && (
                            <Menu.Item
                              leftSection={<IconTrash size={18} />}
                              color="red"
                              onClick={() =>
                                showDeleteConfirmation({
                                  id: patient.id,
                                  name: patient.name,
                                })
                              }
                            >
                              Delete
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={headers.length}>
                    No patients found.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      <Modal opened={opened} onClose={close} title="Delete Patient">
        <p>Are you sure you want to delete this patient record?</p>
        <Button color="red" fullWidth onClick={confirmPatientDeletion}>
          Yes
        </Button>
        <Button color="blue" fullWidth onClick={close}>
          No
        </Button>
      </Modal>
    </>
  );
}

PatientsTable.propTypes = patientTableProps;
