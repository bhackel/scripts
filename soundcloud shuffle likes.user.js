// ==UserScript==
// @name         soundcloud shuffle likes
// @version      1.3
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
        var btnShuffle = document.getElementsByClassName('bhackel-shuffle-likes')[0];

        // check if button does not exist already, and that user is on likes or a playlist
        if (!btnShuffle && (url.includes("you/likes") || url.includes("/sets/"))) {
            btnShuffle = document.createElement('Button');
            btnShuffle.innerHTML = 'Shuffle Play';
            btnShuffle.onclick = function(){ setupLoad(this); };

            // case for likes
            if (url.includes("you/likes")) {
                btnShuffle.className = 'bhackel-shuffle-likes sc-button sc-button-large';
                btnShuffle.pageType = "Likes";
                // check if top bar has loaded
                var collectionTop = document.getElementsByClassName('collectionSection__top')[0];
                if (collectionTop) {
                    // insert the button above the grid of tracks
                    collectionTop.insertBefore(btnShuffle, collectionTop.children[2]);
                    btnShuffle.interval = 0;
                } else {
                    setTimeout(insertButtonLoop, 1000);
                }
            // case for a playlist
            } else if (url.includes("/sets/")) {
                btnShuffle.className = 'bhackel-shuffle-likes sc-button sc-button-medium';
                btnShuffle.pageType = "Playlist";
                // check if action bar has loaded
                var soundActions = document.getElementsByClassName('soundActions')[0];
                if (soundActions) {
                    // insert the button after other action buttons
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
        // check whether the loop is running or not
        if (btn.interval === 0) {
            btn.innerHTML = 'Click to Stop Loading';
            // list of tracks visible on screen. Check for playlist or collection
            var tracks;
            if (btn.pageType === "Likes") {
                tracks = document.getElementsByClassName('lazyLoadingList__list')[0];
            } else if (btn.pageType === "Playlist") {
                tracks = document.getElementsByClassName('trackList__list')[0];
            }
            if (tracks.childElementCount > 2) {
                // Set the current queue to the collection of tracks
                var firstTrack = tracks.children[0];
                var secondTrack = tracks.children[1];

                // hardcoded yeyeye
                var firstPlayButton = firstTrack.children[0].children[0].children[1].children[0];
                var secondPlayButton = secondTrack.children[0].children[0].children[1].children[0];
                // play 2, play 1, pause 1
                secondPlayButton.click();
                setTimeout(function(){ firstPlayButton.click(); }, 50);
                setTimeout(function(){ firstPlayButton.click(); }, 100);

                // open the queue if it is closed, to refresh queue
                checkToggleQueue('open');

                // setup the scrolling loop - needs adequate time before running so the queue resets
                setTimeout(function(){
                    btn.interval = setInterval(function() { scrollQueue(btn); }, 500);
                }, 3000);
            } else {
                // the user has two or less tracks in track list; cannot shuffle play
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
        // check to see if the queue is open
        if (queue.classList.contains('m-visible')) {
            // scroll the queue to the bottom, which loads new tracks below
            var scrollableQueue = document.getElementsByClassName('queue__scrollableInner')[0];
            var queueContainer = document.getElementsByClassName('queue__itemsHeight')[0];
            var scrollToHeight = parseInt(queueContainer.style.height);
            scrollableQueue.scroll(0,scrollToHeight);

            // check if it has loaded all tracks, then shuffle and play
            var autoplayDiv = document.getElementsByClassName('queue__fallback')[0];
            if (autoplayDiv) {
                clearInterval(btn.interval);
                btn.interval = 0;
                shuffleAndPlay(btn);
            }
        } else {
            // open the queue if it is not open
            checkToggleQueue('open');
        }
    }

    /* Shuffles the queue, then plays it
    */
    function shuffleAndPlay(btn) {
        btn.innerHTML = 'Shuffle Play';
        var playButton = document.getElementsByClassName('playControl')[0];
        var shuffleButton = document.getElementsByClassName('shuffleControl')[0];
        // only shuffle/play if it is disabled already
        if (!shuffleButton.classList.contains('m-shuffling')) {
            shuffleButton.click();
        }
        if (!playButton.classList.contains('playing')) {
            playButton.click();
        }

        // close the queue if it is open
        checkToggleQueue('close');
    }

    /* Opens or closes the song queue
    */
    function checkToggleQueue(changeToState) {
        var queue = document.getElementsByClassName('queue')[0];
        var queueOpen = queue.classList.contains('m-visible');
        // toggle queue if the queue is open and it should be closed, or if it's closed and should be open
        if ((queueOpen && changeToState === 'close') || (!queueOpen && changeToState === 'open')) {
            var queueTrigger = document.getElementsByClassName('playbackSoundBadge__queueCircle')[0];
            queueTrigger.click();
        }
    }

    insertButtonLoop();

})();
