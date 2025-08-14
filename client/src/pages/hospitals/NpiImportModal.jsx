import { Modal, Alert } from '@mantine/core';
import { useCreateHospital } from './useCreateHospital';
import NpiHospitalSearch from '#components/NpiHospitalSearch';
import { useState } from 'react';

export default function NpiImportModal({ opened, close }) {
  const { mutateAsync: createHospital, isPending, error } = useCreateHospital();
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSelectHospital = async (hospital) => {
    try {
      // The hospital object from NPI search has name, address, phone, npi
      // The createHospital mutation needs { name, address, phone, email }
      // We'll pass what we have, email will be null.
      const newHospitalData = {
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        npi: hospital.npi, // Assuming the backend can handle this or will ignore it
      };

      await createHospital(newHospitalData);
      setSuccessMessage(`Successfully imported ${hospital.name}.`);
      setTimeout(() => {
        close();
        setSuccessMessage(null);
      }, 2000); // Close modal after 2 seconds
    } catch (e) {
      // Error is already handled by the useCreateHospital hook's onError
      console.error('Import failed:', e);
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="Import Hospital from NPI Registry" size="xl">
      <NpiHospitalSearch onSelectHospital={handleSelectHospital} />
      {isPending && <Alert color="info">Importing hospital...</Alert>}
      {error && <Alert color="red">{error.message}</Alert>}
      {successMessage && <Alert color="green">{successMessage}</Alert>}
    </Modal>
  );
}
