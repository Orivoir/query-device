const
    {execSync} = require('child_process'),
    pathResolver = require('path'),

    config = require('./__pkg')( "__file" )
;

let output = null;

output = execSync( "npm run build-polyfill", {
    cwd: pathResolver.join( __dirname, "./../" ),
    encoding: "utf-8"
} );

console.log( output );

output = execSync( `browserify ${config.__polyfill} > ${config.__dist}`, {
    cwd: pathResolver.join( __dirname, "./../" ),
    encoding: "utf-8"
} );

console.log( output );
