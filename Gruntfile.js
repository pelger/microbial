/*jshint globalstrict: true, white: false */
/*global module */
'use strict';

module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'test/{,*/}*.js',
        'lib/{,*/}*.js'
      ]
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*Test.js']
      }
    },
    mochacov: {
      options: {
        reporter: 'html-cov'
      },
      all: ['test/**/*.js']
    }
  });

  grunt.registerTask('setBusPostal', function(){
    process.env.TEST_BUS = 'postal';
  });

  grunt.registerTask('setBusAxon', function(){
    process.env.TEST_BUS = 'axon';
  });

  grunt.registerTask('coverage', [
    'mochacov'
  ]);

  grunt.registerTask('test', [
    'setBusPostal',
    'mochaTest',
  ]);

  grunt.registerTask('build', [
    'jshint',
    'test',
    'coverage'
  ]);

  grunt.registerTask('travis', [
    'test'
  ]);
};

