const gulp = require('gulp');
const cp = require('child_process');
const del = require('del');
const sass = require('gulp-sass');
// const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;

const styleSrc = './src/sass/**/*.scss';
const jsSrc = './src/js/**/*.js';

const devStyleDest = './_site/assets/css/';
const devJsDest = './_site/assets/js/';

const styleDest = './assets/css/';
const jsDest = './assets/js/';

const sassOptions = {
  outputStyle: 'compressed'
};

function browserSyncInit(done) {
  browserSync.init({ server: './_site' });
  done();
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function clean() {
  return del(['./_site/assets/']);
}

function style() {
  return gulp
    .src(styleSrc)
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest(devStyleDest))
    .pipe(gulp.dest(styleDest))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src(jsSrc)
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(devJsDest))
    .pipe(uglify())
    .pipe(gulp.dest(devJsDest))
    .pipe(gulp.dest(jsDest))
    .pipe(browserSync.stream());
}

function jekyll() {
  return cp.spawn('bundle', ['exec', 'jekyll', 'build'], { stdio: 'inherit' });
}

function watchFiles() {
  gulp.watch(styleSrc, style);
  gulp.watch(jsSrc, scripts);
  gulp.watch(
    [
      './_includes/**/*',
      './_layouts/**/*',
      './_pages/**/*',
      './_posts/**/*',
      './blog/**/*',
      './*.html'
    ],
    gulp.series(jekyll, browserSyncReload)
  );
}

const build = gulp.series(clean, gulp.parallel(style, scripts, jekyll));
const watch = gulp.parallel(watchFiles, browserSyncInit);

exports.style = style;
exports.scripts = scripts;
exports.jekyll = jekyll;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
