process.env.NODE_ENV = "test";

const
    {assert, expect} = require("chai"),
    QueryDevice = require('./../public/QueryDevice');
;

describe("static method/attributes of `QueryDevice`" , () => {

    describe('`deviceList` should be a array of:', () => {

        const deviceList = QueryDevice.deviceList;

        it( 'should be a `array`', () => {
            assert.isArray( deviceList );
        } );

        deviceList.forEach(device => {

            it('should be a object', () => {
                assert.isObject( device );
            } ) ;

            it("should have `string name` not empty property", () => {
                assert.isString(  device.name );
                expect( device.name.length ).to.be.greaterThan( 0 );
            }  );

            const messageIt = `should have "string size" with specific format property: ${device.size}`;

            it( messageIt , () => {
                assert.isString(  device.size );
                expect( device.size.length ).to.be.greaterThan( 0 );
                assert.isTrue(
                    /^[\d]{3,4}\x[\d]{3,4}$/i.test(device.size)
                );
            } );

        });

    } );

    describe('`?object findDeviceByName( string name )`' , () => {

        const findDeviceByName = QueryDevice.findDeviceByName;

        it('should be a function', () => {

            assert.isFunction( findDeviceByName );

        } );

        [
            {
                name: "iPhone XR",
                isExists: true,
            }, {
                name: "ABC X",
                isExists: false,
            }, {
                name: "iPhone XS Max",
                isExists: true,
            }
        ].forEach( deviceAttempt => {

            const device = findDeviceByName( deviceAttempt.name );

            const messageIt = `should be ${!deviceAttempt.isExists ? "not": ""} found device for: "${deviceAttempt.name}" `;

            it( messageIt, () => {

                if( !deviceAttempt.isExists ) {

                    assert.isNull( device );
                } else {

                    assert.isObject( device );
                }

            } );

        } ) ;

        it('should \\throw RangeError while arg1: `name` is not a `string` value', () => {

            const fxThrow = () => findDeviceByName( ["unicorn <3"] );
            expect( fxThrow ).to.be.throw( RangeError, '`deviceName` should be a `string` value' );
        } );

    } );

    describe('`string device2mediaBrut( object|string size )`' , () => {

        const device2mediaBrut = QueryDevice.device2mediaBrut;

        it('should be a function' , () => {
            assert.isFunction( device2mediaBrut );
        } );

        [
            {
                size: "315x450",
                mediaBrut: "min-width: 315px && min-height: 450px"
            },
            {
                size: "1200x750",
                mediaBrut: "min-width: 1200px && min-height: 750px"
            }
        ].forEach( device => {

            messageIt = `await: "${device.mediaBrut}"`;

            it( messageIt, () => {

                const output = device2mediaBrut( device.size );

                expect( output ).to.be.equal( device.mediaBrut );

            } );

        } ) ;

        it('should \\throw RangeError while arg1: `object|string` is invalid' , () => {

            const fxThrow = () => device2mediaBrut( ["unicorn <3"] );

            expect( fxThrow ).to.be.throw( RangeError, '`device size` should be a `object` or `string` value' );

        } );

    } );

    describe('the constant static element should be:' , () => {

        it('`SECURITY_LOOP_PARSE_MEDIA` should be exactly equal to `48` as integer value', () => {

            assert.isNumber( QueryDevice.SECURITY_LOOP_PARSE_MEDIA );
            expect( QueryDevice.SECURITY_LOOP_PARSE_MEDIA ).to.be.equal( 48 );
        } );

        it( '`IS_OR` should be exactly equal `true` as bool value', () => {

            assert.isBoolean( QueryDevice.IS_OR );
            expect( QueryDevice.IS_OR ).to.be.equal( true );

        } );

        it( '`IS_AND` should be exactly equal `false` as bool value', () => {

            assert.isBoolean( QueryDevice.IS_AND );
            expect( QueryDevice.IS_AND ).to.be.equal( false );

        } );

        describe('`separators` shoul be `string[]` of:', () => {

            it('should be a `array` of size `4`' , () => {

                assert.isArray( QueryDevice.separators );

                expect( QueryDevice.separators ).to.have.lengthOf( 4 );

            } );

            [
                "||","&&","AND","OR"
            ].forEach( (separatorAwait,index) => {

                const separatorReceveid = QueryDevice.separators[index];

                const messageIt = `await: "${separatorAwait}", receveid: "${separatorReceveid}"`;

                it( messageIt, () => {

                    expect( separatorAwait ).to.be.equal( separatorReceveid );

                } );

            } ) ;

        } );

        describe('`array parseMediaBrut( string mediaBrut )`' , () => {

            const parseMediaBrutFactoryData = require('./factory-data/parseMediaBrut.json');

            parseMediaBrutFactoryData.forEach( (attempt,index) => {

                const outoutReceveid = QueryDevice.parseMediaBrut( attempt.input );
                const outputAwait = parseMediaBrutFactoryData[index].output;

                const messageIt = `output should be a array size: ${outputAwait.length} `

                it( messageIt , () => {

                    assert.isArray( outoutReceveid );
                    expect( outoutReceveid ).to.have.lengthOf( outputAwait.length );

                } );

                describe("test exactly output for each:" , () => {

                    outputAwait.forEach( (item,index) => {

                        Object.keys( item ).forEach( itemAttribute => {

                            const messageIt = `await a attribute: "${itemAttribute}" as: "${typeof item[ itemAttribute ]}" with exactly value: ${item[ itemAttribute ]}`

                            it( messageIt , () => {

                                assert.isTrue(
                                    typeof item[ itemAttribute ] === typeof outoutReceveid[ index ][ itemAttribute ]
                                );

                                assert.isTrue( item[ itemAttribute ] === outoutReceveid[ index ][ itemAttribute ] ) ;

                            } );

                        } ) ;

                    } );

                } );


            } );

        } );

    } );

} ) ;
