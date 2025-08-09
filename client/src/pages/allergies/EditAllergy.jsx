import { useNavigate } from 'react-router';
import { Container, Grid } from '@mantine/core';

import AllergyForm from './AllergyForm';

export default function EditAllergy () {
  const navigate = useNavigate();

  function onSuccess (data) {
    navigate(`/allergies/${data.id}`);
  }

  function onError (error) {
    console.error('Error updating allergy:', error);
  }

  return (
    <Container component='main'>
      <h1>Edit Allergy</h1>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <AllergyForm onSuccess={onSuccess} onError={onError} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
