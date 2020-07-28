/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { Spinner, ValidationMessage } from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
//
import './index.css';
import { Dropdown, Radios } from './widgets';

interface SimpleReferenceProps {
  sdk: FieldExtensionSDK;
}

type LinkValueType = {
  id: string;
  type: string;
  linkType: string;
};

type LinkType = {
  sys: LinkValueType;
};

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
  const { display, limit, widget } = instance;

  const [value, setValue] = React.useState({} as LinkType);
  const [entries, setEntries] = React.useState({} as Record<string, EntryType>);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    sdk.window.startAutoResizer();

    const validations: any = sdk.field.validations[0];
    const contentType = validations.linkContentType[0];

    const query = {
      content_type: contentType,
      limit: limit && limit < 20 ? limit : 20
    };

    sdk.space.getEntries(query).then((result: any) => {
      const newEntries: Record<string, EntryType> = {};
      const locale = sdk.field.locale;
      const defaultLocale = sdk.locales.default;
      result.items.forEach((item: any) => {
        const { sys, fields } = item;
        newEntries[sys.id] = {
          display: fields[display][locale] || fields[display][defaultLocale] || 'N/A',
          status: getStatus(item)
        };
      });

      setEntries(newEntries);
      setLoading(false);
    });

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
      const value: LinkType = {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: e.target.value
        }
      };
      setValue(value);
      sdk.entry.fields[fieldName].setValue(value, sdk.field.locale);
    } else {
      setValue({} as LinkType);
      sdk.entry.fields[fieldName].removeValue();
    }
  };

  const onExternalChange = (value: LinkType) => {
    setValue(value);
  };

  const active = (value && value.sys && value.sys.id) || '';

  return (
    <div className="container">
      {loading ? (
        <div>
          Loading <Spinner size="default" />
        </div>
      ) : (
        <>
          {widget === 'dropdown' && (
            <Dropdown values={entries} selected={active} onChange={updateFieldValue} />
          )}
          {widget === 'radios' && (
            <Radios values={entries} selected={active} onChange={updateFieldValue} />
          )}
          {active && !entries[active] && (
            <div>
              <ValidationMessage>ENTRY IS MISSING OR INACCESSIBLE</ValidationMessage>
            </div>
          )}
        </>
      )}
    </div>
  );
};

init(sdk => {
  render(<SimpleReference sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});
