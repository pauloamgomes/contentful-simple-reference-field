import React from 'react';
import {
  Select,
  Option,
  FieldGroup,
  RadioButtonField,
  Tag
} from '@contentful/forma-36-react-components';
//

type EntryType = {
  display: string;
  status: string;
};

type Props = {
  values: Record<string, EntryType>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selected: string;
};

export const Dropdown = ({ values, onChange, selected = '' }: Props) => (
  <>
    <Select
      id="simple-reference"
      name="simpleReference"
      onChange={onChange}
      value={selected}
      width="large">
      <Option value="">Choose a value</Option>
      {Object.keys(values)
        .filter((key: string) => {
          if (values[key].status === 'Archived' && key !== selected) {
            return false;
          }
          return true;
        })
        .map((key: string) => (
          <Option key={`entry-${key}`} value={key}>
            {values[key].display}
          </Option>
        ))}
    </Select>
    {selected && values[selected] && values[selected].status && (
      <Tag
        className="entry-tag"
        entityStatusType={
          values[selected].status.toLowerCase() as 'published' | 'draft' | 'archived' | 'changed'
        }>
        {values[selected].status}
      </Tag>
    )}
  </>
);

export const Radios = ({ values, selected, onChange }: Props) => (
  <FieldGroup>
    {Object.keys(values)
      .filter((key: string) => {
        if (values[key].status === 'Archived' && key !== selected) {
          return false;
        }
        return true;
      })
      .map((key: string) => (
        <RadioButtonField
          id={key}
          name={key}
          key={`entry-${key}`}
          value={key}
          labelText={values[key].display}
          checked={selected === key}
          onChange={onChange}
          labelIsLight
          helpText={values[key].status}
          helpTextProps={{ className: `entry-status ${values[key].status.toLowerCase()}` }}
        />
      ))}
  </FieldGroup>
);
