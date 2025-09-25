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
  Text
} from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import SearchDatabaseInputField from './SearchDatabaseInputField';
import RegisterAllergy from './RegisterAllergy';
import RegisterMedication from './RegisterMedication';
import RegisterCondition from './RegisterCondition';
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
  const [search, setSearch] = useState('');
  const [
    registerAllergyOpened,
    { open: openRegisterAllergy, close: closeRegisterAllergy },
  ] = useDisclosure(false);
  const [
    registerMedicationOpened,
    { open: openRegisterMedication, close: closeRegisterMedication },
  ] = useDisclosure(false);
  const [
    registerConditionOpened,
    { open: openRegisterCondition, close: closeRegisterCondition },
  ] = useDisclosure(false);
  const abortController = useRef();
  const cameraInputRef = useRef(null);
  // Removed modal; trigger camera directly from icon

  const handleRecognizeMedication = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      // Process sequentially: set search and open dropdown for each
      for (const file of files) {
        const { name } = await LifelineAPI.recognizeMedication(file);
        if (!name) continue;
        setSearch(name);
        fetchOptions(name);
        combobox.openDropdown();
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with recognizing medication from image',
        color: 'red',
      });
    } finally {
      setLoading(false);
      // Reset input so the same capture can retrigger
      event.target.value = null;
    }
  };

  useEffect(() => {
    if (initialMedicalData !== undefined) {
      setValue(initialMedicalData);
    }
  }, [initialMedicalData]);

  useEffect(() => {
    if (search) {
      fetchOptions(search);
    }
  }, [search]);

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
    if (id === '$register') {
      if (category === 'allergies') {
        openRegisterAllergy();
      } else if (category === 'medications') {
        openRegisterMedication();
      } else if (category === 'conditions') {
        openRegisterCondition();
      }
      combobox.closeDropdown();
      setSearch('');
    } else {
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
    }
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
    .filter((item) => !value?.some((v) => v.id === item.id))
    .map((item) => (
      <Combobox.Option
        value={item.id}
        key={item.id}
        active={value?.includes(item.name)}
      >
        {item.name}
      </Combobox.Option>
    ));

  /**
   *
   * Conditional rendering of combobox content
   */
  function renderComboxContent () {
    const registerOption = (
      <Combobox.Option value='$register'>
        <Text fw={700} size='sm'>
          + Register new {category}
        </Text>
      </Combobox.Option>
    );

    if (data.length === 0 && search.length === 0) {
      return (
        <>
          <Combobox.Empty>Start typing to search</Combobox.Empty>
          {(category === 'allergies' || category === 'medications' || category === 'conditions') && registerOption}
        </>
      );
    }

    if (options.length === 0) {
      return (
        <>
          <Combobox.Empty>No results found</Combobox.Empty>
          {(category === 'allergies' || category === 'medications' || category === 'conditions') && registerOption}
        </>
      );
    }

    return (
      <ScrollArea.Autosize type='scroll' mah={200}>
        {options}
        {(category === 'allergies' || category === 'medications' || category === 'conditions') && registerOption}
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
              <ActionIcon
                component='button'
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                loading={loading}
              >
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
        capture='environment'
        name='image'
        ref={cameraInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleRecognizeMedication}
      />
      <RegisterAllergy
        setAllergy={handleSelectValue}
        registerAllergyOpened={registerAllergyOpened}
        closeRegisterAllergy={closeRegisterAllergy}
        fetchOptions={fetchOptions}
      />
      <RegisterMedication
        setMedication={handleSelectValue}
        registerMedicationOpened={registerMedicationOpened}
        closeRegisterMedication={closeRegisterMedication}
        fetchOptions={fetchOptions}
      />
      <RegisterCondition
        setCondition={handleSelectValue}
        registerConditionOpened={registerConditionOpened}
        closeRegisterCondition={closeRegisterCondition}
        fetchOptions={fetchOptions}
      />
    </Box>
  );
}

MedicalDataSearch.propTypes = medicalDataSearchProps;
