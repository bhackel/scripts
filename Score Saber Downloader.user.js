// ==UserScript==
// @name         Score Saber Downloader
// @version      1.0
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

    // Create button with text, function, and classes
    var button = document.createElement('Button');
    button.className = "bhackel-button button is-dark has-background-grey-dark";
    button.onclick = request;
    button.innerHTML = "OneClick Download";

    // Add the button to the page
    var div = document.getElementsByClassName("box has-shadow")[0]
    div.appendChild(button);

    // Obtain the song hash from the page
    var id = div.children[4].innerText
    var url = "https://beatsaver.com/api/maps/by-hash/" + id;

    // Setup for Beat Saver API call
    var reportAJAX_Error;
    function request() {
        GM_xmlhttpRequest ( {
            method:         "GET",
            url:            url,
            responseType:   "json",
            onload:         process_response,
            onabort:        reportAJAX_Error,
            onerror:        reportAJAX_Error,
            ontimeout:      reportAJAX_Error
        } );
    }

    function process_response(rspObj) {
        // Check for invalid responses
        if (rspObj.status != 200 && rspObj.status != 304) {
            reportAJAX_Error (rspObj);
            return;
        }

        // Create a OneClick URL from the API response
        var oneclick_url = 'beatsaver://' + rspObj.response.key

        // Open the URL
        window.location.href = oneclick_url
    }
})();