import PropTypes from 'prop-types';

import { Combobox, useCombobox, Loader, TextInput } from '@mantine/core';

const searchDatabaseInputFieldProps = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  search: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectValue: PropTypes.func.isRequired,
  fetchOptions: PropTypes.func.isRequired,
  removeValue: PropTypes.func.isRequired,
  comboboxOptions: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

/**
 *
 * @param {PropTypes.InferProps<typeof searchDatabaseInputFieldProps>} props
 */
export default function SearchDatabaseInputField({
  data,
  loading,
  search,
  inputValue,
  label,
  selectValue,
  fetchOptions,
  removeValue,
  comboboxOptions,
  handleSearch,
  disabled,
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleSelectValue = (id, key) => {
    selectValue(id, key);
    combobox.closeDropdown();
  };
  return (
    <Combobox
      onOptionSubmit={handleSelectValue}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.DropdownTarget>
        <Combobox.EventsTarget>
          <TextInput
            disabled={disabled}
            label={label}
            onFocus={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(inputValue);
              }
            }}
            onClick={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(inputValue);
              }
            }}
            onBlur={() => combobox.closeDropdown()}
            value={inputValue}
            placeholder={`Search ${label}`}
            onChange={(event) => {
              combobox.updateSelectedOptionIndex();
              handleSearch(event.currentTarget.value);
              fetchOptions(event.currentTarget.value);
              combobox.resetSelectedOption();
              combobox.openDropdown();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && search.length === 0) {
                event.preventDefault();
                removeValue();
              }
            }}
            rightSection={loading ? <Loader size="xs" /> : null}
          />
        </Combobox.EventsTarget>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown>
        <Combobox.Options>{comboboxOptions()}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

SearchDatabaseInputField.propTypes = searchDatabaseInputFieldProps;
