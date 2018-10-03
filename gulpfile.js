const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require("gulp-rename");
const beautify = require('gulp-beautify');
const size = require('gulp-size');

const SOURCE_FILE = 'static.js';
const OUTPUT_DIRECTORY = 'dist';
const BABEL_CONFIG = {
  presets: ['babel-preset-minify']
};
const BEAUTIFY_CONFIG = {
  indent_size: 2
};

gulp.task('default', function() {
  return gulp
    .src(SOURCE_FILE)
    .pipe(babel(BABEL_CONFIG))
    .pipe(rename({ suffix: ".min" }))
    .pipe(size({showFiles: true}))
    .pipe(size({showFiles: true, gzip: true}))
    .pipe(gulp.dest(OUTPUT_DIRECTORY))
    .pipe(beautify(BEAUTIFY_CONFIG))
    .pipe(rename({ prefix: "pretty." }))
    .pipe(gulp.dest(OUTPUT_DIRECTORY));
});

