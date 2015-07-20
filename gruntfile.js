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
    grunt.registerTask('build', 'with params', function (params) {
        grunt.tasks.run(['concat:logicifyGmap']);
    });
    grunt.registerTask('logicifyGmap', 'with params', function (params) {
        grunt.task.run([
            'concat:logicifyGmap',
            'watch'
        ])
    });
};