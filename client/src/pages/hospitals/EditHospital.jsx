import { useNavigate } from 'react-router';
import { Container } from '@mantine/core';

import HospitalForm from './hospital-details/Components/HospitalForm';

export default function EditHospital () {
  const navigate = useNavigate();

  function onSuccess (data) {
    navigate(`/hospitals/${data.id}`);
  }

  function onError (error) {
    console.error('Error updating hospital:', error);
  }

  return (
    <Container component='main'>
      <h1>Edit Hospital</h1>
      <HospitalForm onSuccess={onSuccess} onError={onError} />
    </Container>
  );
}
