import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from '../LifelineAPI.js';
import { StatusCodes } from 'http-status-codes';
import { useEffect } from 'react';
import { Loader } from '@mantine/core';

/**
 *
 * Patient page component
 */
export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await LifelineAPI.getPatient(patientId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },

    retry: false,
    refetchOnWindowFocus: false,
  });
  console.log(data, isSuccess, isError, isLoading);

  useEffect(() => {
    if (isError) {
      navigate('/patients/register/' + patientId, {
        replace: true,
        state: { existingPatient: false },
      });
    }
  }, [isError, navigate, patientId]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <main>
      <h1>Patient</h1>
      <p>This is the patient page</p>
      <p>Patient ID: {data?.id}</p>
      <p>Patient First Name: {data?.firstName}</p>
      <p>Patient Last Name: {data?.lastName}</p>
    </main>
  );
}
