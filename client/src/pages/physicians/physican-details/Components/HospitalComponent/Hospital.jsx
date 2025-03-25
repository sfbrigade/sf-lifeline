import {
  LoadingOverlay,
} from '@mantine/core';

import { useHospitals } from './useHospital';
import HospitalTable from './HospitalTable';

/**
 *  Physicians page component
 *
 */
export default function Hospital ({ physicansId }) {
  const { hospitals, headers, isFetching, setPage, setSearch } = useHospitals(physicansId);

  return (
    <>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <HospitalTable headers={headers} hospitals={hospitals} />
    </>
  );
}
