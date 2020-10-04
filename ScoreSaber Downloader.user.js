// ==UserScript==
// @name         ScoreSaber Downloader
// @version      1.3
// @description  Adds a download button to Score Saber song pages
// @author       bhackel
// @match        https://scoresaber.com/leaderboard/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      beatsaver.com
// @namespace https://greasyfork.org/en/users/324178-bhackel
// ==/UserScript==

(function() {
    'use strict';

    // Obtain the song hash from the page
    var rightBoxDiv = document.getElementsByClassName("box has-shadow")[0]
    var id = rightBoxDiv.children[4].innerText
    var url = "https://beatsaver.com/api/maps/by-hash/" + id;
    var response;

    // Create buttons with text, function, and classes
    var oneclickButton = document.createElement('Button');
    oneclickButton.className = "bhackel-button button is-dark has-background-grey-dark";
    oneclickButton.innerHTML = "OneClick";
    oneclickButton.addEventListener("click", oneclick);

    var zipButton = document.createElement('Button');
    zipButton.className = "bhackel-button button is-dark has-background-grey-dark";
    zipButton.innerHTML = "Zip";
    zipButton.addEventListener("click", zip);

    var previewButton = document.createElement('Button');
    previewButton.className = "bhackel-button button is-dark has-background-grey-dark";
    previewButton.innerHTML = "View Map";
    previewButton.addEventListener("click", preview);

    // Add the buttons to the page
    rightBoxDiv.append(oneclickButton, zipButton, previewButton);

    // Setup for Beat Saver API call - error handling
    function error(rspObj) {
        console.error("There was an error downloading the song: " + rspObj.status + " " + rspObj.statusText);
    }

    // Setup for Beat Saver API call - requesting data
    function request(url) {
        GM_xmlhttpRequest ({
            method:         "GET",
            url:            url,
            responseType:   "json",
            onload:         process_response,
            onabort:        error,
            onerror:        error,
            ontimeout:      error
        });
    }

    // Setup for Beat Saver API call - response from the API
    function process_response(rspObj) {
        // Check for invalid responses
        if (rspObj.status != 200 && rspObj.status != 304) {
            error(rspObj);
            return;
        }

        response = rspObj.response;
    }

    // Get the response from Beat Saver
    request(url);

    function oneclick() {
        // Create a OneClick URL from the API response
        var oneclick_url = 'beatsaver://' + response.key
        // Open the URL
        window.location.href = oneclick_url;
    }

    function zip() {
        // Create a zip download URL from the API response
        var zip_url = 'https://beatsaver.com' + response.directDownload;
        // Open the URL
        window.location.href = zip_url;
    }

    function preview() {
        // Create a map preview URL from the API response
        var preview_url = 'https://skystudioapps.com/bs-viewer/?id=' + response.key;

        // Get the selected difficulty as a string
        var difficulties = [];
        var difficulties_list = Array.from(document.getElementsByClassName("tabs")[0].children[0].children);
        difficulties_list.forEach(function(x) {
            difficulties.push(x.textContent);
        })

        // Find the index of the selected difficulty
        var difficulty = document.getElementsByClassName("is-active")[0].textContent;
        difficulty = difficulties.indexOf(difficulty);

        // Add difficulty index to the URL
        preview_url += '&difficulty=' + difficulty;

        // Open the URL in a new tab
        window.open(preview_url,'_blank');
    }

})();
