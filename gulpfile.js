'use strict';
// package vars
const pkg = require("./package.json");

const gulp = require('gulp');

// load all plugins in "devDependencies" into the variable $
const $ = require("gulp-load-plugins")({
    pattern: ["*"],
    scope: ["devDependencies"]
});

const browserSync = require('browser-sync').create();

const onError = (err) => {
    console.log(err);
};


gulp.task('Default', ['sass']);

// Watch task
gulp.task('Watch', function() {
   browserSync.init({
     // For more options
     // @link http://www.browsersync.io/docs/options/
	 ghostMode: { scroll: false },
	 notify: false,

	 // Project URL.
	 open: "external",
	 host: pkg.host,
     proxy: pkg.host,
	 port: pkg.port,

   });

   gulp.watch( pkg.paths.scss + '**/*.scss', ['sass-watch']);
   gulp.watch( pkg.paths.tpl + '**/*.tpl', ['reload']);
   //gulp.watch( pkg.paths.js + '**/*.js', ['reload']);
});


gulp.task('reload', function() {
	browserSync.reload();
	browserSync.reload();
});

gulp.task('sass-watch', ['sass'], function(done) {
    browserSync.reload();
    browserSync.reload();
    done();
});

//Compile sass task - Compile sass into CSS into the public css folder, and writing out a sourcemap
gulp.task('sass', function() {
  gulp.src( pkg.paths.scss +'style.scss')
  	.pipe($.plumber({errorHandler: onError}))
	.pipe($.sourcemaps.init())
	.pipe($.sassVars(pkg.breakpoints, { verbose: true }))
    .pipe($.sass().on('error', $.sass.logError))
	.pipe($.sourcemaps.write('../'))
    .pipe(gulp.dest( pkg.paths.css ));
});

// css task - minimize CSS in the public css folder
gulp.task('postCSS', function() {
    var plugins = [
        $.pixrem(),
        $.autoprefixer({browsers: ['last 2 version']}),
        $.cssnano()
    ];

    return gulp.src( pkg.paths.css + '*.css')
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.sourcemaps.init())
        .pipe($.postcss(plugins))
		.pipe($.sourcemaps.write('../'))
        .pipe(gulp.dest( pkg.paths.css ));

});

// Compile js task - transpile our Javascript into the build directory
gulp.task('Compile', () =>
    gulp.src(pkg.paths.js + '*.js')
        .pipe($.plumber({errorHandler: onError}))
		.pipe($.babel())
        .pipe(gulp.dest(pkg.paths.jsminified))
);

//compress all images -  optimize filesize all images
gulp.task('imagemin', function() {
    return gulp.src([ pkg.paths.img +'*.{png,jpg,jpeg,gif,svg}'])
        .pipe($.imagemin([
            //png
            $.imageminPngquant({
                speed: 1,
                quality: 98 //lossy settings
            }),
            $.imageminZopfli({
                more: true
            }),

            //gif very light lossy, use only one of gifsicle or Giflossy
            $.imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, //keep-empty: Preserve empty transparent frames
                lossy: 2
            }),
            //svg
            $.imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            //jpg lossless
            $.imagemin.jpegtran({
                progressive: true
            }),
            //jpg very light lossy, use vs jpegtran
            $.imageminMozjpeg({
                quality: 90
            })
        ]
		,{
			verbose: true
		}))
        .pipe(gulp.dest(pkg.paths.img));
});

// Production build
gulp.task('PrepareForLive',['sass', 'postCSS', 'Compile', 'imagemin'] );
