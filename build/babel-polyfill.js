const
    fs = require('fs'),
    pathResolver = require('path')
    babelCore = require('@babel/core') ,

    config = require('./__pkg')( "__file" )
;

const back = babelCore.transformSync(
    fs.readFileSync( pathResolver.join( __dirname, "/./../" , config.__dev ) , "utf-8" ),
    {
        plugins: [
            "@babel/plugin-proposal-class-properties",
            [ "transform-class-properties", { spec: true } ] ,
            "@babel/plugin-transform-classes",
            "@babel/plugin-transform-arrow-functions",
            "@babel/plugin-transform-runtime"
        ],
        sourceType: "script"
    }
) ;

fs.writeFileSync( pathResolver.join( __dirname, "/./../" , config.__polyfill ), back.code ) ;

console.log( `have generate ${back.code.length} chars in: "${config.__polyfill}"` );
