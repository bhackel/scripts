// ==UserScript==
// @name         soundcloud shuffle likes
// @version      1.4
// @description  Adds a shuffle play button to "Likes" and playlists
// @author       bhackel
// @match        https://soundcloud.com/*
// @grant        none
// @run-at       document-end
// @noframes
// @namespace https://greasyfork.org/en/users/324178-bhackel
// ==/UserScript==

(function() {
    'use strict';

    /* Injects Button into the page once it has loaded,
       then tries to re-add it if it disappears due to page change
    */
    function insertButtonLoop() {
        var url = window.location.href;
        url = url.split('?')[0];
        var btnShuffle = document.getElementsByClassName('bhackel-shuffle-likes')[0];

        // Check if button does not exist already, and that user is on likes or a playlist
        if (!btnShuffle && (url.includes("you/likes") || url.includes("/sets/"))) {
            btnShuffle = document.createElement('Button');
            btnShuffle.innerHTML = 'Shuffle Play';
            btnShuffle.onclick = function(){ setupLoad(this); };

            // Case for likes
            if (url.includes("you/likes")) {
                btnShuffle.className = 'bhackel-shuffle-likes sc-button sc-button-large';
                btnShuffle.pageType = "Likes";
                // Check if top bar has loaded
                var collectionTop = document.getElementsByClassName('collectionSection__top')[0];
                if (collectionTop) {
                    // Insert the button above the grid of tracks
                    collectionTop.insertBefore(btnShuffle, collectionTop.children[2]);
                    btnShuffle.interval = 0;
                } else {
                    setTimeout(insertButtonLoop, 1000);
                }
            // Case for a playlist
            } else if (url.includes("/sets/")) {
                btnShuffle.className = 'bhackel-shuffle-likes sc-button sc-button-medium';
                btnShuffle.pageType = "Playlist";
                // Check if action bar has loaded
                var soundActions = document.getElementsByClassName('soundActions')[0];
                if (soundActions) {
                    // Insert the button after other action buttons
                    soundActions.children[0].appendChild(btnShuffle);
                    btnShuffle.interval = 0;
                } else {
                    setTimeout(insertButtonLoop, 1000);
                }
            }
        }
        // perform another check in 3 seconds, in the case button has been removed
        setTimeout(insertButtonLoop, 3000);
    }

    /* Changes the text of the button, resets the queue to have the user's
       likes, then starts the scrolling loop. Or it stops the loop from running.
    */
    function setupLoad(btn) {
        // Check whether the loop is running or not
        if (btn.interval === 0) {
            btn.innerHTML = 'Click to Stop Loading';
            // The list of tracks visible on screen, which changes for a playlist or likes
            var tracks;
            if (btn.pageType === "Likes") {
                tracks = document.getElementsByClassName('lazyLoadingList__list')[0];
            } else if (btn.pageType === "Playlist") {
                tracks = document.getElementsByClassName('trackList__list')[0];
            }
            if (tracks.childElementCount > 2) {
                // Reset the queue to the beginning of the list of tracks
                var firstTrack = tracks.children[0];
                var secondTrack = tracks.children[1];

                var firstPlayButton = firstTrack.children[0].children[0].children[1].children[0];
                var secondPlayButton = secondTrack.children[0].children[0].children[1].children[0];
                // Reset by playing 2, playing 1, then pausing 1
                secondPlayButton.click();
                setTimeout(function(){ firstPlayButton.click(); }, 50);
                setTimeout(function(){ firstPlayButton.click(); }, 100);

                // Add the first track to the queue so it gets shuffled
                document.getElementsByClassName("sc-button-more")[0].click()
                document.getElementsByClassName("moreActions__button addToNextUp")[0].click()

                // Open the queue to load it
                toggleQueue('open');

                // Setup the scrolling loop - Needs time before running so the queue loads
                setTimeout(function(){
                    btn.interval = setInterval(function() { scrollQueue(btn); }, 500);
                }, 3000);
            } else {
                // The user has two or less tracks in track list - cannot shuffle play
                btn.innerHTML = 'Error: Too Few Tracks';
            }
        } else {
            clearInterval(btn.interval);
            btn.interval = 0;
            btn.innerHTML = 'Shuffle Play';
        }
    }

    /* Scrolls the queue down, ensuring that the queue is open by opening it
    */
    function scrollQueue(btn) {
        var queue = document.getElementsByClassName('queue')[0];
        // Check if the queue is open
        if (queue.classList.contains('m-visible')) {
            // Scroll the queue to the bottom, loading new tracks below
            var scrollableQueue = document.getElementsByClassName('queue__scrollableInner')[0];
            var queueContainer = document.getElementsByClassName('queue__itemsHeight')[0];
            var scrollToHeight = parseInt(queueContainer.style.height);
            scrollableQueue.scroll(0,scrollToHeight);

            // Check if all tracks are loaded, then skip, shuffle, and play
            var autoplayDiv = document.getElementsByClassName('queue__fallback')[0];
            if (autoplayDiv) {
                clearInterval(btn.interval);
                btn.interval = 0;
                play(btn);
            }
        } else {
            // Open the queue if it is closed
            toggleQueue('open');
        }
    }

    /* Shuffles the queue, skips the first track, then plays it
    */
    function play(btn) {
        btn.innerHTML = 'Shuffle Play';
        var playButton = document.getElementsByClassName('playControl')[0];
        var shuffleButton = document.getElementsByClassName('shuffleControl')[0];
        var skipButton = document.getElementsByClassName("skipControl__next")[0];

        // Re-Shuffle tracks if shuffle is enabled, and enable shuffle if it is disabled
        if (shuffleButton.classList.contains('m-shuffling')) {
            shuffleButton.click();
            shuffleButton.click();
        } else if (!shuffleButton.classList.contains('m-shuffling')) {
            shuffleButton.click();
        }

        // Skip the duplicate first track that was added previously
        // This also begins playback
        skipButton.click();

        // Close the queue if it is open
        toggleQueue('close');

        // Add focus back to the play/pause button so keybinds work
        playButton.focus()
    }

    /* Opens or closes the song queue
    */
    function toggleQueue(changeToState) {
        var queue = document.getElementsByClassName('queue')[0];
        var isQueueOpen = queue.classList.contains('m-visible');
        // Toggle queue if the queue is open and it should be closed, or if it's closed and should be open
        if ((isQueueOpen && changeToState === 'close') || (!isQueueOpen && changeToState === 'open')) {
            var queueTrigger = document.getElementsByClassName('playbackSoundBadge__queueCircle')[0];
            queueTrigger.click();
        }
    }

    insertButtonLoop();

})();
