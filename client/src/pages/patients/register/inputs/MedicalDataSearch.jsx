import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Combobox,
  useCombobox,
  Pill,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Modal,
  Button,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCamera } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import SearchDatabaseInputField from './SearchDatabaseInputField';
import LifelineAPI from '#app/LifelineAPI';

const API_PATHS = {
  allergies: 'allergy',
  medications: 'medication',
  conditions: 'condition',
};

const medicalDataSearchProps = {
  category: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  initialMedicalData: PropTypes.array,
};

/**
 *  Medical Data Search component for Medical Data section of patient form
 * @param {PropTypes.InferProps<typeof medicalDataSearchProps>} props
 */
export default function MedicalDataSearch ({
  category,
  form,
  initialMedicalData,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState(initialMedicalData);
  const [empty, setEmpty] = useState(false);
  const [search, setSearch] = useState('');
  const abortController = useRef();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleRecognizeMedication = async (event) => {
    close();
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { name } = await LifelineAPI.recognizeMedication(file);
      setSearch(name);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with recognizing medication from image',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMedicalData !== undefined) {
      setValue(initialMedicalData);
    }
  }, [initialMedicalData]);

  const fetchOptions = useDebouncedCallback(async (query) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    try {
      const result = await LifelineAPI.getMedicalData(
        category,
        API_PATHS[category],
        query
      );
      setData(result);
      setLoading(false);
      setEmpty(result.length === 0);
      abortController.current = undefined;
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with fetching data from server',
        color: 'red',
      });
      abortController.current = undefined;
      setLoading(false);
    }
  }, 500);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleSelectValue = (id, key) => {
    const name = key.children;
    setValue((current) =>
      current.includes(id)
        ? current.filter((v) => v.id !== id)
        : [...current, { id, name }]
    );

    form.setFieldValue(`medicalData.${category}`, (current) => [
      ...current,
      id,
    ]);
    combobox.closeDropdown();
    setSearch('');
  };

  const handleValueRemove = (val) => {
    setValue((current) => current.filter((v) => v.id !== val));
    form.setFieldValue(`medicalData.${category}`, (current) =>
      current.filter((v) => v !== val)
    );
  };

  const values = value?.map((item) => {
    return (
      <Pill
        key={item?.id}
        withRemoveButton
        radius='md'
        size='md'
        onRemove={() => handleValueRemove(item?.id)}
      >
        {item?.name}
      </Pill>
    );
  });

  const options = (data || [])
    .filter((item) => !value.some((v) => v.id === item.id))
    .map((item) => (
      <Combobox.Option
        value={item.id}
        key={item.id}
        active={value.includes(item.name)}
      >
        {item.name}
      </Combobox.Option>
    ));

  /**
   *
   * Conditional rendering of combobox content
   */
  function renderComboxContent () {
    if (empty) {
      return <Combobox.Empty>No results found</Combobox.Empty>;
    }

    if (data.length === 0) {
      return <Combobox.Empty>Start typing to search</Combobox.Empty>;
    }

    if (options.length === 0) {
      return <Combobox.Empty>All options selected</Combobox.Empty>;
    }

    return (
      <ScrollArea.Autosize type='scroll' mah={200}>
        {options}
      </ScrollArea.Autosize>
    );
  }

  return (
    <Box>
      <SearchDatabaseInputField
        data={data}
        loading={loading}
        combobox={combobox}
        label={category.charAt(0).toUpperCase() + category.slice(1)}
        searchQuery={search}
        rightSection={
          category === 'medications' && (
            <Tooltip label='Recognize Medication'>
              <ActionIcon onClick={open} loading={loading}>
                <IconCamera />
              </ActionIcon>
            </Tooltip>
          )
        }
        handleSelectValue={handleSelectValue}
        fetchOptions={fetchOptions}
        comboboxOptions={renderComboxContent}
        handleSearch={setSearch}
      >
        <Pill.Group style={{ marginTop: '6px' }}>{values}</Pill.Group>
      </SearchDatabaseInputField>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleRecognizeMedication}
      />
      <input
        type='file'
        accept='image/*'
        capture='user'
        ref={cameraInputRef}
        style={{ display: 'none' }}
        onChange={handleRecognizeMedication}
      />
      <Modal opened={opened} onClose={close} title='Recognize Medication'>
        <Group grow>
          <Button onClick={() => fileInputRef.current.click()}>
            Upload from Library
          </Button>
          <Button onClick={() => cameraInputRef.current.click()}>
            Take Picture
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}

MedicalDataSearch.propTypes = medicalDataSearchProps;
