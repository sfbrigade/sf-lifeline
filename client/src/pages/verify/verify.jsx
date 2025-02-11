import { LoadingOverlay } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { notifications } from '@mantine/notifications';
/**
 * Email Verification
 */
function Verify () {
  const { emailVerificationToken } = useParams();
  const navigate = useNavigate();

  const { isFetching } = useQuery({
    queryFn: () =>
      fetch('/api/v1/users/verify', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailVerificationToken,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(response);
          }
        })
        .then(() => {
          notifications.show({
            color: 'green',
            title: 'Your email address was successfully verified.',
            autoClose: 5000,
          });
          navigate('/login');
        })
        .catch(() => {
          notifications.show({
            color: 'red',
            title: 'Invalid Email Verification Token',
            autoClose: 5000,
          });
          navigate('/');
        }),
  });
  return (
    <div>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
    </div>
  );
}

export default Verify;
