/*global require: false, module: false */

module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['gruntfile.js', 'work/js/app.js', 'work/js/app/*'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: false,
                    console: true,
                    module: false,
                    document: true
                }
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['work/js/app/widget-*.js'],
                // the location of the resulting JS file
                dest: 'work/build/js/app/<%= pkg.name %>.js'
            }
        },
        sass: {
            dist: {
                options: {
                    sourcemap: 'none',
                    style: 'nested' //Output style. Can be nested, compact, compressed, expanded
                },
                files: {
                    'work/build/css/layout.css': 'work/sass/layout.scss'
                }
            }
        },
        postcss: {
            options: {
                //map: true, // inline sourcemaps 
                // or 
                map: {
                    inline: false, // save all sourcemaps as separate files... 
                    annotation: 'work/css/app/maps/' // ...to the specified directory 
                },

                processors: [
                    require('pixrem')(), // add fallbacks for rem units 
                        require('autoprefixer')({
                        browsers: ['last 2 versions', 'Safari >= 5', '> 3% in NL']
                    }), // add vendor prefixes 
                    require('cssnano')() // minify the result 
                ]
            },
            dist: {
                src: 'work/build/css/layout.css',
                dest: 'work/css/app/layout.min.css'
            }
        },
        clean: {
            //folder: ['path/to/dir/'],
            //folder_v2: ['path/to/dir/**'],
            //contents: ['path/to/dir/*'],
            //subfolders: ['path/to/dir/*/'],
            //css: ['path/to/dir/*.css'],
            //all_css: ['path/to/dir/**/*.css']
            css: ['work/build/css/', 'work/css/app/', 'www/css/*'],
            appjs: ['work/build/js/app/', 'www/js/app/', 'www/js/app.js']
            //all_css: ['path/to/dir/**/*.css']
        },
        copy: {
            css: {
                cwd: 'work/css', // set working folder / root to copy
                src: '**/*', // copy all files and subfolders
                dest: 'www/css', // destination folder
                expand: true // required when using cwd

            },
            appjs: {
                cwd: 'work/build/js', // set working folder / root to copy
                src: '**/*', // copy only root files
                dest: 'www/js', // destination folder
                expand: true // required when using cwd
            }
        }
    });


    // Load the plugin that provides the "uglify" task.

    // npm install grunt-postcss pixrem autoprefixer cssnano --save-dev

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass'); //npm install grunt-contrib-sass --save-dev
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy'); //npm install grunt-contrib-copy --save-dev

    // Default task(s).
    grunt.registerTask('code', ['jshint', 'connect', 'qunit', 'clean:appjs', 'uglify', 'copy:appjs']);
    grunt.registerTask('css', ['clean:css', 'less', 'cssmin', 'sass', 'postcss', 'copy:css']);
    grunt.registerTask('e2e', ['protractor:chrome']);
    grunt.registerTask('default', ['code', 'css']);

};
