# [query-device]( https://npmjs.com/package/query-device )

![Node.js CI](https://github.com/Orivoir/query-device/workflows/Node.js%20CI/badge.svg?branch=master)

> You have need dynamic responsive for your app, css cant full coverage, now you can use a handler of viewport device, easy usage.

## CDN usage

### [Learn more with CDN usage](https://github.com/Orivoir/query-device/blob/gh-pages/DOC.md)

### Script tag

```html
<script src="https://orivoir.github.io/query-device/dist/query-device.js"></script>
```

- [installation](#installation)

- [import](#import)

- [usage](#usage)
    - [easy query device](#easy-query-device)
    - [devices list](#devices-list)
    - [device object as query device](#device-object-as-query-device)
    - [remove a query device](#remove-a-query-device)
    - [details of query device](#details-of-query-device)

## installation

you should **local install** with your handler *dependencies fovorite*

### install with npm

```bash
$ npm install query-device --save
```

### install with yarn

```bash
$ yarn add query-device
```

## import


### Babel

**Babel** is a next generation *JavaScript compiler*. One of the features is the ability to use **ES6/ES2015 modules** now, even though browsers do not yet support this feature natively.

```javascript
import QueryDevice from 'query-device';

const queryDevice = new QueryDevice();

```

### Browserify/Webpack

There are several ways to use Browserify and Webpack. For more information on using these tools, please refer to the corresponding project's **documentation**.

```javascript
const QueryDevice = require('query-device');

const queryDevice = new QueryDevice();
```

## usage

You can add **viewport listeners** with multiple choices

```javascript

queryDevice.add( "min-width: 416px AND min-height: 640px", function( isMatches ) {

    // the viewport have change

    if( isMatches ) {

        console.log('viewport have not little width size');

    } else {

        console.log('viewport have little width size');

    }

} );
```

### easy query device

you can simply your **query devices** with this below notation

```javascript

queryDevice.add( "416x640", function( isMatches ) {

    // the viewport have change

    if( isMatches ) {

        console.log('view port left mobile size');

    } else {

        console.log('view port enter mobile size');
    }

} );
```

this is equal to previous **query device**,
and you can access to a **list devices**, with dimension *already save*,
and give a **device object** as *argument* to your **query devices**.


### devices list

You can access to **devices list** with **static attribute**: `deviceList`

```javascript
console.log( QueryDevice.deviceList );
```

should be output:

```js
[
    {
        "name": "iPhone XR", "size": "414x896"
    },
    {
        "name": "iPhone XS", "size":"375x812"
    },
    {
        "name": "iPhone XS Max", "size":"414x896"
    },
    {
        "name": "iPhone X", "size":"375x812"
    },
    {
        "name": "iPhone 8 Plus", "size":"414x736"
    },
    {
        "name":"iPhone 8", "size":"375x667"
    },
    // ...
]
```

### device object as query device

you can *target* a device with the **device name** with the **static method**: `findDeviceByName`

`?object QueryDevice.findDeviceByName( string deviceName )`

```javascript
import QueryDevice from 'query-device';

const iPhoneXrDevice = QueryDevice.findDeviceByName("iPhone XR");

const queryDevice = new QueryDevice();

queryDevice.add( iPhoneXrDevice, function( isMatches ) {

    // the viewport have change

    if( isMatches ) {

        console.log('viewport have not iPhone XR size');

    } else {

        console.log('viewport have iPhone XR size');
    }

} );
```

### remove a query device

If during the *lifecycle of your app* you have need *detach* a **query device** you can
use the **third argument** of `add` method who is **identifiant** of **query device** as `string`

```javascript

const idQueryDevice = "mobile-device";

queryDevice.add( "416x640", function( isMatches ) {

    // the viewport have change

    if( isMatches ) {

        console.log('view port left mobile size');

    } else {

        console.log('view port enter mobile size');
    }

}, idQueryDevice );
```

Then you can any time use `remove` method for *detach* the **query device**.

```javascript

queryDevice.remove( idQueryDevice );
```

And now you **query device** for `"mobile-device"` is *detach* with success 👍.

## details of query device

### global event

The `QueryDevice` *attach* only **one listener** of *window resize* for all **query devices**, your query device is add to a **array** `mediaEvents` and
the **global listener** execute all **query devices** inside this **array**,
during **remove** of one **query device** the **array** `mediaEvents` **remove** your **query device** and during *next event resize* your query is not execute. This behavior is favorite for **events optimzation** reason if you have *detach* all **query devices** the **global event** is *detached* and if you re *attach* any **query devices** this is re *attached*.

### callback query devices

The **callback** for your **query device** is execute only if **viewport** change with your *constraints*.

*E.g:* in assumed you *attach* this bellow **query device**

```javascript

queryDevice.add( "416x640", function( isMatches ) {

    // the viewport have change

    if( isMatches ) {

        console.log('view port left mobile size');

    } else {

        console.log('view port enter mobile size');
    }

}, idQueryDevice );
```

If the **viewport** switch from: `1200x960` to: `580x700` your **callback** is not execute
because you *ask* a **query device** for: `416x640` this equal to:
`min-width: 416px AND min-height: 640px`

But if **viewport** switch from: `580x700` to: `380x580` you **callback** is execute because new **viewport** have not respect you constraint **query device** and the **argument** `isMatches` is **false**
