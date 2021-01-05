/*
 * my own tokenizer, split every char and index them, so we can find app by 
 * partial letters of the word
 */

/**
 * export the module via AMD, CommonJS or as a browser global
 * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory)
    } else if (typeof exports === 'object') {
        /**
         * Node. Does not work with strict CommonJS, but
         * only CommonJS-like environments that support module.exports,
         * like Node.
         */
        module.exports = factory()
    } else {
        // Browser globals (root is window)
        factory()(root.lunr);
    }
}(this, function () {
    /**
     * Just return a value to define the module export.
     * This example returns an object, but the module
     * can return a function as the exported value.
     */
    return function(lunr) {
        /* throw error if lunr is not yet included */
        if ('undefined' === typeof lunr) {
            throw new Error('Lunr is not present. Please include / require Lunr before this script.');
        }

        /* throw error if lunr stemmer support is not yet included */
        if ('undefined' === typeof lunr.stemmerSupport) {
            throw new Error('Lunr stemmer support is not present. Please include / require Lunr stemmer support before this script.');
        }

        /*
         * Like Japanese, need to set the tokenizer in a special way
         */
        var isLunr2 = lunr.version[0] == "2";

        /* register specific locale function */
        lunr.zh = function () {
            this.pipeline.reset();
            this.pipeline.add(
                lunr.zh.trimmer,
                lunr.zh.stopWordFilter,
                lunr.zh.stemmer
            );

          if(isLunr2){
            this.tokenizer = lunr.zh.tokenizer;
          }else{
            if (lunr.tokenizer) { // for lunr version 0.6.0
              lunr.tokenizer = lunr.zh.tokenizer;
            }
            if (this.tokenizerFn) { // for lunr version 0.7.0 -> 1.0.0
              this.tokenizerFn = lunr.zh.tokenizer;
            }
          }

//            // for lunr version 2
//            // this is necessary so that every searched word is also stemmed before
//            // in lunr <= 1 this is not needed, as it is done using the normal pipeline
//            if (this.searchPipeline) {
//                this.searchPipeline.reset();
//                this.searchPipeline.add(lunr.zh.stemmer)
//            }
        };

        lunr.zh.tokenizer = function(obj){
          //const pattern = new RegExp(/([A-zÀ-ÿ-]+|[0-9._]+|.|!|\?|'|"|:|;|,|-)/i);
          //this tokenizer split every char, for english search which can match any letter user input
          const pattern = '';
          const results = obj.split(pattern).filter(e => e !== '' && e !== ' ');
            return results;
        };

        /* lunr trimmer function */
//        lunr.zh.wordCharacters = "{{wordCharacters}}";
//        lunr.zh.trimmer = lunr.trimmerSupport.generateTrimmer(lunr.zh.wordCharacters);
//
//        lunr.Pipeline.registerFunction(lunr.zh.trimmer, 'trimmer-zh');
//        lunr.zh.trimmer = (function() {
//          /* TODO stemmer  */
//          return function(word) {
//            return word;
//          }
//        })();

        /* lunr trimmer function */
        lunr.zh.trimmer = (function() {
          /* TODO stemmer  */
          return function(word) {
            return word.toLowerCase();
          }
        })();

        /* lunr stemmer function */
//        lunr.zh.stemmer = (function() {
//          /* TODO stemmer  */
//          return function(word) {
//            return word;
//          }
//        })();
        lunr.zh.stemmer = lunr.stemmer;

        lunr.Pipeline.registerFunction(lunr.zh.stemmer, 'stemmer-zh');

        lunr.zh.stopWordFilter = lunr.generateStopWordFilter('的'.split(' '));

        lunr.Pipeline.registerFunction(lunr.zh.stopWordFilter, 'stopWordFilter-zh');
    };
}))
