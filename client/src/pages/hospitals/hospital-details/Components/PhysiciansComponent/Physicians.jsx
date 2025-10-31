import PropTypes from 'prop-types';

import { useMemo } from 'react';
import { Box, Button, Group, LoadingOverlay, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { usePhysicians } from '../../../../physicians/usePhysicians';
import PhysiciansTable from '../../../../physicians/PhysiciansTable';
import AddPhysicianModal from './AddPhysicianModal.jsx';

const physiciansProps = {
  hospitalId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
};

/**
 *  Physicians page component
 *
 */
export default function Physicians ({ hospitalId, canEdit = false }) {
  const { physicians, headers, isFetching } = usePhysicians(hospitalId);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const existingPhysicianIds = useMemo(
    () => (physicians ?? []).map((entry) => entry.id),
    [physicians]
  );

  return (
    <>
      <Group justify='space-between' align='center' mb='sm'>
        <Title order={2}>Physicians</Title>
        {canEdit && (
          <Button onClick={openModal}>
            Add physician
          </Button>
        )}
      </Group>
      <Box pos='relative'>
        <LoadingOverlay
          visible={isFetching}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <PhysiciansTable headers={headers} data={physicians} />
      </Box>
      {canEdit && (
        <AddPhysicianModal
          hospitalId={hospitalId}
          opened={modalOpened}
          onClose={closeModal}
          existingPhysicianIds={existingPhysicianIds}
        />
      )}
    </>
  );
}

Physicians.propTypes = physiciansProps;
