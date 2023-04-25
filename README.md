# Explorify - A Better Spotify Experience

Explorify is a web application that allows users to explore new music and manage their Spotify playlists. It leverages the Spotify API to fetch user's recently played tracks, manage playlists, and obtain song recommendations based on a selected seed track. The application provides a user-friendly interface to add, remove, and modify playlists and their content.

## Prerequisites
To run this project, you need to have the following installed:

1. Node.js
2. npm (Node.js package manager)

Additionally, you need to have a Spotify Developer account and create a new Spotify App to obtain the necessary credentials: client_id, client_secret, and redirect_uri.

## Installation

These examples run on Node.js. On its [website](https://nodejs.org/en/download) you can find instructions on how to install it. You can also follow this [gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm.

You need to install Node.js first. Once installed, clone the repository, navigate to the folder `01-fore-explorers/explorify_code` and install its dependencies running:

    $ npm install
    
You might also need to install request and request-promise-native npm packages

    $ npm install request
    $ npm install request-promise-native


### Using your own credentials
You will need to register your app and get your own credentials from the Spotify for Developers Dashboard.

To do so, go to your [Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) and create your application. For the examples, we registered these Redirect URIs:

* http://localhost:8888 (For website)
* http://localhost:8888/callback (For Redirect URIs)

Once you have created your app, click on the app that you just created, then click on setting, replace the `client_id`, `redirect_uri` and `client_secret` in the examples `01-fore-explorers/explorify_code/app.js` with the ones you get from My Applications.

* var client_id = ''; // Your client id
* var client_secret = ''; // Your secret
* var redirect_uri = '`http://localhost:8888/callback`'; 


## Running the examples
In order to run the different examples, open the folder with the name of the flow you want to try out, and run its `app.js` file. For instance, to run the Authorization Code example do:

    $ cd explorify_code
    $ node app.js

Then, open http://localhost:8888 in a browser.

## Usage

1. Open the application in your browser at http://localhost:8888.
2. Log in with your Spotify account.
3. Explorify will display your recently played artists and your current playlists.
4. Use the provided controls to manage your playlists, add or remove songs, and create new playlists.
5. Click on the "Load Suggestions" button to get song recommendations based on a selected track.
6. Add the recommended songs to your existing playlists or create a new playlist for them.

Enjoy exploring new music and managing your Spotify playlists with Explorify!
