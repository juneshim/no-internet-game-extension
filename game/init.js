/**
 * Ganadi Runner - Custom Implementation
 * Copyright (c) 2025 June Shim
 * Licensed under CC BY-NC 4.0 (Creative Commons Attribution-NonCommercial 4.0 International)
 */

// Initialize keyboard event handlers
(function() {
    'use strict';
    
    function hideMessageBox() {
        var box = document.getElementById("messageBox");
        if (box) {
            box.style.visibility = "hidden";
        }
    }
    
    // Handle spacebar keydown
    document.onkeydown = function(evt) {
        evt = evt || window.event;
        if (evt.keyCode == 32) {
            evt.preventDefault();
            evt.stopPropagation();
            hideMessageBox();
        }
    };
    
    // Prevent spacebar from scrolling the page
    window.addEventListener('keydown', function(e) {
        if (e.keyCode === 32 && e.target === document.body) {
            e.preventDefault();
        }
    }, false);
    
    // Handle OK button click
    document.addEventListener('DOMContentLoaded', function() {
        var okButton = document.getElementById("okButton");
        if (okButton) {
            okButton.addEventListener('click', function() {
                hideMessageBox();
            });
        }
    });
})();

