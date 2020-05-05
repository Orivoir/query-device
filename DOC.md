# Welcome at [query-device as CDN](https://orivoir.github.io/query-device/dist/query-device.js)

- [installation](#installation)

- [usage](#usage)
    - [easy query device](#easy-query-device)
    - [devices list](#devices-list)
    - [device object as query device](#device-object-as-query-device)
    - [remove a query device](#remove-a-query-device)
- [details of query device](#details-of-query-device)
    - [global event](#global-event)
    - [callback-query-devices](#callback-query-devices)

# installation

```html
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>My app</title>
    </head>

    <body>

        <script src="https://orivoir.github.io/query-device/dist/query-device.js"></script>
    </body>
</html>
```

The **query-device** have add a *method* inside **window object** after we load.

you can create a new instance of `QueryDevice` with

```html
<script>

    const queryDevice = window.queryDevice();
</script>
```

## usage

You can add *viewport listeners* with multiple choices

```html
<script>

    const queryDevice = window.queryDevice();

    queryDevice.add( "min-width: 416px", function( isMatches ) {

        // the viewport have change

        if( isMatches ) {

            console.log('viewport have not little width size');

        } else {

            console.log('viewport have little width size');

        }

    } );

</script>
```

### easy query device

you can simply your **query devices** with this below notation

```html
<script>

    const queryDevice = window.queryDevice();

    queryDevice.add( "416x640", function( isMatches ) {

        // the viewport have change

        if( isMatches ) {

            console.log('view port left mobile size');

        } else {

            console.log('view port enter mobile size');
        }

    } );

</script>
```

this is equal to previous **query device**, and you can access to a list *devices*, with dimension already save, and give a *device object* as **argument** to your **query devices**.

### devices list

You can access to devices list with attribute: `deviceList`

```javascript

console.log( window.queryDevice.deviceList );
```

the output should be:

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

you can *target* a device with the *device name* with the method: `findDeviceByName`

`?object window.queryDevice.findDeviceByName( string deviceName )`

```html
<script>

    const queryDevice = window.queryDevice();

    const iPhoneXrDevice = window.queryDevice.findDeviceByName("iPhone XR");

    queryDevice.add( iPhoneXrDevice, function( isMatches ) {

        // the viewport have change

        if( isMatches ) {

            console.log('viewport have not iPhone XR size');

        } else {

            console.log('viewport have not iPhone XR size');
        }

    } );

</script>
```

### remove a query device

If during the *lifecycle of your app* you have need *detach* a **query device** you can use the **third argument** of: `add` *method* who is **identifiant** of **query device** as `string`

```html
<script>

    const queryDevice = window.queryDevice();

    const idQueryDevice = "mobile-device";

    queryDevice.add( "416x640", function( isMatches ) {

        // the viewport have change

        if( isMatches ) {

            console.log('view port left mobile size');

        } else {

            console.log('view port enter mobile size');
        }

    }, idQueryDevice );

</script>
```

Then you can any time use **remove** method for *detach* the **query device**.

```javascript
queryDevice.remove( idQueryDevice );
```

And now you **query device** for `"mobile-device"` is *detach* with success **👍**.

## details of query device

### global event

The `QueryDevice` attach only **one listener** of *window resize* for all **query devices**, your **query device** is add to a **array** `mediaEvents` and the *global listener* execute all **query devices** inside this **array**, during *remove* of one **query device** the **array** `mediaEvents` *remove* your **query device** and during *next event* your query is not execute. This behavior is favorite for **events optimzation** reason if you have *detach* all **query devices** the *global event* is *detached* and if you re *attach* any **query devices** this is re *attached*.

### callback query devices

The **callback** for your **query device** is execute only if **viewport** change with your constraints.

*E.g:* in assumed you *attach* this bellow **query device**

```js
queryDevice.add( "416x640", function( isMatches ) {

    // the viewport have change

    if( isMatches ) {

        console.log('view port left mobile size');

    } else {

        console.log('view port enter mobile size');
    }

}, idQueryDevice );
```

If the **viewport** switch from: `1200x960` to: `580x700` your **callback** is not execute because you *ask* a **query device** for: `416x640` this equal to:
`min-width: 416px AND min-height: 640px`

But if **viewport** switch from: `580x700` to: `380x580` you callback is execute because new **viewport** have *not respect* you constraint **query device** and the **argument** `isMatches` is **false**
