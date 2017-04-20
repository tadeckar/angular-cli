import * as fs from 'fs';
import * as path from 'path';
import * as ncp from 'ncp';
import * as child_process from 'child_process';

const files = [
          {
              src: path.resolve('node_modules','Atlantic-UI', 'build', 'docs', 'assets', 'fonts', 'icon-font.svg'),
              dest: path.resolve('node_modules','Atlantic-UI','src', 'fonts', 'icon-font.svg')
          },
          {
              src: path.resolve('node_modules','Atlantic-UI', 'build', 'docs', 'assets', 'fonts', 'icon-font.eot'),
              dest: path.resolve('node_modules','Atlantic-UI','src', 'fonts', 'icon-font.eot')
          },
          {
              src: path.resolve('node_modules','Atlantic-UI', 'build', 'docs', 'assets', 'fonts', 'icon-font.ttf'),
              dest: path.resolve('node_modules','Atlantic-UI','src', 'fonts', 'icon-font.ttf')
          },
          {
              src: path.resolve('node_modules','Atlantic-UI', 'build', 'docs', 'assets', 'fonts', 'icon-font.woff'),
              dest: path.resolve('node_modules','Atlantic-UI','src', 'fonts', 'icon-font.woff')
          }
      ],
      srcFolder = {
          src: path.resolve('node_modules','Atlantic-UI', 'src'),
          dest: path.resolve('src', 'styles', 'Atlantic-UI')
      }, 
      spawn = child_process.spawn;

export class AtlanticUIWebpackPlugin () { 
    apply(compiler: any): void {
        compiler.plugin("watch-run", function(compilation, callback) {
            this.buildAtlanticUI( callback );
        });
        compiler.plugin("run", function(compilation, callback) {
            this.buildAtlanticUI( callback );
        });
    };
    buildAtlanticUI(callback: Function) {
        // if Atlantic-UI font files aren't in the right place, build with gulp
        let command = !fs.existsSync(path.resolve(srcFolder.dest, 'scss', 'aui-standard.scss')) ? spawn('gulp', [ 'iconfont' ], { cwd: path.resolve('.', 'node_modules', 'Atlantic-UI') }) : null;

        // if the Atlantic-UI build is needed, do build 
        if (command) {
            command.stdout.on('data', data => console.log(data.toString()));
            command.on('close', code => {
                // move font files so that webpack can build from src
                files.forEach(file => { 
                    if (!fs.existsSync(file.dest)) {
                        fs.renameSync(file.src, file.dest) 
                    }
                });
                // move src directory to client/styles/Atlantic-UI
                ncp(srcFolder.src, srcFolder.dest, function (err) {
                    if (err) {
                        console.error(err); 
                    } else {
                        callback();
                    }
                });
            });
        } else {
            callback();
        }
    }

}
