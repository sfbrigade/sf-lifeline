import {
  Group,
  LoadingOverlay,
} from '@mantine/core';
import { usePhysicanPatients } from './usePhysicanPatients';
import PatientsTable from './PhysicanPatientsTable';

/**
 *  PhysicanPatients page component
 *
 */
export default function PhysicanPatients ({ physicansId }) {
  const { patients, headers, isFetching, } = usePhysicanPatients(physicansId);

  return (
    <>
      <Group justify='space-between' wrap='nowrap' my='sm' />
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <PatientsTable headers={headers} patients={patients} />
    </>
  );
}
