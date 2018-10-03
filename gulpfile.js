const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require("gulp-rename");
const beautify = require('gulp-beautify');
const size = require('gulp-size');
const terser = require('gulp-terser');

const SOURCE_FILE = 'static.js';
const OUTPUT_DIRECTORY = 'dist';
const BABEL_CONFIG = {
  presets: [],
  comments: false,
};
const BEAUTIFY_CONFIG = {
  indent_size: 2,
};

gulp.task('default', function() {
  return gulp
    .src(SOURCE_FILE)
    .pipe(babel(BABEL_CONFIG))
    .pipe(terser({
      ecma: 5,
      compress: {
        drop_console: true,
        drop_debugger: true,
        inline: 1, // inline function body.
        passes: 3, // number of times to re-compress.
        unsafe: true,
      },
    }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(size({showFiles: true}))
    .pipe(size({showFiles: true, gzip: true}))
    .pipe(gulp.dest(OUTPUT_DIRECTORY))
    .pipe(beautify(BEAUTIFY_CONFIG))
    .pipe(rename({ prefix: "pretty." }))
    .pipe(gulp.dest(OUTPUT_DIRECTORY));
});