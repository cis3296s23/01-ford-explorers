/**
 * @file
 * Main script for the Spotify Recommender web application.
 * This script interacts with the Spotify API to get recommendations for songs
 * based on a selected track and allows the user to add those recommendations
 * to a new or existing playlist on their Spotify account.
 * @summary Main script for the Spotify Recommender web application.
 * @author Shen Liu - Ryan Lind - Carla Jane Delima - Prince Geulter
 * @version 4.0.0
 */

/**
 * Displays a toast message for a specified duration.
 *
 * @param {string} message - The message to display in the toast.
 * @param {number} [duration=3000] - The duration (in milliseconds) to display the toast.
 */
function showToast(message, duration) {
    var toast = $('<div class="toast"></div>').text(message);
    $('body').append(toast);
    setTimeout(function () {
        toast.remove();
    }, duration || 3000);
}

/**
 * Fetches recently played tracks from the Spotify Web API and displays the most recently played artists on a web page.
 * Requires a valid Spotify access token to be defined in the 'access_token' variable.
 *
 * @function fetchRecentlyPlayed
 * @returns {void} This function does not return a value, but displays the most recently played artists on a web page.
 */

function fetchRecentlyPlayed() {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/recently-played",
        headers: {
            "Authorization": "Bearer " + access_token
        },
        success: function (response) {
            console.log("Recently Played Tracks:");

            var artistsList = [];
            response.items.forEach(function (item) {
                var artistName = item.track.artists[0].name;
                if (!artistsList.includes(artistName)) {
                    artistsList.unshift(artistName);
                }
            });
            console.log(artistsList);
            if (localStorage.getItem("recentlyPlayedArtists") == null) {
                localStorage.setItem("recentlyPlayedArtists", JSON.stringify(artistsList));
            }

            var storeArtistList = JSON.parse(localStorage.getItem("recentlyPlayedArtists"));
            var artists = document.getElementById("artists");
            var artistsContent = "<h2>Recently Played Artists:</h2><ul>";
            var firstTenArtists = storeArtistList.slice(0, 5);
            firstTenArtists.forEach(function (artistName) {
                artistsContent += "<li>" + artistName + "</li>";
            });
            artistsContent += "</ul>";
            console.log(artistsContent);
            artists.innerHTML = artistsContent;
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });
    console.log("refreshed");
}
/**
 * Retrieves the list of tracks in a given Spotify playlist.
 *
 * @function getPlaylistSongs
 * @param {string} playlistId - The unique ID of the Spotify playlist to retrieve tracks for.
 * @param {Function} callback - A callback function to be called with the list of tracks when they are retrieved.
 * @returns {void} This function does not return a value directly, but instead calls the specified callback function with the list of tracks as its parameter.
 */

function getPlaylistSongs(playlistId, callback) {
    $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            callback(response.items);
        },
        error: function (error) {
            console.log('Error retrieving songs for playlist:', error);
        }
    });
}

/**
 * Retrieves a list of the current user's Spotify playlists.
 *
 * @function getUserPlaylists
 * @param {Function} callback - A callback function to be called with the list of playlists when they are retrieved.
 * @returns {void} This function does not return a value directly, but instead calls the specified callback function with the list of playlists as its parameter.
 */

function getUserPlaylists(callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            if (callback) {
                callback(response);
            }
        },
        error: function (error) {
            console.log('Error retrieving playlists:', error);
        }
    });
}
/**
 * Displays the user's Spotify playlists in a web page.
 *
 * @function displayUserPlaylists
 * @param {Object} response - The response data containing the list of playlists to display.
 * @param {string} trackId - (Optional) The ID of the track to add to a playlist. If this parameter is present, a clickable list of playlists will be displayed to allow the user to choose which playlist to add the track to.
 * @returns {void} This function does not return a value directly, but displays the user's playlists in a web page and adds event listeners to allow the user to interact with the playlists.
 */

function displayUserPlaylists(response, trackId) {
    var playlists = response.items;
    var playlistContainer = $('#playList');
    var playlistSelector = $('#playlistSelector');
    playlistContainer.empty();
    playlistSelector.empty();

    playlists.forEach(function (playlist) {
        var playlistDropdown = $('<details class="playlist-dropdown"></details>');
        var playlistSummary = $('<summary></summary>').text(playlist.name);


        playlistDropdown.append(playlistSummary);

        getPlaylistSongs(playlist.id, function (songs) {
            var songList = $('<ul class="song-list"></ul>');

            songs.forEach(function (song) {
                var songTitle = song.track.name;
                var artistName = song.track.artists.map(artist => artist.name).join(', ');
                var songSpotifyUrl = song.track.external_urls.spotify;
                var songItem = $('<li></li>').addClass('song-item');;
                var songLink = $('<a></a>').addClass('spotify-song-link').text(`${songTitle} - ${artistName}`).attr('href', songSpotifyUrl).attr('target', '_blank');
                var deleteSongButton = $('<button class="delete-song spotify-button">Delete</button>');
                deleteSongButton.on('click', function (event) {
                    event.preventDefault(); // Prevent the click event from propagating to the parent anchor element
                    deleteSongFromPlaylist(playlist.id, song.track.id);
                });
                songItem.append(songLink);
                songItem.append(deleteSongButton);
                songList.append(songItem);
            });

            playlistDropdown.append(songList);
        });

        playlistContainer.append(playlistDropdown);

        // Display the clickable playlist list for adding the track
        if (trackId) {
            var playlistOption = $('<li></li>').text(playlist.name);
            playlistOption.on('click', function () {
                addTrackToPlaylist(playlist.id, trackId, function () {
                    fetchRecentlyPlayed(); // Add the fetchRecentlyPlayed() call here
                });
                playlistSelector.hide();
                displayPlaylistOptions(trackId)
            });
            playlistSelector.append(playlistOption);
        }
    });
}
/**
 * Deletes a specified track from a specified Spotify playlist.
 *
 * @function deleteSongFromPlaylist
 * @param {string} playlistId - The unique ID of the Spotify playlist to delete the track from.
 * @param {string} trackId - The unique ID of the Spotify track to delete from the playlist.
 * @returns {void} This function does not return a value directly, but deletes the specified track from the specified playlist.
 */


function deleteSongFromPlaylist(playlistId, trackId) {
    $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        type: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            tracks: [{
                uri: `spotify:track:${trackId}`
            }]
        }),
        success: function () {
            // Refresh the playlist display
            getUserPlaylists(displayUserPlaylists);
        },
        error: function (error) {
            console.error("Error deleting song from playlist: ", error);
        }
    });
}

/**
 * Displays a clickable list of the user's Spotify playlists to allow the user to choose which playlist to add a specified track to.
 *
 * @function displayPlaylistOptions
 * @param {string} trackId - The unique ID of the Spotify track to add to a playlist.
 * @returns {void} This function does not return a value directly, but displays a clickable list of the user's playlists to allow the user to choose which playlist to add the specified track to.
 */
function displayPlaylistOptions(trackId) {
    var playlistSelector = document.getElementById('playlistSelector');
    getUserPlaylists(function (response) {
        displayUserPlaylists(response, trackId);
    });
}

/**
 * Creates a new Spotify playlist with the specified name, or updates an existing playlist with the same name.
 *
 * @function createOrUpdatePlaylist
 * @param {string} name - The name of the playlist to create or update.
 * @returns {void} This function does not return a value directly, but creates or updates a Spotify playlist and displays a message to the user indicating whether the operation was successful.
 */


function createOrUpdatePlaylist(name) {
    // Retrieve the user's playlists
    $.ajax({
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            // Check if the specified playlist already exists
            var existingPlaylist = response.items.find(function (playlist) {
                return playlist.name === name;
            });

            // If the playlist exists, show a toast message
            if (existingPlaylist) {
                console.log('Playlist already exists with ID:', existingPlaylist.id);
                showToast('You cannot create a new playlist with the same name.', 3000);
            } else {
                // If the playlist doesn't exist, create a new playlist and add tracks
                $.ajax({
                    method: 'POST',
                    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'name': name,
                        'public': false,
                        'collaborative': false,
                        'description': 'A playlist of my favorite songs'
                    }),
                    success: function (response) {
                        console.log('New playlist created with ID:', response.id);
                        getUserPlaylists(); // Update the playlist in the div
                        showToast("You have successfully created a new playlist " + name, 3000);
                        show();
                    },
                    error: function (error) {
                        console.log('Error creating playlist:', error);
                    }
                });
            }
        },
        error: function (error) {
            console.log('Error retrieving playlists:', error);
        }
    });
}

// Handle the createOrUpdatePlaylist button click
$('#createPlaylist').on('click', function () {
    var playlistName = $('#playlist-name').val();

    if (playlistName) {
        createOrUpdatePlaylist(playlistName);
        resetPlaylistNameInput();
    } else {
        showToast("Please enter a playlist name", 3000);
    }
});

/**
 * Resets the value of the playlist name input field to an empty string.
 *
 * @function resetPlaylistNameInput
 * @returns {void} This function does not return a value directly, but resets the value of the playlist name input field to an empty string.
 */


function resetPlaylistNameInput() {
    const playlistNameInput = document.getElementById('playlist-name');
    playlistNameInput.value = '';
}

/**
 * Parses the hash fragment of the current URL to extract parameters passed to the application.
 *
 * @function getHashParams
 * @returns {Object} An object representing the parameters passed to the application, with keys and values parsed from the hash fragment of the current URL.
 */


function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

/**
 * Adds a specified Spotify track to a specified playlist.
 *
 * @function addTrackToPlaylist
 * @param {string} playlistId - The unique ID of the Spotify playlist to add the track to.
 * @param {string} trackId - The unique ID of the Spotify track to add to the playlist.
 * @param {function} callback - A callback function to execute after the track has been added to the playlist.
 * @returns {void} This function does not return a value directly, but adds the specified track to the specified playlist and executes the specified callback function (if provided) when complete.
 */

function addTrackToPlaylist(playlistId, trackId, callback) {
    $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            uris: [`spotify:track:${trackId}`]
        }),
        success: function (response) {
            showToast("You successfully added the song to playlist", 4000);
            console.log('Track added to playlist.');
            if (callback) {
                callback();
            }
        },
        error: function (error) {
            showToast("Cannot add the song to playlist", 4000);
            console.log('Error adding track to playlist:', error);
        }

    });
    getUserPlaylists();
}

/**
 * Displays a recommendation track in the application, and generates a list of playlists for the user to add the track to.
 *
 * @function show
 * @param {string} trackID - The unique ID of the Spotify track to display a recommendation for.
 * @returns {void} This function does not return a value directly, but displays a recommendation track in the application and generates a list of playlists for the user to add the track to.
 */


function show(trackID) {
    // Check if the tracklist is not already fetched
    if (!tracklist || currentIndex >= tracklist.tracks.length) {
        getRecommendations(trackID, function (recommendations) {
            tracklist = recommendations;
            currentIndex = 0;
            displayTrack(trackID);
            displayPlaylistOptions(trackID);
        });
    } else {
        displayTrack(trackID);
        displayPlaylistOptions(trackID);
    }
}
/**
 * Retrieves a list of track recommendations based on a specified Spotify track ID.
 *
 * @function getRecommendations
 * @param {string} trackID - The unique ID of the Spotify track to generate recommendations based on.
 * @param {function} callback - A callback function to execute after the recommendations have been retrieved.
 * @returns {void} This function does not return a value directly, but retrieves a list of track recommendations based on the specified Spotify track ID and executes the specified callback function with an array of track objects as its argument.
 */

function getRecommendations(trackID, callback) {
    $.ajax({
        url: "https://api.spotify.com/v1/recommendations",
        headers: {
            "Authorization": "Bearer " + access_token
        },
        data: {
            limit: 20,
            seed_tracks: trackID // Use the ID of the chosen track as the seed
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            console.log(`Error: ${error}`);
        }
    });
}
/**
 * Displays a track preview based on the given track ID
 * and adds event listeners to enable adding the track to a playlist, playing next suggestion,
 * and toggling the display of the playlist selector.
 * @param {string} trackID - The ID of the track to display a preview for.
 * @return {void}
 */

function displayTrack(trackID) {
    var songPlayed = false;
    var storeArtistList = JSON.parse(localStorage.getItem("recentlyPlayedArtists"));

    while (currentIndex < tracklist.tracks.length) {
        var track = tracklist.tracks[currentIndex];
        var artistName = track.artists[0].name;
        var artistInRecentPlays = storeArtistList.includes(artistName);

        if (artistInRecentPlays || !track.preview_url) {
            console.log("Track: " + track.name + " not displayed " + artistName + " appears in listened list. Or a sample for the song does not exist.");
            currentIndex++;
        } else {
            // Your existing code to build the preview and display it goes here
            // ...
            var trackName = track.name;
            var albumName = track.album.name;
            var previewUrl = track.preview_url;
            var trackUrl = track.external_urls.spotify;
            var imageUrl = track.album.images[0].url;
            var previewHtml = `
      <h2>
        Your Suggestion:
      </h2>
      <div>
        <img src='${imageUrl}' style='width: 20rem; height: auto; margin: auto;'>
      </div>
      <div style="color:#121212; font-size:1.2rem;">
        <a href='${trackUrl}'> ${trackName} by ${artistName}</a><br/>
        From the album: ${albumName}<br/>
        <audio id='previewAudio' src='${previewUrl}' controls></audio>
      </div>
      <button id="addToPlaylistBtn" style="margin-top: 1rem;">Add to Playlist</button>
      <button id="loadSuggestionsBtn">Load Suggestions</button>
      `;

            // display the recommendation
            suggestions.innerHTML = previewHtml;
            fetchRecentlyPlayed();

            var addToPlaylistBtn = document.getElementById('addToPlaylistBtn');

            addToPlaylistBtn.addEventListener('click', function () {
                displayPlaylistOptions(track.id);
            });

            var triggerElement = document.getElementById("addToPlaylistBtn");
            var playlistSelector = document.getElementById("playlistSelector");

            triggerElement.addEventListener("click", function (event) {
                event.preventDefault();
                if (playlistSelector.style.display === "block") {
                    playlistSelector.style.display = "none";
                } else {
                    playlistSelector.style.display = "block";
                }
            });





            // Store the artist name in the recently played list
            storeArtistList.unshift(artistName);
            localStorage.setItem("recentlyPlayedArtists", JSON.stringify(storeArtistList));


            var newSuggestion = document.getElementById('loadSuggestionsBtn');
            newSuggestion.addEventListener('click', function () {
                currentIndex++;
                show(trackID);
                if (playlistSelector.style.display === "block") {
                    playlistSelector.style.display = "none";
                }
                // No need for an else block since we do nothing if it's not displayed
            });

            // Add event listener to the audio element
            var audioElement = document.getElementById('previewAudio');

            // Update event listener for 'ended' event
            audioElement.addEventListener('ended', function () {
                currentIndex++;
                show(trackID);
            });

            // audioElement.addEventListener('error', function () {
            //   console.log('Audio preview not available for this track. Skipping...');
            //   currentIndex++;
            //   show(trackID);
            // });

            audioElement.play();
            break;
        }
    }

    if (currentIndex >= tracklist.tracks.length) {
        // Get new recommendations if all tracks in the list have been checked
        getRecommendations(trackID, function (recommendations) {
            tracklist = recommendations;
            currentIndex = 0;
            displayTrack(trackID);
        });
    } else {
        fetchRecentlyPlayed();
    }
}

var tracklist;
var currentIndex = 0;