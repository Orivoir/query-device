class QueryDevice {

    static get SECURITY_LOOP_PARSE_MEDIA() {

        return 48;
    }
    static get deviceList() {

        return require('./../stockage/device-list.json') ;
    }
    static get separators() {
        return ["||","&&","AND","OR"];
    }
    static get IS_OR() {

        return true;
    }
    static get IS_AND(){

        return false;
    }
    static parseMediaMatchBrut( mediaMatchBrut ) {

        const mediasList = [];

        let parsed = null;

        // for not crash browser if infinity loop as: "never found last constraints media device"
        let securityLoop = 0;

        do {

            parsed = QueryDevice.parseOneMedia( mediaMatchBrut ) ;

            mediasList.push( parsed );

            mediaMatchBrut = mediaMatchBrut.replace( parsed.matchMedia, "" );
            mediaMatchBrut = mediaMatchBrut.replace( parsed.realLogicOperator, "" );
            mediaMatchBrut = mediaMatchBrut.trim();

            if( ++securityLoop >= QueryDevice.SECURITY_LOOP_PARSE_MEDIA ) {
                parsed = null;
                throw "QueryDevice Loop parse media have fail as `never found last constraints media device`";
            }

        } while( !parsed.isLast );

        return mediasList;

    }
    static parseOneMedia( mediaBrut ) {

        if( !mediaBrut.length ) return false;

        let close = null;
        let logicOperator = null;
        let realLogicOperator = null;

        QueryDevice.separators.forEach( sep => {

            const indexFind = mediaBrut.indexOf( sep )

            if( indexFind !== -1 ) {

                if( close === null || indexFind < close ) {

                    close = indexFind;
                    realLogicOperator = sep;
                    logicOperator = sep === "AND" ? "&&": sep === "OR" ? "||": sep;

                }
            }

        } );

        if( close === null ) {

            return {
                matchMedia: mediaBrut.trim(),
                isLast: true,
            } ;
        }

        return {
            matchMedia: mediaBrut.substring( open, close ).trim(),
            logicOperator: logicOperator,
            realLogicOperator: realLogicOperator,
            isLast: false,
        } ;

    }
    static device2mediaBrut( device ) {

        const [w,h] = device.size.split('x').map( side => parseInt( side ) );

        return `min-width: ${w}px && min-height: ${h}px`;
    }

    static findDeviceByName( deviceName ) {

        deviceName = deviceName.toLocaleLowerCase();

        return QueryDevice.deviceList.find( d => (
            d.name.toLocaleLowerCase() === deviceName
        ) ) ;
    }

    constructor() {

        this.mediaEvents = [];

        if( !( window.matchMedia instanceof Function ) ) {

            throw "Browser do not support API window.matchMedia";
        }

        this.onResizeWindow = this.onResizeWindow.bind( this );
    }

    poolEvent() {

        window[ (this.mediaEvents.length > 0 ? "add": "remove") + "EventListener"]('resize', this.onResizeWindow );
    }

    onResizeWindow() {

        this.mediaEvents.forEach( me => {

            const isMatch = eval( me.eval );

            if( isMatch !== me.isLastMatch ) {

                me.isLastMatch = isMatch;
                me.callback( isMatch ) ;
            }

        } ) ;
    }

    addDevice( deviceName, callback, idQueryDevice = null ) {

        const device = QueryDevice.findDeviceByName( deviceName ) ;

        if( device ) {

            idQueryDevice = typeof idQueryDevice === "string" ? idQueryDevice: deviceName;

            this.add( QueryDevice.device2mediaBrut( device ), callback, idQueryDevice );

            return  device.size;
        }

        return false;
    }

    add( mediaMatchBrut, callback, idQueryDevice = null ) {

        if( !(callback instanceof Function) ) {
            throw "arg2:callback should be a function";
        }

        const isStringMediaMatch = typeof mediaMatchBrut === "string";

        if( isStringMediaMatch ) {

            mediaMatchBrut = mediaMatchBrut.trim();
        }

        // if give a format: "aaaxbbb" eg: "414x640"
        if(
            isStringMediaMatch &&
            /^[\d]{3,4}\x[\d]{3,4}$/.test( mediaMatchBrut )

        ) {
            mediaMatchBrut = QueryDevice.device2mediaBrut( { size: mediaMatchBrut } );
        }

        // if have give a device object as media to matches
        if( typeof mediaMatchBrut === "object" && typeof mediaMatchBrut.name === "string" ) {

            mediaMatchBrut = mediaMatchBrut.name;
        }

        const device = QueryDevice.findDeviceByName( mediaMatchBrut );

        if( device ) {
            return this.addDevice( device.name, callback, idQueryDevice );
        }

        this.mediaParsed = QueryDevice.parseMediaMatchBrut( mediaMatchBrut );

        this.mediaEval =  this.mediaParsed.map( mediaParsedItem => (
            `window.matchMedia("(${mediaParsedItem.matchMedia})").matches ${mediaParsedItem.logicOperator || ""}`
        ) ).join(" ").trim();

        this.mediaEvents.push( {
            eval: this.mediaEval,
            callback: callback,
            id: typeof idQueryDevice === "string" ? idQueryDevice: null
        } );

        delete this.mediaParsed;
        delete this.mediaEval;

        this.poolEvent();
    }


    remove( idQueryDevice ) {

        const sizeBefore = this.mediaEvents.length;

        this.mediaEvents = this.mediaEvents.filter( me => (
            me.id !== idQueryDevice
        ) ) ;

        this.poolEvent();

        return sizeBefore - this.mediaEvents.length;
    }

    set mediaMatchBrut( mediaMatchBrut ) {

        this._mediaMatchBrut = ( typeof mediaMatchBrut === "string" ) ? mediaMatchBrut.trim(): null;

        if( !this._mediaMatchBrut ) {

            throw new SyntaxError("mediaMatch invalid format");
        }
    }
    get mediaMatchBrut() {

        return this._mediaMatchBrut;
    }

} ;

window.queryDevice = function() {

    return new QueryDevice;
} ;


// public scope static elements

window.queryDevice.deviceList = QueryDevice.deviceList;
window.queryDevice.findDeviceByName = QueryDevice.findDeviceByName;
