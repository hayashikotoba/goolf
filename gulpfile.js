const gulp = require('gulp');
const babel = require('gulp-babel');
const beautify = require('gulp-beautify');
const eslint = require('gulp-eslint');
const jest = require('gulp-jest').default;
const rename = require('gulp-rename');
const size = require('gulp-size');
const replace = require('gulp-string-replace');
const terser = require('gulp-terser');

const SOURCE_FILE = 'src/goolf.js';
const OUTPUT_DIRECTORY = 'dist';
const BABEL_CONFIG = {
  presets: [],
  comments: false,
};
const BEAUTIFY_CONFIG = {
  indent_size: 2,
};

const configurations = {
  'full': {
    global_defs: {
      _ATTR: true,
      _ARRAY: true,
      _VOID_ELEMENTS: ['br','col','hr','img','input','link','meta'],
      _VOID: true,
      _WHITESPACE: true,
      _DELIMITER: 'Þ',
      _COMPONENTS: true,
    }
  },
  'basic': {
    replace_const: true,
    global_defs: {
      _ARRAY: false,
      _ATTR: false,
      _VOID: false,
      _WHITESPACE: false,
      _DELIMITER: 'Þ',
      _COMPONENTS: false,
    }
  }
};

const buildTaskName = config => `build-${config}`

Object.keys(configurations).forEach(key  => {
  const {global_defs, replace_const} = configurations[key];
  gulp.task( buildTaskName(key) , () => {
    let pipe = gulp
      .src(SOURCE_FILE);
    if(replace_const) {
      pipe = pipe.pipe(replace(/const /g, 'let ', {logs: false}));
    }
    return pipe
      .pipe(babel(BABEL_CONFIG))
      .pipe(terser({
        ecma: 5,
        compress: {
          drop_console: true,
          drop_debugger: true,
          inline: 1, // inline function body.
          passes: 4, // number of times to re-compress.
          unsafe: true,
          global_defs,
        },
        mangle: {
          properties: {
            regex: /^(_terser_)/
          }
        },
      }))
      .pipe(rename({ suffix: `.${key}.min` }))
      .pipe(size({showFiles: true}))
      .pipe(size({showFiles: true, gzip: true}))
      .pipe(gulp.dest(OUTPUT_DIRECTORY))
      .pipe(beautify(BEAUTIFY_CONFIG))
      .pipe(rename({ prefix: "pretty." }))
      .pipe(gulp.dest(OUTPUT_DIRECTORY));
  });
});
gulp.task('builds', gulp.parallel(Object.keys(configurations).map(buildTaskName)));

gulp.task('lint', () => {
  return gulp.src([SOURCE_FILE])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', function () {
  return gulp.src('./test/').pipe(jest());
});

gulp.task('default',  gulp.series('lint', 'builds', 'test'));