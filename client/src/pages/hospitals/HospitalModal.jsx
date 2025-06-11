import { Modal } from '@mantine/core';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';

import HospitalForm from './hospital-details/Components/HospitalForm';

/**
 * Hospital Modal
 *  @param {object} props - The prop for the component
 *  @param {boolean} props.opened - State of modal being open or not
 *  @param {Function} props.close - Function to close the modal
 */
export default function HospitalModal ({ opened, close }) {
  const navigate = useNavigate();

  /**
   * Resets form value and closes the modal.
   */
  function onClose () {
    close();
  }

  function onSuccess (data) {
    navigate(`/hospitals/${data.id}`);
  }

  function onError (error) {
    console.error('Error creating hospital:', error);
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title='Create Hospital'
      >
        <HospitalForm onSuccess={onSuccess} onError={onError} />
      </Modal>
    </>
  );
}

const hospitalModalProps = {
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

HospitalModal.propTypes = hospitalModalProps;
