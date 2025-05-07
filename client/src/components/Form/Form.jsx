import { TextInput, Button, Group, Grid, Container } from '@mantine/core';
import PropTypes from 'prop-types';

/**
 * Renders text input fields based on the form values
 * @param {object} form - The Mantine form object containing form state and methods
 * @returns {JSX.Element[]} Array of TextInput components
 */
function renderTextInputs (form) {
  const listOfTextInput = Object.entries(form.getValues())
    .filter(([key]) => key !== 'id')
    .map(([key]) => (
      <TextInput label={key} key={key} {...form.getInputProps(key)} />
    ));
  return listOfTextInput;
}

/**
 * A reusable form component that renders form fields based on the provided form object
 * @param {object} props - Component props
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {object} props.form - Mantine form object
 * @returns {JSX.Element} Form component
 */
export default function Form ({ onSubmit, form }) {
  return (
    <Container component='main'>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form onSubmit={onSubmit}>
            {renderTextInputs(form)}

            <Group mt='md'>
              <Button type='submit'>Submit</Button>
            </Group>
          </form>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getValues: PropTypes.func.isRequired,
    getInputProps: PropTypes.func.isRequired,
  }).isRequired,
};
