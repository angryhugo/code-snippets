/*global module:false*/
'use strict';
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // '<json:package.json>',
        copy: {
            codesnippet: {
                files: [{
                    expand: true,
                    cwd: 'app/',
                    src: ['**'],
                    dest: 'dist/app/'
                }, {
                    expand: true,
                    cwd: 'static/images/',
                    src: ['**'],
                    dest: 'dist/images/static/'
                }, {
                    expand: true,
                    cwd: 'test/',
                    src: ['**'],
                    dest: 'dist/test/'
                }, {
                    expand: true,
                    cwd: 'data/',
                    src: ['**'],
                    dest: 'dist/data/'
                }, {
                    expand: true,
                    cwd: 'assets/vendor/font-awesome/fonts/',
                    src: ['**'],
                    dest: 'dist/static/fonts/'
                }, {
                    expand: true,
                    src: ['config.json', 'package.json', 'run.sh', 'startCheck.sh'],
                    dest: 'dist/'
                }]
            }
        },
        concat: {
            layoutcss: {
                src: [
                    'assets/vendor/bootstrap/css/bootstrap.css',
                    'assets/vendor/font-awesome/css/font-awesome.min.css',
                    'assets/vendor/highlight/css/tomorrow.css',
                    'static/css/layout.css'
                ],
                dest: 'dist/static/css/layout.min.css'
            },
            layoutjs: {
                src: [
                    'assets/vendor/jquery/jquery-1.9.1.js',
                    'assets/vendor/jquery/jquery.cookie.js',
                    'assets/vendor/jquery/jquery.validate.js',
                    'assets/vendor/bootstrap/js/bootstrap.js',
                    'assets/vendor/bootstrap/js/respond.min.js',
                    'assets/vendor/bootbox/bootbox.js',
                    'assets/vendor/highlight/js/highlight.pack.js',
                    'assets/js/layout.js'
                ],
                dest: 'dist/static/js/layout.min.js'
            },
            adminaccountadministratorscss: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.css',
                    'static/css/admin.css'
                ],
                dest: 'dist/static/css/admin-account-administrators.min.css'
            },
            adminaccountadministratorsjs: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.js',
                    'assets/js/admin-account-administrators.js',
                ],
                dest: 'dist/static/js/admin-account-administrators.min.js'
            },
            adminaccountusersjs: {
                src: [
                    'assets/vendor/chart/Chart.js',
                    'assets/js/admin-account-users.js',
                ],
                dest: 'dist/static/js/admin-account-users.min.js'
            },
            newsnippetcss: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.css',
                    'assets/vendor/codemirror/css/codemirror.css',
                    'assets/vendor/codemirror/css/base16-light.css',
                    'assets/vendor/codemirror/addon/display/fullscreen.css'
                ],
                dest: 'dist/static/css/new-snippet.min.css'
            },
            newsnippetjs: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.js',
                    'assets/vendor/codemirror/js/codemirror.js',
                    'assets/vendor/codemirror/js/clike.js',
                    'assets/vendor/codemirror/js/javascript.js',
                    'assets/vendor/codemirror/addon/display/fullscreen.js',
                    'assets/js/new-snippet.js'
                ],
                dest: 'dist/static/js/new-snippet.min.js'
            },
            profilejs: {
                src: [
                    'assets/vendor/chart/Chart.js',
                    'assets/js/profile.js'
                ],
                dest: 'dist/static/js/profile.min.js'
            },
            searchsnippetcss: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.css',
                    'static/css/search-snippet.css'
                ],
                dest: 'dist/static/css/search-snippet.min.css'
            },
            searchsnippetjs: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.js',
                    'assets/js/search-snippet.js'
                ],
                dest: 'dist/static/js/search-snippet.min.js'
            },
            viewsnippetcss: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.css',
                    'assets/vendor/codemirror/css/codemirror.css',
                    'assets/vendor/codemirror/css/base16-light.css',
                    'assets/vendor/codemirror/addon/display/fullscreen.css',
                    'static/css/view-snippet.css',
                ],
                dest: 'dist/static/css/view-snippet.min.css'
            },
            viewsnippetjs: {
                src: [
                    'assets/vendor/bootstrap-select/bootstrap-select.js',
                    'assets/vendor/codemirror/js/codemirror.js',
                    'assets/vendor/codemirror/js/clike.js',
                    'assets/vendor/codemirror/js/javascript.js',
                    'assets/vendor/codemirror/addon/display/fullscreen.js',
                    'assets/js/view-snippet.js',
                    'assets/js/baidu-share.js',
                ],
                dest: 'dist/static/js/view-snippet.min.js'
            }
        },

        //mincss: min concated css   
        cssmin: {
            codesnippet: {
                files: [{
                    'dist/static/css/layout.min.css': ['<%= concat.layoutcss.dest %>']
                }, {
                    'dist/static/css/admin-account-administrators.min.css': ['<%= concat.adminaccountadministratorscss.dest %>']
                }, {
                    'dist/static/css/new-snippet.min.css': ['<%= concat.newsnippetcss.dest %>']
                }, {
                    'dist/static/css/search-snippet.min.css': ['<%= concat.searchsnippetcss.dest %>']
                }, {
                    'dist/static/css/view-snippet.min.css': ['<%= concat.viewsnippetcss.dest %>']
                }, {
                    'dist/static/css/admin.min.css': ['static/css/admin.css']
                }, {
                    'dist/static/css/index.min.css': ['static/css/index.css']
                }, {
                    'dist/static/css/error.min.css': ['static/css/error.css']
                }, {
                    'dist/static/css/profile.min.css': ['static/css/profile.css']
                }]
            }
        },
        watch: {
            files: '<%=lint.files>',
            tasks: 'lint test'
        },
        // lint: {
        //     files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
        // },
        jshint: {
            options: {
                forin: true,
                noarg: true,
                noempty: true,
                eqeqeq: true,
                bitwise: true,
                strict: true,
                undef: true,
                unused: true,
                curly: true,
                browser: true,
                devel: true,
                eqnull: true,
                immed: true,
                // latedef: true,
                newcap: true,
                sub: true,
                boss: true,
                scripturl: true,
                predef: ['jQuery', '$', 'describe', 'it', 'exports', 'window', 'document', 'require']
            },
            globals: {
                jQuery: true,
                node: true,
                devel: true
            },
            files: ['assets/js/*.js']
        },
        uglify: {
            options: {
                compress: true
            },
            codesnippet: {
                files: [{
                    'dist/static/js/layout.min.js': ['<%= concat.layoutjs.dest %>']
                }, {
                    'dist/static/js/admin-account-administrators.min.js': ['<%= concat.adminaccountadministratorsjs.dest %>']
                }, {
                    'dist/static/js/admin-account-users.min.js': ['<%= concat.adminaccountusersjs.dest %>']
                }, {
                    'dist/static/js/new-snippet.min.js': ['<%= concat.newsnippetjs.dest %>']
                }, {
                    'dist/static/js/profile.min.js': ['<%= concat.profilejs.dest %>']
                }, {
                    'dist/static/js/search-snippet.min.js': ['<%= concat.searchsnippetjs.dest %>']
                }, {
                    'dist/static/js/view-snippet.min.js': ['<%= concat.viewsnippetjs.dest %>']
                }, {
                    'dist/static/js/admin-module.min.js': ['assets/js/admin-module.js']
                }, {
                    'dist/static/js/index.min.js': ['assets/js/index.js']
                }, {
                    'dist/static/js/unauthorized.min.js': ['assets/js/unauthorized.js']
                }, {
                    'dist/static/js/password.min.js': ['assets/js/password.js']
                }, {
                    'dist/static/js/constants_cn.min.js': ['assets/js/constants_cn.js']
                }, {
                    'dist/static/js/constants_en.min.js': ['assets/js/constants_en.js']
                }]
            }
        },
        clean: {
            all: {
                src: ['dist']
            }
        },
        //less: build less to css
        less: {
            codesnippet: {
                files: [{
                    'static/css/admin.css': 'app/less/admin.less'
                }, {
                    'static/css/error.css': 'app/less/error.less'
                }, {
                    'static/css/function.css': 'app/less/function.less'
                }, {
                    'static/css/index.css': 'app/less/index.less'
                }, {
                    'static/css/layout.css': 'app/less/layout.less'
                }, {
                    'static/css/profile.css': 'app/less/profile.less'
                }, {
                    'static/css/search-snippet.css': 'app/less/search-snippet.less'
                }, {
                    'static/css/view-snippet.css': 'app/less/view-snippet.less'
                }]
            }
        }
    });

    // grunt.loadNpmTasks('grunt-replace');
    // grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['clean:all', 'less', 'copy', 'concat', 'cssmin', 'uglify']);
    grunt.registerTask('testjs', ['jshint']);
};