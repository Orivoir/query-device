const __pkg = require('./../package.json');

module.exports = function( filter ) {

    return !!__pkg[ filter ] ? __pkg[ filter ]: __pkg;
} ;