/**
 * Created by artem on 5/28/15.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        distDir: "dist/",
        umd: {
            all: {
                src: 'dist/logicify-gmap.js',
                dest: 'dist/logicify-gmap.js', // optional, if missing the src will be used
                deps: { // optional, `default` is used as a fallback for rest!
                    default: ['google', 'angular']
                }
            }
        },
        concat: {
            logicifyGmap: {
                files: {
                    '<%= distDir%>/logicify-gmap.js': [
                        'src/index.js',
                        'src/**/*.js'
                    ]
                }
            },
            geoXML3: {
                files: {
                    '<%= distDir%>/geoxml3.js': [
                        'node_modules/geoxml3/ZipFile.complete.js',
                        'node_modules/geoxml3/geoxml3.js',
                        'node_modules/geoxml3/ProjectedOverlay.js'
                    ]
                }
            }
        },
        copy: {
            all: {
                files: [
                    {expand: true, flatten: true, src: 'src/**/*.css', dest: '<%= distDir%>'}
                ]
            }
        },
        uglify: {
            all: {
                src: ['dist/logicify-gmap.js'],
                dest: 'dist/angular-gmap.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.*'],
                tasks: ['concat:logicifyGmap', 'copy:all'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('build', 'with params', function (params) {
        grunt.task.run(['concat:logicifyGmap']);
        grunt.task.run(['concat:geoXML3']);
        grunt.task.run(['copy:all']);
        grunt.task.run(['umd:all']);
        grunt.task.run(['uglify:all']);
    });
    grunt.registerTask('logicifyGmap', 'with params', function (params) {
        grunt.task.run([
            'concat:logicifyGmap',
            'concat:geoXML3',
            'copy:all',
            'umd:all',
            'watch'
        ])
    });
};