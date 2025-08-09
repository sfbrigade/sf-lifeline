import { Modal } from '@mantine/core';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';

import AllergyForm from './AllergyForm';

/**
 * Allergy Modal
 *  @param {object} props - The prop for the component
 *  @param {boolean} props.opened - State of modal being open or not
 *  @param {Function} props.close - Function to close the modal
 */
export default function AllergyModal ({ opened, close }) {
  const navigate = useNavigate();

  /**
   * Resets form value and closes the modal.
   */
  function onClose () {
    close();
  }

  function onSuccess (data) {
    navigate(`/allergies/${data.id}`);
  }

  function onError (error) {
    console.error('Error creating allergy:', error);
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title='Create Allergy'
      >
        <AllergyForm onSuccess={onSuccess} onError={onError} />
      </Modal>
    </>
  );
}

const allergyModalProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

AllergyModal.propTypes = allergyModalProps;
