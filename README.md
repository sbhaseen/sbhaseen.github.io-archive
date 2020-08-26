# sbhaseen.github.io

This is the archive of the Jekyll based static blog site.
My portfolio website, hosted by GitHub Pages.

## Getting Started

_Development:_

Source files, located in the folder `src` are comprised of SASS (`scss` folder) and ES6 JavaScript (`scripts` folder).

Gulp is used for the following:

- Spawn a child process that automates the Jekyll build process to run only for specifc change events.
- Compile SASS (`gulp-sass`) with auto-prefixing (`gulp-autoprefixer`) and then compressed to minified CSS
- JS files are first concanated into a single file then minified with `gulp-ugilfy-es`.

The module `browser-sync` was used for live reloading during development.

### Prerequisites

_Development:_

- A Node.js installation with `npm` capable of running Gulp.
- A Ruby installation capable of running Jekyll.

### Installing

For more information about installing Jekyll and a Ruby development environment see Jekyll's documentation [here](https://jekyllrb.com/docs/installation/).

To install Jekyll initially (assuming Ruby is already present), run:

```
gem install jekyll bundler
```

Install the Gulp requirements locally with `npm`:

```
npm install
```

For development use these scripts:

```
gulp style
gulp scripts
gulp jekyll
gulp clean
gulp build
gulp watch
```

`watch` is the default process, hence just entering `gulp` will run the `watch` script.

`style` will complie the SASS to minifed CSS in the destination folder.

`scripts` will combine and minify the JavaScript scripts and send them to the destination folder

`jekyll` will run a child process that runs the ruby command `bundle exec jekyll build`

`clean` will delete all contents in the destination folder.

`build` will run `clean` first then complie all styles and scripts while sending the data to the destination folder.

`watch` will run a development server, watch the `src` folder and `index.html` for changes, then compile SASS and JavaScript as needed, based on the changes.

## Deployment

If a production build is required, use:

```
gulp build
```

Then copy the `_site` folder to the desired destination.

## Built With

- [Jekyll](https://jekyllrb.com/) - A static site generator.
- [Gulp.js](https://gulpjs.com/) - A toolkit for automating painful or time-consuming tasks in your development workflow.
- [Node-SASS](https://github.com/sass/node-sass) - Node-SASS is a library that provides binding for Node.js to LibSass, the C version of the popular stylesheet preprocessor, Sass.
