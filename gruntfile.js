/**
 * Created by artem on 5/28/15.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        distDir: "dist/",
        concat: {
            logicifyGmap: {
                files: {
                    '<%= distDir%>/logicify-gmap.js': [
                        'src/index.js',
                        'src/**/*.js'
                    ]
                }
            }
        },
        uglify: {
            all: {
                src: ['dist/**.js'],
                dest: 'dist/angular-gmap.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['concat:logicifyGmap'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('build', 'with params', function (params) {
        grunt.task.run(['concat:logicifyGmap']);
        grunt.task.run(['uglify:all']);
    });
    grunt.registerTask('logicifyGmap', 'with params', function (params) {
        grunt.task.run([
            'concat:logicifyGmap',
            'watch'
        ])
    });
};