import {
  LoadingOverlay,
} from '@mantine/core';

import { usePhysicians } from './usePhysicians';
import PhysiciansTable from '../../../../physicians/PhysiciansTable';

/**
 *  Physicians page component
 *
 */
export default function Physicians ({ hospitalId }) {
  const { physicians, headers, isFetching } = usePhysicians(hospitalId);

  return (
    <>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <PhysiciansTable headers={headers} data={physicians} />

    </>
  );
}
