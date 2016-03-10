module.exports = function( grunt ) {
  "use strict";

  var pkg = require("./package.json");

  grunt.initConfig({
    uglify: {
      options: {
        mangle: false,
        beautify: true,
        wrap: true,
        banner: "/*Reach Client v"+pkg.version+"*/\n"
      },
      reach: {
        files: {
          'dist/reach.js': ['./lib/request.js', 'index.js']
        }
      },
      reachmin: {
        options: {
          mangle: true,
          beautify: false,
          wrap: true
        },
        files: {
          'dist/reach.min.js': ['./lib/request.js', 'index.js']
        }
      }
    },
    jshint: {
      all: {
        src: [
          "index.js", "lib/**/*.js"
        ],
        options: {
          jshintrc: true
        }
      }
    },
    watch: {
      files: [ "<%= jshint.all.src %>" ],
      tasks: [ "jshint:all", "uglify:reach" ]
    }
  });

  // Load grunt tasks from NPM packages
  require( "load-grunt-tasks" )( grunt );

  grunt.registerTask( "build", [ "jshint:all", "uglify" ] );

  grunt.registerTask( "lint", [ "jshint:all" ] );

  grunt.registerTask( "default", [ "build" ] );

};