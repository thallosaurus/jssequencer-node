## jssequencer-node

## Install Dependencies
Before cloning, install these dependencies because without them, node-midi won't work. Original Instructions can be found here: <https://github.com/justinlatimer/node-midi>



* OSX
  
  * Some version of Xcode (or Command Line Tools)
  * Python (for node-gyp)

* Windows
  * Microsoft Visual C++ (the Express edition works fine)
  * Python (for node-gyp)

* Linux
  * A C++ compiler
  * You must have installed and configured ALSA. Without it node-midi will NOT build.
  * Install the libasound2-dev package.
  * Python (for node-gyp)

## How to start:
Now, clone this repo and run:

  ``npm install``  
  ``tsc build tsconfig.json``  
  ``npm start``

The Application should now start. go to <http://localhost:10000/index2.html> and you see the main UI.

## What can I do with this?
coming soon
