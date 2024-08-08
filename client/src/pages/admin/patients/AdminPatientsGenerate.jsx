import React from 'react';
import { Container, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { QRCode } from 'react-qrcode-logo';

/**
 *
 * @returns {React.ReactElement}
 */
function AdminPatientsGenerate() {
  const { isLoading, data } = useQuery({
    queryFn: () =>
      fetch('/api/v1/patients/generate?count=12').then((response) =>
        response.json(),
      ),
  });
  return (
    <Container>
      {isLoading && <Loader />}
      {!isLoading && data?.map((url) => <QRCode key={url} value={url} />)}
    </Container>
  );
}
export default AdminPatientsGenerate;
