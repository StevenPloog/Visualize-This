# Visualize-This
An audio visualizing chrome extension that works with pages using HTML5 Audio.

New visualizers can be added by modeling off those currently in js/visualizers/*.js
There should be one visualizer per file.
'spins.js' has an example of a visualizer with a persistent variable (rotation)
build.sh should be run from the root of the extension after adding a new js/visualizers/*.js to rebuild the full-visualizer.js file. build.sh also rebuilds the html files required for the GPM and YouTube menus to work.

Currently it will run on
-Google Play Musics' listen page via a 'Visualize' button next to settings: https://play.google.com/music/listen
-YouTube videos via a button with three bars next to the settings button: https://www.youtube.com
