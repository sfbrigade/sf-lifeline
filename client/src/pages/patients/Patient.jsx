import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI.js';
import { StatusCodes } from 'http-status-codes';
import { useEffect } from 'react';

/**
 * 
 * Patient page component
 */
export default function Patient() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const { data, isSuccess, isError } = useQuery({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await LifelineAPI.getPatient(patientId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
  });
  console.log(data, isSuccess, isError);

  useEffect(() => {
    if (isError) {
      navigate('/admin/patients/register/' + patientId, { replace: true });
    }
  }, [isError, navigate, patientId]);

  return (
    <main>
      <h1>Patient</h1>
      <p>This is the patient page</p>
    </main>
  );
}
