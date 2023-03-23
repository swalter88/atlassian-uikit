"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const uglify = require("gulp-uglify");

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 3000
    });
    done();
}
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function clean() {
    return del(["./vendor/"]);
}

function modules() {

    // Bootstrap JS
    var fastbootstrapJS = gulp.src('./node_modules/fastbootstrap/dist/js/*')
        .pipe(gulp.dest('./vendor/fastbootstrap/js'));
    // Bootstrap SCSS
    var fastbootstrapSCSS = gulp.src('./node_modules/fastbootstrap/src/scss/**/*')
        .pipe(gulp.dest('./vendor/fastbootstrap/scss'));

    // Bootstrap JS
    var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
        .pipe(gulp.dest('./vendor/bootstrap/js'));
    // Bootstrap SCSS
    var bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*')
        .pipe(gulp.dest('./vendor/bootstrap/scss'));

    // Font Awesome
    var fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
        .pipe(gulp.dest('./vendor'));

    // jQuery
    var jquery = gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./vendor/jquery'));

    return merge(fastbootstrapJS, fastbootstrapSCSS, bootstrapJS, bootstrapSCSS, fontAwesome, jquery);
}


function css() {
    return gulp
        .src("./src/scss/**/*.scss")
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest("./dist/css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browsersync.stream());
}

function js() {
    return gulp
        .src([
            './src/js/*.js',
            '!./src/js/*.min.js',
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browsersync.stream());
}


function watchFiles() {
    gulp.watch("./src/scss/**/*", css);
    gulp.watch(["./src/js/**/*", "!./src/js/**/*.min.js"], js);
    gulp.watch("./**/*.html", browserSyncReload);
}


exports.css = css;
exports.js = js;
exports.clean = clean;

exports.vendor = gulp.series(clean, modules);

exports.build = gulp.series(exports.vendor, gulp.parallel(css, js));

exports.watch = gulp.parallel(watchFiles, browserSync);

exports.default = exports.build;