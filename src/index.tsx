/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK, Link } from 'contentful-ui-extensions-sdk';
import { HelpText, ValidationMessage } from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
//
import './index.css';
import { Dropdown, Radios, Checkboxes } from './widgets';

interface SimpleReferenceProps {
  sdk: FieldExtensionSDK;
}

type EntryType = {
  display: string;
  status: string;
};

function getStatus(entity: any) {
  if (!!entity.sys.publishedVersion && entity.sys.version == entity.sys.publishedVersion + 1) {
    return 'Published';
  } else if (
    !!entity.sys.publishedVersion &&
    entity.sys.version >= entity.sys.publishedVersion + 2
  ) {
    return 'Changed';
  } else if (entity.sys.archivedVersion) {
    return 'Archived';
  }
  return 'Draft';
}

export const SimpleReference = ({ sdk }: SimpleReferenceProps) => {
  let detachExternalChangeHandler: Function | null = null;

  const fieldName = sdk.field.id;
  const instance: any = sdk.parameters.instance;
  const { display, limit, widget, defaultValue, filter } = instance;

  const [value, setValue] = React.useState(null as Link | Link[] | null);
  const [defaults, setDefaults] = React.useState([] as string[]);
  const [entries, setEntries] = React.useState({} as Record<string, EntryType>);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    sdk.window.startAutoResizer();

    const validations: any[] =
      sdk.field.type === 'Array'
        ? (sdk.field.items && sdk.field.items.validations) || []
        : sdk.field.validations;
    const contentType: string | null =
      validations.find((validation: any) => !!validation.linkContentType)['linkContentType'] ||
      null;

    if (contentType) {
      const query: any = {
        content_type: contentType,
        limit: limit && limit < 100 ? limit : 100
      };

      filter.split('|').forEach((piece: string) => {
        const [key, value] = piece.split(':');

        if (key && value) {
          query[key] = value;
        }
      });

      sdk.space.getEntries(query).then((result: any) => {
        const newEntries: Record<string, EntryType> = {};
        const locale = sdk.field.locale;
        const defaultLocale = sdk.locales.default;
        const checkedIds: string[] = [];

        try {
          const regex = new RegExp(`${defaultValue}`, 'i');

          result.items.forEach((item: any) => {
            const { sys, fields } = item;

            newEntries[sys.id] = {
              display: fields[display][locale] || fields[display][defaultLocale] || 'N/A',
              status: getStatus(item)
            };

            if (defaultValue && (regex.test(newEntries[sys.id].display) || regex.test(sys.id))) {
              checkedIds.push(sys.id);
            }
          });

          setEntries(newEntries);
          setDefaults(checkedIds);
        } catch (err) {
          console.error(err);
          setError(true);
        }
        setLoading(false);
      });
    } else {
      setError(true);
      setLoading(false);
    }

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    detachExternalChangeHandler = sdk.field.onValueChanged(onExternalChange);

    return () => {
      if (detachExternalChangeHandler) {
        detachExternalChangeHandler();
      }
    };
  }, []);

  const updateFieldValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const reference: Link = {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: e.target.value
        }
      };
      sdk.entry.fields[fieldName].setValue(reference, sdk.field.locale);
    } else {
      sdk.entry.fields[fieldName].removeValue();
    }
  };

  const updateFieldValues = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const reference: Link = {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: e.target.value
        }
      };
      const newValue: Link[] = [];
      const oldValue = (value && [...(value as Link[])]) || [];
      const idx = oldValue.findIndex((ref: Link) => ref.sys.id === e.target.value);
      if (idx !== -1) {
        oldValue.splice(idx, 1);
      } else {
        oldValue.push(reference);
      }

      oldValue.forEach((ref: Link, idx: number) => {
        if (!Object.prototype.hasOwnProperty.call(entries, ref.sys.id)) {
          oldValue.splice(idx, 1);
        }
      });

      newValue.push(...oldValue);

      sdk.entry.fields[fieldName].setValue(newValue, sdk.field.locale);
    } else {
      sdk.entry.fields[fieldName].removeValue();
    }
  };

  const onExternalChange = (value: Link | Link[] | null) => {
    setValue(value);
  };

  return (
    <div className="container">
      {loading ? (
        <HelpText>Loading…</HelpText>
      ) : error ? (
        <ValidationMessage>Invalid field definition</ValidationMessage>
      ) : sdk.field.type === 'Array' ? (
        <Checkboxes
          values={entries}
          selected={value as Link[] | null}
          onChange={updateFieldValues}
          defaultValue={defaults}
        />
      ) : widget === 'radios' ? (
        <Radios
          values={entries}
          selected={value as Link | null}
          onChange={updateFieldValue}
          defaultValue={defaults && defaults[0]}
        />
      ) : (
        <Dropdown
          values={entries}
          selected={value as Link | null}
          onChange={updateFieldValue}
          defaultValue={defaults && defaults[0]}
        />
      )}
    </div>
  );
};

init(sdk => {
  render(<SimpleReference sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});
