import {
  LoadingOverlay,
} from '@mantine/core';

import { usePatients } from './usePatients';
import PatientsTable from '../../../../patients/PatientsTable';

/**
 *  Physicians page component
 *
 */
export default function Patients ({ hospitalId }) {
  const { patients, headers, isFetching } = usePatients(hospitalId);

  return (
    <>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <PatientsTable headers={headers} data={patients} />

    </>
  );
}
