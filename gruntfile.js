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
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'work/js',
                    generateSourceMaps: true,
                    logLevel: 4,
                    preserveLicenseComments: false,
                    optimize: "uglify2",
                    //                    mainConfigFile: "require.config.js",
                    //                name: "path/to/almond",
                    /* assumes a production build using almond, if you don't use almond, you
                                                    need to set the "includes" or "modules" option instead of name */
                    include: ['main'],
                    paths: {
                        main: 'app/main',
                        domReady: 'lib/domReady.min',
                        promise: 'lib/es6-promise.min'
                    },
                    out: "build/js/app/main.min.js"
                }
            }
        },
        uglify: {
            appjs: {
                options: {
                    // mangle: false,
                    preserveComments: false
                        //banner: '/*! main <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    'build/js/app.min.js': ['work/js/app.js']
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
                dest: 'build/js/app/<%= pkg.name %>.js'
            }
        },
        sass: {
            dist: {
                options: {
                    sourcemap: 'none',
                    style: 'nested' //Output style. Can be nested, compact, compressed, expanded
                },
                files: {
                    'build/css/layout.css': 'work/sass/layout.scss'
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
                        browsers: ['last 2 versions', '> 3% in NL']
                    }), // add vendor prefixes 
                    require('cssnano')() // minify the result 
                ]
            },
            dist: {
                src: 'build/css/layout.css',
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
            css: ['build/css/', 'work/css/app/', 'www/css/*'],
            appjs: ['build/js/app/', 'www/js/app/', 'www/js/app.js']
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
                cwd: 'build/js', // set working folder / root to copy
                src: '**/*', // copy only root files
                dest: 'www/js', // destination folder
                expand: true // required when using cwd
            },
            requirejs: {
                cwd: 'work/js', // set working folder / root to copy
                src: 'require.js', // copy only root files
                dest: 'www/js', // destination folder
                expand: true // required when using cwd
            },
            data: {
                cwd: 'work/data', // set working folder / root to copy
                src: '**.min.*', // copy only root files
                dest: 'www/js/data', // destination folder
                expand: true // required when using cwd
            }
        }
    });


    // Load the plugin that provides the "uglify" task.

    // npm install grunt-postcss pixrem autoprefixer cssnano --save-dev

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-postcss');

    // Default task(s).
    grunt.registerTask('code', ['jshint', 'clean:appjs', 'requirejs', 'uglify', 'copy:appjs', 'copy:requirejs', 'copy:data']);
    grunt.registerTask('css', ['clean:css', 'sass', 'postcss', 'copy:css']);
    grunt.registerTask('default', ['code', 'css']);

};
