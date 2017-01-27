module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      fleximeta: {
        src: [
          'public/js/src/HEADER.js',
          'public/js/src/prettify.js',
          'public/js/src/serializer.js',
          'public/js/src/views/jsonExporter.js',
          'public/js/src/views/xmlExporter.js',
          'public/js/src/views/chart.js',
          'public/js/src/views/modelExplorer.js',
          'public/js/src/views/validation.js',
          'public/js/src/model/collection.js',
          'public/js/src/model/base.js',
          'public/js/src/editor/object.js',
          'public/js/src/editor/grid.js',
          'public/js/src/editor/canvas.js',
          'public/js/src/editor/individual.js',
          'public/js/src/editor/relation.js',
          'public/js/src/Narrator.js',
          'public/js/src/demo.js',
          'public/js/src/ui.js'
        ],
        dest: 'public/js/uncompressed/<%= pkg.name %>-<%= pkg.version %>.js'
      },
    },
    'min': {
      fleximeta: {
        'src': ['public/js/uncompressed/<%= pkg.name %>-<%= pkg.version %>.js'],
        'dest': 'public/js/dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      },
      consolidation: {
        'src': ['scripts/consolidation/script.js'],
        'dest': 'scripts/consolidation/script.min.js'
      },
      finalization: {
        'src': ['scripts/finalization/script.js'],
        'dest': 'scripts/finalization/script.min.js'
      },
    },
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "yui-compressor" task.
  grunt.loadNpmTasks('grunt-yui-compressor');
  // Default task(s).
  grunt.registerTask('default', ['concat', 'min']);
};
