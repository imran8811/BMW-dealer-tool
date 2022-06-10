# JavaScript Style Guide

The purpose of this document is writing an efficient software code requires a thorough knowledge of programming. This knowledge can be implemented by the following coding style which comprises several guidelines that help in writing the software code efficiently and with minimum errors. These guidelines, known as coding guidelines, are used to implement individual programming language constructs, comments, formatting, and so on. These guidelines, if followed, help in preventing errors, controlling the complexity of the program, and increasing the readability and understandability of the program.

A set of comprehensive coding guidelines encompasses all aspects of code development. To ensure that all developers work in a harmonized manner (the source code should reflect a harmonized style as a single developer had written the entire code in one session), the developers should be aware of the coding guidelines before starting a software project. Moreover, coding guidelines should state how to deal with the existing code when the software incorporates it or when maintenance is performed.

## Table of Contents
  1. [Filename & Folder](#filename--folder)
  1. [Modules](#modules)
  1. [export](#export)
  1. [import](#import)
  1. [CONSTANT](#constant)
  1. [Credits](#credits)

## Filename & Folder
> Only **`PascalCase`** | **`hyphen-case`** | **`UPPER_CASE`** , **do not** use camelCase

**A base (class / singleton / function library / constant) filename should exactly match the name of its `default export`.**
>* Button.js<br/>
>* CheckBox.js<br/>
>* Button/index.js<br/>
>* CheckBox/index.js<br/>
>* I_LOVE_YOU.js<br/>

**A base function filename should match the name(camelCase) of its default export with converted to **`hyphen-case`**** 
>* function.js<br/>
>* function-name.js<br/>
>* function/index.js<br/>
>* function-name/index.js<br/>

**Basic rules for `__tests__` files:**
>CoffeeMachine/<br/>
>CoffeeMachine/index.js<br/>
>...<br/>
>CoffeeMachine/`__tests__`/<br/>
>CoffeeMachine/`__tests__`/CoffeeMachine.test.js<br/>
>CoffeeMachine/`__tests__`/Heater.test.js<br/>
>CoffeeMachine/`__tests__`/Pump.test.js<br/>

**Basic rules for `images` files:**
>CoffeeMachine/<br/>
>CoffeeMachine/index.js<br/>
>...<br/>
>CoffeeMachine/`images`/<br/>
>CoffeeMachine/`images`/logo.png<br/>
>CoffeeMachine/`images`/brand.png<br/>
>CoffeeMachine/`images`/cover.png<br/>
>CoffeeMachine/`images`/thumbnail.png<br/>
>CoffeeMachine/`images`/person-placeholder.png<br/>
>CoffeeMachine/`images`/super-super-long-name.png<br/>
>CoffeeMachine/`images`/icon-back.png<br/>
>CoffeeMachine/`images`/icon-close.png<br/>
>CoffeeMachine/`images`/icon-super-long-name.png<br/>


## Modules

> **Single file**
#### DO
```
CoffeeMachine.js
```
#### :x: ~~DO~~ NOT assume future, because it might not change for the rest of it life
```
CoffeeMachine/
CoffeeMachine/index.js
```

> **Module with TWO and more files, must refactor like below:**
```
CoffeeMachine/
CoffeeMachine/index.js
CoffeeMachine/Heater.js
CoffeeMachine/Pump.js
CoffeeMachine/images/brand.png
CoffeeMachine/__tests__/CoffeeMachine.test.js
CoffeeMachine/__tests__/Heater.test.js
CoffeeMachine/__tests__/Pump.test.js
```
**[⬆ back to top](#table-of-contents)**

## export
> * class / singleton / function library = **`PascalCase`**
> * function = **`camelCase`**
> * Must have a **`name`**
> * Prefer **`default`** export
#### DO
```javascript
export default class ClassName {}
```
```javascript
export default function functionName() {
  console.log('Hello World');
}
```
```javascript
const functionName = () => {
  console.log('I have a name');
};
export default functionName;
```
```javascript
export const functionName = () => {
  console.log('Hello World');
};
```
```javascript
export function functionName() {
  console.log('Hello World');
}
```
```javascript
export const hi = () => {
  console.log('Hi!');
};
export const sayHello = () => {
  console.log('Hello!');
};
```
```javascript
const hi = () => {
  console.log('Hi!');
};
const sayHello = () => {
  console.log('Hello!');
};
const Library = {
  hi,
  sayHello,
};
export default Library;
```

#### :x: ~~DO~~ NOT
```javascript
export default () => {
  console.log('Who AM I?');
};
```
```javascript
export default class {
  printName = () => {
    console.log('Who AM I?');
  };
}
```
#### :x: ~~DO~~ NOT export directly from an import.
> Why? Although the one-liner is concise, having one clear way to import and one clear way to export makes things consistent.
```javascript
export { Pump as default } from './CoffeeMachine';
```
#### DO
```javascript
import { Pump } from './CoffeeMachine';
export default Pump;
```
**[⬆ back to top](#table-of-contents)**

## import
> Do not use wildcard imports.
>>Why? This makes sure you have a single default export.
#### DO
```javascript
import Button from './Button'
```
```javascript
import sayHello from './say-hello'
```
```javascript
import Library from './Library'
```
```javascript
import {hi, sayHello} from './Library';
```
```javascript
import Library, {hi, sayHello} from './Library';
```
```javascript
import YOUR_ICON from './your-icon.png';
```
#### :x: ~~DO~~ NOT
```javascript
import * as modules from './Library'
```
**[⬆ back to top](#table-of-contents)**

## CONSTANT
> `const NAMES_LIKE_THIS = 'name like this';`
#### **DO**
```javascript
const DEFAULT_VALUE = 'this is on the root of your file';

export default class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValue: DEFAULT_VALUE,
    };
  }
}
```
```javascript
export const API_KEY = 'prefer in most cases';
```
#### :x: ~~DO~~ NOT
```javascript
let REASSIGNABLE_VARIABLE = 'do not use let with uppercase variables';
REASSIGNABLE_VARIABLE = 'assign';
```
```javascript
export let EXPORT_REASSIGNABLE_VARIABLE = 'do not use let with uppercase variables';
```
#### **DO**
```javascript
export const MAPPING = {
  key: 'value',
};
```
#### :x: ~~DO~~ NOT
```javascript
export const MAPPING = {
  KEY: 'value',
};
```
**[⬆ back to top](#table-of-contents)**

-----------
### Credits
* Bilal Sattar
