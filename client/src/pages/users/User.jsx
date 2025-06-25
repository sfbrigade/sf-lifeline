import { Container, Group, Paper, Title, Text, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';

import { useAppContext } from '#app/AppContext';
import LifelineAPI from '#app/LifelineAPI';

function User () {
  const { user } = useAppContext();
  const { userId } = useParams();
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const res = await LifelineAPI.getUser(userId);
      if (res.status === StatusCodes.OK) {
        return res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
    retry: false,
  });

  const canEdit = user?.role === 'ADMIN';
  const dateFormat = 'MMMM D, YYYY [at] h:mma';

  return (
    <Container component='main'>
      <Group>
        <Title order={2} my='sm'>
          {data?.firstName} {data?.middleName} {data?.lastName}
        </Title>
        {canEdit && <Button component={Link} to='edit'>Edit</Button>}
      </Group>
      <Paper mb='md' shadow='xs' p='md' radius='md' withBorder>
        <Title order={5}>First Name</Title>
        <Text mb='xs'>{data?.firstName}</Text>
        {data?.middleName &&
          <>
            <Title order={5}>Middle Name</Title>
            <Text mb='xs'>{data?.middleName}</Text>
          </>}
        <Title order={5}>Last Name</Title>
        <Text mb='xs'>{data?.lastName}</Text>
        <Title order={5}>Email</Title>
        <Text mb='xs'>{data?.email}</Text>
        <Title order={5}>Role</Title>
        <Text mb='xs'>{t(`Role.${data?.role}`)}</Text>
        {data?.licenseNumber &&
          <>
            <Title order={5}>License Number</Title>
            <Text mb='xs'>{data?.licenseNumber}</Text>
          </>}
      </Paper>
      <Paper shadow='xs' p='md' radius='md' withBorder>
        <Title order={5}>Registered</Title>
        <Text mb='xs'>{dayjs(data?.createdAt).format(dateFormat)}</Text>
        {data?.approvedAt &&
          <>
            <Title order={5}>Approved</Title>
            <Text mb='xs'>{dayjs(data?.approvedAt).format(dateFormat)}</Text>
          </>}
        {data?.disabledAt &&
          <>
            <Title order={5}>Disabled</Title>
            <Text mb='xs'>{dayjs(data?.disabledAt).format(dateFormat)}</Text>
          </>}
        {data?.rejectedAt &&
          <>
            <Title order={5}>Rejected</Title>
            <Text mb='xs'>{dayjs(data?.rejectedAt).format(dateFormat)}</Text>
          </>}
        <Title order={5}>Updated</Title>
        <Text mb='xs'>{dayjs(data?.updatedAt).format(dateFormat)}</Text>
      </Paper>
    </Container>
  );
}

export default User;
