import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { Container, Grid, Loader, Text, Title, Group, Button, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useAuthorization } from '#hooks/useAuthorization.jsx';
import LifelineAPI from '#app/LifelineAPI.js';


/**
 *
 * Allergy page component
 */
export default function AllergyDetail() {
	const { allergyId } = useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { user } = useAuthorization();

	const { data, isError, isLoading } = useQuery({
		queryKey: ['allergy', allergyId],
		queryFn: async () => {
			const res = await LifelineAPI.getAllergy(allergyId);
			if (res.status === StatusCodes.OK) {
				return await res.json();
			} else {
				throw new Error('Failed to fetch allergy.');
			}
		},
		retry: false,
	});

	if (isLoading || isError) {
		return <Loader />;
	}

	console.log(data)

	const canEdit = user?.role === 'VOLUNTEER' || user?.role === 'STAFF' || user?.role === 'ADMIN';
	return (
		<Container component='main'>
			<Group>
				<Title order={2} my='sm'>
					{data?.name}
				</Title>
				{canEdit && <Button component={Link} to='edit'>Edit</Button>}
			</Group>
			<Grid mb='md'>
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Paper shadow='xs' p='md' radius='md' withBorder>
						<Title order={5}>Name</Title>
						<Text mb='xs'>{data?.name}</Text>
						<Title order={5}>Code</Title>
						<Text mb='xs'>{data?.code}</Text>
						<Title order={5}>Type</Title>
						<Text mb='xs'>{data?.type}</Text>
						<Title order={5}>System</Title>
						<Text mb='xs'>{data?.system}</Text>
					</Paper>
				</Grid.Col>
			</Grid>
		</Container>
	);
}
