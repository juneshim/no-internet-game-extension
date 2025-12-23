/**
 * AssetLoader - Dynamic asset loading system for T-Rex Runner
 * Supports theme-based asset management with folder structure
 */
(function() {
    'use strict';

    /**
     * AssetLoader class
     * @constructor
     */
    function AssetLoader() {
        this.currentTheme = 'default';
        this.themeConfig = null;
        this.loadedAssets = {
            sprites: {},
            sounds: {}
        };
        this.spriteDefinition = null;
    }

    /**
     * Get extension resource URL
     * @param {string} path - Relative path from extension root
     * @return {string} Full URL
     */
    AssetLoader.prototype.getResourceURL = function(path) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
        }
        // Fallback for non-extension environment (testing)
        return path;
    };

    /**
     * Load theme configuration
     * @param {string} themeName - Theme name (folder name)
     * @return {Promise<Object>} Theme configuration
     */
    AssetLoader.prototype.loadThemeConfig = function(themeName) {
        var self = this;
        var configPath = 'assets/themes/' + themeName + '/theme-config.json';
        var configURL = this.getResourceURL(configPath);

        return fetch(configURL)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load theme config: ' + themeName);
                }
                return response.json();
            })
            .then(function(config) {
                self.themeConfig = config;
                self.spriteDefinition = config.spriteDefinition;
                return config;
            })
            .catch(function(error) {
                console.error('Error loading theme config:', error);
                // Fallback to default theme
                if (themeName !== 'default') {
                    return self.loadThemeConfig('default');
                }
                throw error;
            });
    };

    /**
     * Load sprite image
     * @param {string} spritePath - Path to sprite image
     * @param {string} id - Element ID for the image
     * @return {Promise<HTMLImageElement>} Loaded image element
     */
    AssetLoader.prototype.loadSprite = function(spritePath, id) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var img = new Image();
            var fullPath = self.getResourceURL(spritePath);

            img.onload = function() {
                img.id = id;
                self.loadedAssets.sprites[id] = img;
                resolve(img);
            };

            img.onerror = function() {
                reject(new Error('Failed to load sprite: ' + spritePath));
            };

            img.src = fullPath;
        });
    };

    /**
     * Load sound file as base64 or file
     * @param {string} soundPath - Path to sound file
     * @param {string} id - Element ID for the audio
     * @return {Promise<HTMLAudioElement>} Loaded audio element
     */
    AssetLoader.prototype.loadSound = function(soundPath, id) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var audio = new Audio();
            var fullPath = self.getResourceURL(soundPath);

            audio.oncanplaythrough = function() {
                audio.id = id;
                self.loadedAssets.sounds[id] = audio;
                resolve(audio);
            };

            audio.onerror = function() {
                reject(new Error('Failed to load sound: ' + soundPath));
            };

            audio.src = fullPath;
            audio.load();
        });
    };

    /**
     * Load all assets for a theme
     * @param {string} themeName - Theme name
     * @return {Promise<Object>} Loaded assets
     */
    AssetLoader.prototype.loadTheme = function(themeName) {
        var self = this;
        this.currentTheme = themeName;

        return this.loadThemeConfig(themeName)
            .then(function(config) {
                var promises = [];

                // Load sprite images
                if (config.sprites) {
                    if (config.sprites['1x']) {
                        promises.push(
                            self.loadSprite(config.sprites['1x'], 'offline-resources-1x')
                        );
                    }
                    if (config.sprites['2x']) {
                        promises.push(
                            self.loadSprite(config.sprites['2x'], 'offline-resources-2x')
                        );
                    }
                }

                // Store sound config for later (base64 data URLs will be handled in insertAssetsIntoDOM)
                self.soundConfig = config.sounds || null;

                // Load sounds (only if provided as file paths, skip base64 data URLs)
                if (config.sounds) {
                    var soundMapping = {
                        'press': 'offline-sound-press',
                        'hit': 'offline-sound-hit',
                        'score': 'offline-sound-reached'
                    };

                    for (var soundKey in config.sounds) {
                        if (config.sounds.hasOwnProperty(soundKey)) {
                            var soundPath = config.sounds[soundKey];
                            // Skip base64 data URLs - they will be handled by the template
                            if (soundPath && !soundPath.startsWith('data:')) {
                                var soundId = soundMapping[soundKey] || soundKey;
                                // Wrap in catch to prevent sound loading failures from breaking the game
                                promises.push(
                                    self.loadSound(soundPath, soundId).catch(function(error) {
                                        console.warn('Failed to load sound:', soundKey, error);
                                        return null; // Return null instead of rejecting
                                    })
                                );
                            }
                        }
                    }
                }

                return Promise.all(promises);
            })
            .then(function(results) {
                // Filter out null results from failed sound loads
                // Insert loaded assets into DOM
                self.insertAssetsIntoDOM();
                return self.loadedAssets;
            })
            .catch(function(error) {
                console.error('Error loading theme assets:', error);
                // Still try to insert what we have
                self.insertAssetsIntoDOM();
                throw error; // Re-throw to allow fallback
            });
    };

    /**
     * Insert loaded assets into DOM
     */
    AssetLoader.prototype.insertAssetsIntoDOM = function() {
        var container = document.getElementById('offline-resources');
        if (!container) {
            console.warn('offline-resources container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Add sprite images
        for (var spriteId in this.loadedAssets.sprites) {
            if (this.loadedAssets.sprites.hasOwnProperty(spriteId)) {
                container.appendChild(this.loadedAssets.sprites[spriteId]);
            }
        }

        // Create audio template for sounds
        var audioTemplate = document.createElement('template');
        audioTemplate.id = 'audio-resources';

        var soundMapping = {
            'press': 'offline-sound-press',
            'hit': 'offline-sound-hit',
            'score': 'offline-sound-reached'
        };

        // Add loaded sound files
        for (var soundId in this.loadedAssets.sounds) {
            if (this.loadedAssets.sounds.hasOwnProperty(soundId)) {
                var audio = this.loadedAssets.sounds[soundId].cloneNode();
                audio.id = soundId;
                audioTemplate.content.appendChild(audio);
            }
        }

        // Add base64 data URL sounds from config
        if (this.soundConfig) {
            for (var soundKey in this.soundConfig) {
                if (this.soundConfig.hasOwnProperty(soundKey)) {
                    var soundPath = this.soundConfig[soundKey];
                    // Only process base64 data URLs here
                    if (soundPath && soundPath.startsWith('data:')) {
                        var soundId = soundMapping[soundKey] || soundKey;
                        var audio = document.createElement('audio');
                        audio.id = soundId;
                        audio.src = soundPath;
                        audioTemplate.content.appendChild(audio);
                    }
                }
            }
        }

        // Only append template if it has content
        if (audioTemplate.content.children.length > 0) {
            container.appendChild(audioTemplate);
        }
    };

    /**
     * Get sprite definition
     * @return {Object} Sprite definition
     */
    AssetLoader.prototype.getSpriteDefinition = function() {
        return this.spriteDefinition || null;
    };

    /**
     * Get loaded sprite image
     * @param {string} id - Sprite ID
     * @return {HTMLImageElement|null} Sprite image
     */
    AssetLoader.prototype.getSprite = function(id) {
        return this.loadedAssets.sprites[id] || null;
    };

    /**
     * Get loaded sound
     * @param {string} id - Sound ID
     * @return {HTMLAudioElement|null} Sound element
     */
    AssetLoader.prototype.getSound = function(id) {
        return this.loadedAssets.sounds[id] || null;
    };

    // Export AssetLoader
    window.AssetLoader = AssetLoader;

    // Create global instance
    window.assetLoader = new AssetLoader();
})();

