# Introduction

This is the Dealer Tool for OTOZ from which our dealer's able to login and manage their Inventory/Vehicle's

# OTOZ – Dealer tool frontend

Stack:
- ▲ [Next.js](https://nextjs.org)
- 〰️ [SWR](https://swr.vercel.app)
- 👓 [SCSS](https://sass-lang.com)

and TypeScript, ESlint, Stylelint, Prettier

### Before you start

# OTOZ

- Read our [**Style Guide**](/dealer-tool/dev/Javascript-style-guide.md)

## Prerequisites
-------------
- [**Visual Studio Code **](https://code.visualstudio.com/)
- We use [**NPM**](https://docs.npmjs.com/getting-started)
- **Node.js v8.+ LTS** recommend using [**NVM**](https://github.com/creationix/nvm#installation-and-update) | direct [download](https://nodejs.org/dist/v16.9.0/)

## Getting started

> ⚠️ Use this folder (`dev`) as project root in your IDE!
It's easier and less error-prone than using repository root (`../`).
# Add Local ENV 
`Add File` with name `.env.local`
Please find required key and values from `env-example`.

To init the project, run the following commands:

```bash

`git clone Netsoltech@vs-ssh.visualstudio.com:v3/Netsoltech/OTOZ/dealer-tool`

#Move to the directory contain Package.json
`cd dealer-tool/dev`

#Copy Settings
`cp ./.vscode/settings.recommended.json ./.vscode/settings.json`

#Open in VSCode
code .

# install dependencies
`npm install` or `npm i`

# Build FairMINI
`npm run build:fair`

# Build Motorad
`npm run build:motorrad`

# Run in dev
`npm run dev`

# Run TEST for our code
`npm run test`


### ⌨️ Development

Once all dependencies have been installed you can start development.
To start a development server on [http://localhost:3000](http://localhost:3000) run:

```sh
$ npm run dev
```

If you are using VSCode, consider copying `./.vscode/settings.recommended.json` to `./.vscode/settings.json`

### 🧐 Linters

The boilerplate provides a couple of linters to help you keep an eye on code consistency and type safety.

```sh
npm run lint
# or
npm run lint:scss
npm run lint:ts
npm run lint:types
```

**TIP:** To get the most out of your linters install the corresponding (Stylelint, TSLint) plugins for your editor or IDE.
See `./.vscode/extensions.json`.<br/>

**Prettier**

Prettier helps you to enforce consistent (opinionated) code style. If possible, you can tell your editor to format you code when you save a file. If you are not able to do this, you can run prettier manually using:

```sh
$ npm run prettier
```

### Project structure
App follows [Next.js convention](https://nextjs.org/docs/advanced-features/src-directory). In addition, TypeScript and Babel are pre-configured with custom module resolvers.
This means you can use absolute imports with custom namespaces by default for the following modules:

```js
/* import common library */
import lib from '@common/<folder>/<lib>'
/* import component */
import Counter from '@components/counter/Counter'
/* import container */
import HomepageCounter from '@containers/counter/HomepageCounter'
```

### SCSS
Bootstrap and PrimeReact where used to speed up development and deliver on tight deadline. Only parts in use should be imported – see files `global.scss` and `primereact.scss`.

CSS modules allow you to import other parts in specific components, for example `@import "~bootstrap/scss/utilities/spacing";` but this should be avoided, because it can create many duplicated styles in output.

By default the path `./src/common/css` is configured as an included path for our scss loader.
This means you can import any of this folder's files directly without the relative or absolute path:

```css
@import "variables";
@import "colors";
```

## ⚙️ Components generator
You can create scaffolding for a new component with
```
npm run hygen --name YourComponentName
```

## 🎯 Backend TS types
API specs are hosted on [fair-dev.otoz.biz/fair-api-docs/docs](https://fair-dev.otoz.biz/fair-api-docs/docs).
You can update schema with:
``` sh
npm run gen:openapi
```

## 🔌 Changing API environment
You can override `.env.development` by creating `.env.local`. For example, if you need to work with QA deployment:
``` .env.local
ADMIN_API_GATEWAY_URL=https://fair-qa-admin.otoz.biz/api
```

## ⬆️ Dependencies and updating
As of now, latest versions can be used, except for:
  - **webpack**, use `4.44.2`
  - **webpack-bundle-analyzer**, use `3.6.1`

# Project Structure
The top level directory structure will be as follows:

assets - global static assets such as images, svgs, company logo, etc.
components - global shared/reusable components, such as layout (wrappers, navigation), form components, buttons
services - JavaScript modules
store - Global Redux store
utils - Utilities, helpers, constants, and the like
views - Can also be called "pages", the majority of the app would be contained here

|-- OTOZ
    └── /src
        ├── /assets
        ├── /components
        ├── /services
        ├── /store
        ├── /utils
        ├── /views
        ├── index.js
        └── App.js
        /components
        ├── /forms
        │   ├── /TextField
        │   │   ├── TextField.js
        │   │   ├── TextField.styles.js
        │   │   ├── TextField.test.js
        │   │   └── TextField.stories.js
        │   ├── /Select
        │   │   ├── Select.js
        │   │   ├── Select.styles.js
        │   │   ├── Select.test.js
        │   │   └── Select.stories.js
        │   └── index.js
        ├── /routing
        │   └── /PrivateRoute
        │       ├── /PrivateRoute.js
        │       └── /PrivateRoute.test.js
        └── /layout
            └── /navigation
                └── /NavBar
                    ├── NavBar.js
                    ├── NavBar.styles.js
                    ├── NavBar.test.js
                    └── NavBar.stories.js
                    /services
                    ├── /LocalStorage
                    │   ├── LocalStorage.service.js
                    │   └── LocalStorage.test.js
                    └── index.js
        └── /utils
        ├── /constants
        │   └── countries.constants.js
        └── /helpers
            ├── validation.helpers.js
            ├── currency.helpers.js
            └── array.helpers.js
        /pages
        ├── /Authors
        │   ├── /AuthorsPage
        │   │   ├── AuthorsPage.js
        │   │   └── AuthorsPage.test.js
        │   └── /AuthorBlurb
        │       ├── /AuthorBlurb.js
        │       └── /AuthorBlurb.test.js
        ├── /Books
        │   ├── /BooksPage
        │   │   ├── BooksPage.js
        │   │   └── BooksPage.test.js
        │   └── /BookForm
        │       ├── /BookForm.js
        │       └── /BookForm.test.js
        └── /Login
            ├── LoginPage
            │   ├── LoginPage.styles.js
            │   ├── LoginPage.js
            │   └── LoginPage.test.js
            └── LoginForm
                ├── LoginForm.js
                └── LoginForm.test.js    
            
