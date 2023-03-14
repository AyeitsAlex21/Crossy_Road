WEBSITE:
https://ayeitsalex21.github.io/Crossy_Road/

This is a first person crossy road I made in threejs. Everything is made locally in threejs,
built ins I used would be the camera controls, everything else including collision,
shapes, animation, lighting, etc. I made myself without the help of a library on threejs. Note: shading is
easy on threejs in comparison to OpenGL. Threejs is really a nice tool, it makes things easier but does not
do everything for you.

The four main files I made index.js, objects.js, index.html, and style.css.
objects.js holds all the geometry and the on the roads and are roads, index.js is 
the main driver of the project.

Credits for a guide on how to make car model: https://www.freecodecamp.org/news/three-js-tutorial/ 
------------------------------
Notes for me

For local development
1. npm run dev

For gh pages
make sure you do the gh-pages

1. npm run build
2. npm install gh-pages
3. npm run deploy

combined update website command:
npm run build; npm install gh-pages; git add .; git commit -am "pushing to git"; git push; npm run deploy