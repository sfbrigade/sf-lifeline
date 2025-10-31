import PropTypes from 'prop-types';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Group,
  Modal,
  Pagination,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Loader,
  Center,
  Divider,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import LifelineAPI from '#app/LifelineAPI.js';

import { useAvailablePhysicians } from './useAvailablePhysicians.jsx';

const addPhysicianModalProps = {
  hospitalId: PropTypes.string.isRequired,
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  existingPhysicianIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AddPhysicianModal ({
  hospitalId,
  opened,
  onClose,
  existingPhysicianIds,
}) {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const resetState = () => {
    setSearchValue('');
    setSelected([]);
    setPage(1);
  };

  useEffect(() => {
    if (!opened) {
      resetState();
    }
  }, [opened]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { physicians, pages, isFetching, isLoading } = useAvailablePhysicians(
    debouncedSearch,
    page,
    existingPhysicianIds
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleSelection = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((entry) => entry !== id);
      }

      return [...prev, id];
    });
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (physicianIds) => {
      const response = await LifelineAPI.linkPhysiciansToHospital(
        hospitalId,
        physicianIds
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message ?? 'Failed to link physicians.');
      }

      return response.json();
    },
    onSuccess: (result) => {
      notifications.show({
        title: 'Physicians linked',
        message: result?.message ?? 'Physicians linked successfully.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['physicians'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['availablePhysicians'], exact: false });
      resetState();
      onClose();
    },
    onError: (error) => {
      notifications.show({
        title: 'Unable to link physicians',
        message: error.message,
        color: 'red',
      });
    },
  });

  const handleSubmit = async () => {
    await mutateAsync(selected);
  };

  const handleCancel = () => {
    if (isPending) {
      return;
    }

    onClose();
  };

  const renderContent = () => {
    if ((isLoading || isFetching) && physicians.length === 0) {
      return (
        <Center py='lg'>
          <Loader size='sm' />
        </Center>
      );
    }

    if (physicians.length === 0) {
      return (
        <Center py='lg'>
          <Text c='dimmed'>No physicians available to add.</Text>
        </Center>
      );
    }

    return physicians.map((physician) => (
      <Checkbox
        key={physician.id}
        value={physician.id}
        checked={selectedSet.has(physician.id)}
        onChange={() => toggleSelection(physician.id)}
        label={
          <Stack gap={2}>
            <Text fw={600}>{physician.name}</Text>
            <Text size='sm' c='dimmed'>
              {physician.email}
            </Text>
            <Text size='sm' c='dimmed'>
              {physician.phone}
            </Text>
          </Stack>
        }
      />
    ));
  };

  return (
    <Modal opened={opened} onClose={handleCancel} title='Add physicians'>
      <Stack gap='md'>
        <TextInput
          placeholder='Search physicians'
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
        />
        <Divider />
        <ScrollArea.Autosize mah={280} type='scroll'>
          <Stack gap='sm'>{renderContent()}</Stack>
        </ScrollArea.Autosize>
        {pages > 1 && (
          <Pagination value={page} onChange={setPage} total={pages} />
        )}
        <Group justify='flex-end'>
          <Button variant='default' onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selected.length === 0} loading={isPending}>
            Add physicians
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

AddPhysicianModal.propTypes = addPhysicianModalProps;
