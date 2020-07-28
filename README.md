# Contentful Simple Reference Field

Contentful provides a powerful mechanism to link to other entries, accessible on the UI trough the Reference field widget.
Such field works perfectly for most of the cases, however, there are a few situations we may prefer a more minimalist widget, like when referencing to a less dynamic and populated content model. Let's imagine that we have a content model `Channel` that is used to identify contents that are used in a `website`, `mobile application`, etc..
So, instead of using the `Reference` field and having to click and select from the modal the desired channel we can have instead a simple dropdown (select) or radio buttons, but maintaining the same `reference` data.

## Overview

The extension has the following features:

- Change the display widget of a "Single Reference" field to be a Dropdown or Radio buttons
- Supports localization

## Requirements

- Contentful CMS account with permissions to manage extensions

## Installation (UI - using this repo)

The UI Extension can be installed manually from the Contentful UI following the below steps:

1. Navigate to Settings > Extensions
2. Click on "Add extension > Install from Github"
3. Use `https://raw.githubusercontent.com/pauloamgomes/contentful-simple-reference-field/master/extension.json` in the URL
4. On the extension settings screen change Hosting to Self-hosted using the URL `https://pauloamgomes.github.io/contentful-simple-reference-field/`

## Usage

1. Add a new `Reference` (One Reference) field to your content model, it can be localized.
2. On validations ensure that `Accept only specified entry type` is selected and only one content type is selected.
3. On the Appearance tab ensure that `Simple Reference` is selected, and on display option, we define the field we want to show in the dropdown/radios.

![Appearance](https://monosnap.com/image/OZhKG0zmHb3ClMsd2yTbThb5yy3EPk)

When creating/editing an entry where the field is defined it will display the references:

![Dropdown Options](https://monosnap.com/image/8KeDTCRKAtPzYqywEQdISgZY4BHAOx)

![Dropdown Selected](https://monosnap.com/image/R5wMQE4fljpRCQdXa53ZsVtHygGkea)

If instead of Dropdown we select Radios it will display as:

![Radio Buttons](https://monosnap.com/image/I6qxSxUTiO4cD5TBtd6PHIVRNQrA6T)

The field saved data is the same as the default `Reference` widget, e.g.:

```json
{
  "fields": {
    "title": {
      "en-US": "Test Page"
    },
    "slug": {
      "en-US": "test-page"
    },
    "channel": {
      "en-US": {
        "sys": {
          "type": "Link",
          "linkType": "Entry",
          "id": "fs0arvLf9GqSIOJklSwnF"
        }
      }
    }
  }
}
```

## Optional Usage for Development

After cloning, install the dependencies

```bash
yarn install
```

To bundle the extension

```bash
yarn build
```

To host the extension for development on `http://localhost:1234`

```bash
yarn start
```

To install the extension:

```bash
contentful extension update --force
```

## Limitations

Not completely a limitation, as the purpose is to use the widget when referencing a content model that has only a few entries.

## Copyright and license

Copyright 2020 pauloamgomes under the MIT license.
