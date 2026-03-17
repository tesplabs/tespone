/*global module:false*/
module.exports = function (grunt) {

    // START: Mocking the custom 'grunt-lwaconfig' and 'grunt.LwaConfig' since we don't have the external file.
    // We simulate the behavior described in the user's reference.
    grunt.LwaConfig = function () {
        this.buildname = 'tesp-release';
        this.files = {
            list: function () {
                return [
                    'js/config.js',
                    'js/ui.js',
                    'js/httpservices.js',
                    'js/auth.js',
                    'js/router.js',
                    'js/app.js',
                ];
            }
        };
        this.defines = {
            dictionnary: {
                'DEBUG': false
            }
        };
    };
    // END Mock

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        lwa: {
            buildname: 'tesp-release',
            destdir: 'dist',
            files: [
                'js/config.js',
                'js/ui.js',
                'js/httpservices.js',
                'js/auth.js',
                'js/router.js',
                'js/app.js'
            ]
        },

        clean: {
            dist: ['<%= lwa.destdir %>'],
        },

        uglify: {
            options: {
                compress: {
                    global_defs: {},
                    dead_code: true,
                    drop_console: true
                }
            },
            dist: {
                files: {
                    '<%= lwa.destdir %>/main.js': ['<%= lwa.files %>']
                }
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    '<%= lwa.destdir %>/index.html': 'index.html'
                }
            }
        },

        less: {
            dist: {
                options: {
                    compress: true,
                    ieCompat: true
                },
                files: {
                    "<%= lwa.destdir %>/main.css": "css/main.css"
                }
            }
        },

        copy: {
            dist: {
                files: [
                    {
                        src: ['css/theme.css'],
                        dest: '<%= lwa.destdir %>/theme.css'
                    },
                    {
                        expand: true,
                        cwd: 'assets/',
                        src: ['**'],
                        dest: '<%= lwa.destdir %>/'
                    }
                ]
            }
        },

        compress: {
            dist: {
                options: {
                    mode: 'gzip',
                    level: 9
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= lwa.destdir %>/',
                        src: ['**/*'],
                        dest: '<%= lwa.destdir %>/',
                        rename: function (dest, src) {
                            return dest + src + '.gz';
                        }
                    }
                ]
            }
        },

        jasmine: {
            tesp: {
                options: {
                    template: 'js/tests/jasmine/SpecRunner.html',
                    outfile: 'js/tests/jasmine/_SpecRunner.html'
                }
            }
        }
    });

    grunt.registerTask('process-html', 'Update index.html refs', function () {
        const indexFile = grunt.config.get('lwa.destdir') + '/index.html';
        if (!grunt.file.exists(indexFile)) {
            grunt.log.error('index.html not found at ' + indexFile);
            return false;
        }
        let content = grunt.file.read(indexFile);

        // Update JS Ref
        const scriptPattern = /<script src="js\/config\.js"><\/script>.*?<script src="js\/app\.js"><\/script>/;
        const newScript = '<script src="main.js"></script>';
        if (scriptPattern.test(content)) {
            content = content.replace(scriptPattern, newScript);
        } else {
            grunt.log.warn('Could not replace script tags in index.html');
        }

        // Update CSS Refs
        // css/main.css -> main.css
        // css/theme.css -> theme.css
        content = content.replace('css/main.css', 'main.css');
        content = content.replace('css/theme.css', 'theme.css');

        grunt.file.write(indexFile, content);
        grunt.log.ok('Updated index.html references');
    });

    grunt.registerTask('patch-js-paths', 'Remove assets/ path from main.js', function () {
        const mainJs = grunt.config.get('lwa.destdir') + '/main.js';
        if (grunt.file.exists(mainJs)) {
            let content = grunt.file.read(mainJs);
            // Replace "assets/" with "" globally
            content = content.replace(/assets\//g, '');
            grunt.file.write(mainJs, content);
            grunt.log.ok('Patched main.js paths');
        } else {
            grunt.log.warn('main.js not found for patching');
        }
    });

    grunt.registerTask('cleanup-uncompressed', 'Remove uncompressed files', function () {
        const fs = require('fs');
        const path = require('path');
        const dest = grunt.config.get('lwa.destdir');

        const deleteRecursively = (dir) => {
            if (!fs.existsSync(dir)) return;
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    deleteRecursively(filePath);
                    // Try to remove dir if empty
                    try { fs.rmdirSync(filePath); } catch (e) { }
                } else {
                    if (!file.endsWith('.gz')) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        };

        deleteRecursively(dest);
        grunt.log.ok('Cleaned up uncompressed files.');
    });

    // Custom Config Task
    grunt.registerTask('config', 'Load config', function () {
        var destdir = 'dist';
        var lwaconfig = new grunt.LwaConfig();

        grunt.config.set('lwa.buildname', lwaconfig.buildname);
        grunt.config.set('lwa.files', lwaconfig.files.list());
        grunt.config.set('lwa.destdir', destdir);
        grunt.config.set('uglify.options.compress.global_defs', lwaconfig.defines.dictionnary);
        grunt.log.write("Config configured. Dest: " + destdir + "\n");
    });

    // Default task
    grunt.registerTask('default', ['build']);

    // Build Order:
    // 1. config
    // 2. clean:dist
    // 3. uglify (to root)
    // 4. less (to root)
    // 5. htmlmin (to root)
    // 6. copy (assets flat to root, theme flat to root)
    // 7. process-html (update paths to flat structure)
    // 8. patch-js-paths (update asset refs in js)
    // 9. compress (gzip all)
    // 10. cleanup-uncompressed

    grunt.registerTask('build', ['config', 'clean:dist', 'uglify', 'less', 'htmlmin', 'copy', 'process-html', 'patch-js-paths', 'compress', 'cleanup-uncompressed']);

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
};
