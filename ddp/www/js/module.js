var mapSvc, posSvc, photoSvc, partySvc, loginSvc, chatSvc;

angular.module("PartyRev", ["ngCordova", "ngCordovaOauth"]).config(function($cordovaFacebookProvider) {
    var version = "v2.0"; // or leave blank and default is v2.0







}).factory("PosSvc", ["PartySvc", "$http", "$cordovaGeolocation", "$q", function(partySvc, $http, $cordovaGeolocation, $q) {

    posSvc = {

        lastPosition : null,

        isPositionTracking : false,
        posTrackingIntervalTimer : null,

        initGeo: function () {

        },

        startPositionTracking : function() {
            if (posSvc.isPositionTracking) {
                return;
            }
            posSvc.isPositionTracking = true;
            posSvc.posTrackingIntervalTimer = setInterval(function() {
                posSvc.getPos().then(function(pos) {
                    posSvc.savePos(pos.lat, pos.lng)
                })
                partySvc.loadBeacons();
            }, 8000)
        },

        stopPositionTracking : function() {
            posSvc.isPositionTracking = false;
            clearInterval(posSvc.posTrackingIntervalTimer);
        },

        savePos: function (lat, lng) {
            var post = {
                userId: partySvc.getUserId(),
                lat: lat,
                lng: lng
            };

            partySvc.updateCachedUserPosition(post.userId, post);

            console.log("Saving position: ");
            console.dir(post);
            $http.post("https://lambdaUrl/updatePos", post).then(
                function (response) {
                    console.log("Response from updatePos:")
                    console.dir(response)
                },
                function error(err) {
                    console.log("Error during updatePos:")
                    console.log(err)
                }
            )
        },

        loadParty: function () {
            var q = $q.defer();
            $http.get("https://lambdaUrl/loadPos").then(
                function (res) {
                    if (res && res.data && res.data.items) {
                        q.resolve(res.data.items);
                    } else {
                        q.reject();
                    }
                },
                function () {
                    q.reject();
                }
            );
            return q.promise;
        },

        getPos: function () {
            console.log("posSvc.getPos()");
            var posOptions = {timeout: 5000, enableHighAccuracy: false};
            return $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                console.log("Setting last position to " + JSON.stringify(position))
                console.log(position)
                var pos = {
                    lat : position.coords.latitude,
                    lng : position.coords.longitude
                }
                posSvc.lastPosition = pos;
                var qp = $q.defer();
                qp.resolve(pos);
                return qp.promise;
            })
        },

        // Return the last known position
        getLastPos : function() {
            console.log("Last known position: " + JSON.stringify(posSvc.lastPosition))
            return posSvc.lastPosition;
        }
    };
    return posSvc;






}]).factory("PhotoSvc", ["$http", "$q", "LoginSvc", "PosSvc", function($http, $q, loginSvc, posSvc) {
    photoSvc = {
        /**
         * The callback is invoked on successful upload of a
         * user selected photo, with the following information:
         * {
         *      thumb : <url>
         *      fullSize : <url>
         *      lat : <latitude>
         *      lng : <longitude>
         *      userId : <id>
         * }
         * @param callback
         */
        uploadPhoto : function(callback) {
            navigator.camera.getPicture(
                function cameraSuccess(imageUri) {
                    console.log("Have uri " + imageUri)
                    
                    // Get policy
                    var policyUrl = "https://lambdaUrl/imgUploadPolicy";
                    $http.post(policyUrl, {userId : loginSvc.getUserId()}).then(function(res) {
                        console.log(res)
                        if (res && res.data && res.data.fields) {
                            var policy = res.data.fields;

                            var options = new FileUploadOptions();
                            var photoNum = res.data.photoCount;
                            options.fileName = "img" + photoNum + ".jpg";
                            options.params = {
                                "key": loginSvc.getUserId() + "/${filename}",
                                "acl": "public-read",
                                "Content-Type": "image/jpeg",
                                "x-amz-algorithm": policy["x-amz-algorithm"],
                                "x-amz-credential": policy["x-amz-credential"],
                                "x-amz-date": policy["x-amz-date"],
                                "x-amz-signature": policy["x-amz-signature"],
                                "policy": policy["policy"]
                            };

                            alert("Photo will upload, this may take some time");

                            var ft = new FileTransfer();
                            ft.upload(imageUri, "https://s3url/",
                                function success(r) {
                                    console.log("Code = " + r.responseCode);
                                    console.log("Response = " + r.response);
                                    console.log("Sent = " + r.bytesSent);
                                    posSvc.getPos().then(function (pos) {
                                        console.log("Have position");

                                        $http.post("https://lambdaUrl/addPhoto", {
                                            userId: loginSvc.getUserId(),
                                            photoNum: photoNum,
                                            lat: pos.lat,
                                            lng: pos.lng
                                        }).then(function(res) {
                                            console.log("Add photo response:");
                                            console.log(res);
                                            callback(res.data)
                                        })
                                    }, function() {
                                        alert("GPS must be enabled to upload photos")
                                    })
                                },
                                function fail(error) {
                                    console.log(error);
                                    console.log("upload error code " +  error.code);
                                    console.log("upload error source " + error.source);
                                    console.log("upload error target " + error.target);
                                },
                                options
                            )
                        }
                    })
                },
                function cameraError(error) {
                    console.debug("Unable to obtain picture: " + error, "app");
                },
                photoSvc.getOptions());
        },

        loadPhotos : function(userIds) {
            var qp = $q.defer();

            var url = "https://lambdaUrl/loadPhotos";

            $http.post(url, {userIds:userIds}).then(function(res) {
                if (res && res.data && res.data.photos) {
                    qp.resolve(res.data.photos)
                } else {
                    qp.reject(res);
                }
            }, function(err) {
                qp.reject(err);
            });

            return qp.promise;
        },

        getOptions : function() {
            return {
                // Some common settings are 20, 50, and 100
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                allowEdit: true,
                correctOrientation: true  //Corrects Android orientation quirks
            };
        }
    }
    return photoSvc;





}]).factory("MapSvc", ["$http", "ProfilePicCache", "PosSvc", function($http, profilePicCache, posSvc) {
    mapSvc = {
        map : undefined,
        positionInitialized : false,

        beaconMarkers : {},             // { "<beaconId>" : Marker }
        userMarkers : {},               // { "<userId>" : Marker }

        infoWindow : null,

        centerMap : function() {
            var lastPos = posSvc.getLastPos();
            if (lastPos && mapSvc.map) {
                mapSvc.map.panTo(lastPos);
                console.log("Centered map to " + JSON.stringify(center))
            }
        },

        addLine : function (from, to) {
            // console.log("Drawing line from " + JSON.stringify(from) + " to " + JSON.stringify(to))

            var line = new google.maps.Polyline({
                path: [from, to],
                geodesic: true,
                strokeColor: '#C6FDD6',
                strokeOpacity: 0.5,
                strokeWeight: 1
            });
            line.setMap(mapSvc.map);
            return line;
        },

        clearLine : function(line) {
            console.log("mapSvc.clearLine");
            if (line) {
                console.log("mapSvc.clearLine removing line");
                line.setMap(null);
            }
        },

        getInfoWindow : function() {
            if (mapSvc.infoWindow == null) {
                mapSvc.infoWindow = new google.maps.InfoWindow({
                    content : "IWContent"
                });
            }
            return mapSvc.infoWindow;
        },

        /**
         * photoInfo : {
         *      lat : Number,
         *      lng : Number,
         *      fullSize : url,
         *      thumb : url,
         *      addedOn : Number,
         *      userId : Number
         * }
         *
         * Note: userId and addedOn form a unique key
         * @param photoInfo
         */
        addPhotoDrop : function(photoInfo, doAlert) {
            var infoWindow = mapSvc.getInfoWindow();
            var marker = new google.maps.Marker({
                position: {
                    lat : photoInfo.lat,
                    lng : photoInfo.lng
                },
                map: mapSvc.map,
                icon: {
                    url: 'https://s3url/CAMERA-PHOTO.png'
                    //, scaledSize: new google.maps.Size(48, 48) // pixels
                }
            });
            marker.addListener('click', function() {
                console.log("Opening photo drop with thumb " + photoInfo.thumb);

                var openHTML  = "<div class='infoWindow'>" +
                    "<a href='" + photoInfo.fullSize + "'><img src='" + photoInfo.thumb + "' />"
                var closeHTML = "</a></div><div id='report' onclick='reportPhoto(\"" +
                        photoInfo.userId + "\"," + photoInfo.addedOn + ");'>Report</div>";

                infoWindow.setContent(openHTML +  closeHTML);
                infoWindow.open(mapSvc.map, marker);
            })
            if (doAlert) {
                alert("Photo added to the map!  Party! :)");
            }
        },

        // Adds or moves the party beacon
        setPartyBeacon : function(lat, lng, beaconId) {
            console.log("setPartyBeacon");
            var marker = mapSvc.beaconMarkers[""+beaconId];
            if (marker) {
                console.log("setPartyBeacon - setPosition: " +{lat:lat,lng:lng} );
                marker.setPosition({lat:lat,lng:lng});
            } else {
                marker = new google.maps.Marker({
                    position: {
                        lat : lat,
                        lng : lng
                    },
                    animation: google.maps.Animation.BOUNCE,
                    map: mapSvc.map,
                    icon: {
                        url: 'https://s3url/glove.png'
                        /*
                        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        , scaledSize: new google.maps.Size(64, 64) // pixels
                        */
                    },
                    zIndex : 9999
                });
                mapSvc.beaconMarkers[""+beaconId] = marker;
                marker.addListener('click', partySvc.createBeaconOnclick(marker, beaconId))
            }
        },

        addUserMarker : function(lat, lng, userPanel) {
            if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
                return;
            }
            var infoWindow = mapSvc.getInfoWindow();
            var marker = new google.maps.Marker({
                position: {
                    lat : lat,
                    lng : lng
                },
                map: mapSvc.map,
                animation: google.maps.Animation.DROP,
                icon: {
                    url: 'https://s3url/boombox.png'
                }
                // title: title
            });
            mapSvc.userMarkers[""+userPanel.userId] = marker;
            marker.addListener('click', function() {
                console.log("Setting content to");
                console.dir(userPanel);

                var url = "https://m.facebook.com/app_scoped_user_id/" + userPanel.userId + "/";

                var openHTML  = "<div class='infoWindow'>" +
                    "<a class='intent' href='" + url  + "'" +
                    " data-scheme='fb://facewebmobile/href=" + url+ "'>";
                var closeHTML = "</a></div>";

                infoWindow.setContent(openHTML + userPanel.firstName + closeHTML);

                console.log("Loading profile pic for " + userPanel.userId);
                profilePicCache.getProfilePics([userPanel.userId]).then(
                    function(pics) {
                        console.log("Response from profilePic:");
                        console.dir(pics);
                        var image = "";
                        if (pics[""+userPanel.userId]) {
                           image = "<img src='" + pics[""+userPanel.userId] + "'/><br>";
                        }
                        infoWindow.setContent(openHTML + image + userPanel.firstName + closeHTML);
                    }
                    // TODO error handling?
                );
                infoWindow.open(mapSvc.map, marker);
            })
        },

        moveUserMarker : function(userId, lat, lng) {
            var marker = mapSvc.userMarkers[""+userId];
            if (marker) {
                console.log("Moving marker from " + JSON.stringify(marker.getPosition()) +
                    " to " + JSON.stringify({lat:lat, lng:lng}) +
                    "for user " + userId);
                console.log("moveUserMarker - setPosition: " + {lat:lat,lng:lng})
                marker.setPosition({lat:lat,lng:lng});
            }
        },

        loadMap : function(latlng) {

            if (latlng && !mapSvc.positionInitialized) {
                mapSvc.positionInitialized = true;
                mapSvc.map.panTo(latlng);
                return;
            }

            var zoom = 17;
            if (!latlng) {
                zoom = 10;
                latlng = {lat: 49.246292, lng:-123.116226};
            }

            console.log("Loading map");
            var styleArray = [
                {
                    featureType: "all",
                    stylers: [
                        {hue: "#EC7063"}
                    ]
                }, {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [
                        {hue: "#58D68D"}
                    ]
                }, {
                    featureType: "poi.business",
                    elementType: "labels",
                    stylers: [
                        {visibility: "off"}
                    ]
                }
            ];

            var mapArgs = {
                center: latlng,
                zoom: zoom,
                styles: styleArray,
                mapTypeId: 'satellite'
            };

            mapSvc.map = new google.maps.Map(document.getElementById('map'), mapArgs);
            mapSvc.map.setTilt(45);
        }
    };
    return mapSvc;






}]).factory("PartySvc", ["$http", "$q", function($http, $q) {
    partySvc = {

        userId : undefined,

        beacons : {},               // A cache of beacons.  Format : {"beaconId": beacon}

        beaconJoined : null,        // The current active beacon for the user

        users : {},                 // A cache of users (includes locations).  Format: {"userId" : user}

        getUserId : function() {
            return partySvc.userId;
        },

        // Adds a user to the cache
        cacheUser : function(user) {
            partySvc.users["" + user.userId] = user;
        },

        // Returns a user from the cache.
        // TODO: Make it a read through cache
        getUser : function(userId) {
            return partySvc.users[""+userId];
        },

        // update the user position if they exist in the cache
        // { lat, lng }
        updateCachedUserPosition : function(userId, latlng) {
            var user = partySvc.getUser(userId);
            if (user) {
                user.lat = latlng.lat;
                user.lng = latlng.lng;
            }
        },

        createBeaconOnclick : function(marker, beaconId) {
            return function() {
                var infoWindow = mapSvc.getInfoWindow();
                console.log("Opening party beacon");

                var html = "<div class='infoWindow'>" +
                    "<div class='partyBeaconContent'><div class='partyBeaconJoinButton'><div " +
                        "id='b" + beaconId + "_text' " +
                        "class='partyBeaconJoinText' ";
                if (partySvc.hasJoinedParty(beaconId)) {
                    html += ">";
                    html += "The party is here";
                    html += "</div><div class='leaveParty' onclick='partySvc.leaveParty(\"" + beaconId + "\")'>(disconnect)</div>"
                } else {
                    html += "onclick='partySvc.joinParty(\"" + beaconId + "\")'>";
                    html += "The party is here<br><br>Join Party";
                }
                html += "</div></div></div></div>";

                infoWindow.setContent(html);
                infoWindow.open(mapSvc.map, marker);
            }
        },

        hasJoinedParty : function(beaconId) {
            return partySvc.beaconJoined == beaconId;
        },

        joinParty : function(beaconId) {
            console.log("Joining party beacon " + beaconId);

            if (partySvc.beaconJoined == beaconId) {
                return;
            }

            // Join the party then draw a line connecting the user to the party.
            var url = "https://lambdaUrl/joinParty";
            $http.post(url, {userId: loginSvc.getUserId(), beaconId : beaconId}).then(function() {

                $("#b" + beaconId + "_text").text("Joined!");
                var beacon = partySvc.beacons[""+beaconId];
                var userPos = posSvc.getLastPos();

                mapSvc.clearLine(beacon.line);
                beacon.line = mapSvc.addLine(beacon, userPos);

                partySvc.beaconJoined = beaconId;
                posSvc.startPositionTracking();
            }, function(err) {
                console.log('Error joining party: ' + JSON.stringify(err))
            })
        },

        leaveParty : function(beaconId) {
            console.log("Leaving party beacon " + beaconId);

            var url = "https://lambdaUrl/leaveParty";
            $http.post(url, {userId: loginSvc.getUserId(), beaconId : beaconId}).then(function() {
                var beacon = partySvc.beacons["" + beaconId];
                $("#b" + beaconId + "_text").text("Left!");
                if (beacon.line) {
                    mapSvc.clearLine(beacon.line);
                    beacon.line = null;
                }
                partySvc.beaconJoined = null;
                posSvc.stopPositionTracking();
            }, function(err) {
                console.log('Error leaving party ' + JSON.stringify(err))
            });
        },

        getCachedBeacon : function(beacon) {
            var cachedBeacon = partySvc.beacons["" + beacon.beaconId];
            if (!cachedBeacon) {
                partySvc.beacons["" + beacon.beaconId] = beacon;
                cachedBeacon = beacon;
            } else {
                cachedBeacon.lat = beacon.lat;
                cachedBeacon.lng = beacon.lng;
            }
            return cachedBeacon;
        },

        loadBeacons : function() {
            var qp = $q.defer();
            var url = "https://lambdaUrl/loadPartyBeacons";
            $http.post(url, {}).then(function(res) {
                console.log("partySvc.loadBeacons: ");
                console.log(res);
                var beacons = res.data.beacons;
                // Cache the beacons
                beacons.forEach(function(beacon, i) {
                    beacon = partySvc.getCachedBeacon(beacon);
                    partySvc.loadBeaconUsers(beacon);
                    console.log("loadBeacons - beacon #" + i);
                    console.log(beacon);
                    mapSvc.setPartyBeacon(beacon.lat, beacon.lng, beacon.beaconId);
                });


                if (beacons) {
                    qp.resolve(beacons);
                } else {
                    qp.reject(res);
                }
            }, function(err) {
                qp.reject(err);
            });
            return qp.promise;
        },

        loadBeaconUsers : function(beacon) {
            var url = "https://lambdaUrl/loadParty";
            var currentUserId = loginSvc.getUserId();
            $http.post(url, {beaconId:beacon.beaconId}).then(function(res) {
                if (res && res.data && res.data.users) {
                    console.log("Loaded " + res.data.users.length + " beacon users");
                    console.log(res.data.users)
                    console.log("Current user: " + currentUserId);

                    // - Clear existing lines
                    // - Move the markers
                    // Add markers for new users
                    if (beacon.lines) {
                        beacon.lines.forEach(function(line) {
                            line.setMap(null);
                        });
                    }
                    beacon.lines = [];
                    var users = res.data.users;

                    var userIds = [];
                    users.forEach(function(user) {
                        // If we find the current user already belonging to the beacon, then
                        // ensure we update the 'beaconJoined' state.
                        console.log("Loaded user " + user.userId);
                        var cachedUser = partySvc.getUser(user.userId);
                        if (cachedUser) {
                            if (user.userId == currentUserId) {
                                partySvc.beaconJoined = beacon.beaconId;
                                console.log("User has joined beacon " + beacon.beaconId);
                                mapSvc.clearLine(beacon.line);
                                beacon.line = mapSvc.addLine(beacon, cachedUser);
                                posSvc.startPositionTracking();
                            } else {
                                beacon.lines.push(mapSvc.addLine(beacon, cachedUser));
                            }
                            mapSvc.moveUserMarker(cachedUser.userId, cachedUser.lat, cachedUser.lng);
                        }
                    });
                    // Load the location of each user (in batch)

                }
            }, function(err) {
                console.log("Error calling loadPartyBeacons: " + JSON.stringify(err));
            })
        },

        addUser : function (fbAuth, fbUser) {

            var deferred = $q.defer();
            console.log("partySvc.addUser");
            console.dir(fbAuth);
            console.dir(fbUser);

            var post = {
                userId : fbAuth.authResponse.userID,
                accessToken : fbAuth.authResponse.accessToken,
                email : fbUser.email,
                firstName : fbUser.first_name,
                lastName : fbUser.last_name
            };

            var addUserURL = "https://lambdaUrl/addUser";
            
            $http.post(addUserURL, post).then(function(e) {
                console.log("Posted to /addUser");
                console.dir(e);
                if (e.data && e.data.ok) {
                    partySvc.userId = post.userId;
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            }, function(err) {
                console.log("Error posting to /addUser");
                console.dir(err);
                deferred.reject();
            });
            return deferred.promise;
        }
    };
    return partySvc;






}]).factory("LoginSvc", ["$cordovaFacebook", "$q", "PartySvc", function($cordovaFacebook, $q, party) {
    loginSvc = {
        
        accessToken : null,
        
        getPartyAccessToken : function() {
            return loginSvc.accessToken;
        },

        getUserId : function() {
            return loginSvc.userId;
        },
        
        login : function() {
            console.log("LoginSvc.startLogin");
            return $cordovaFacebook.login(["public_profile", "email"]).then(
                function(fbAuth) {
                    console.log("Received login response :)");
                    console.dir(fbAuth);
                    loginSvc.accessToken = fbAuth.authResponse.accessToken;
                    loginSvc.userId = fbAuth.authResponse.userID;
                    console.log("Set party access token to " + loginSvc.accessToken);
                    console.log("Set userId to " + loginSvc.userId);
                    return loginSvc.userInfo(fbAuth.authResponse.userID).then(
                        function(fbUser) {
                            return party.addUser(fbAuth, fbUser);
                        }
                    )
                },
                function(err) {
                    console.log("Error during login");
                    console.dir(err)
                }
            );
        },
        getLoginStatus : function() {
            return $cordovaFacebook.getLoginStatus();
        },
        userInfo : function(userID) {
            console.log("Fetching user info for user " + userID)
            return $cordovaFacebook.api("/v2.5/me/?fields=id,first_name,last_name,email",["public_profile"])
        }
    };
    return loginSvc;






}]).factory("ChatSvc", ["PartySvc", "$http", "$q", function(partySvc, $http, $q) {

    chatSvc = {
        sendMessage : function(msg) {
            var url = "https://lambdaUrl/addMsg";
            var post = {
                userId : partySvc.getUserId(),
                msg : msg
            };
            return $http.post(url, post)
        },

        loadChat : function() {
            var url = "https://lambdaUrl/loadMsgs";
            var post = {};
            var qp = $q.defer();
            $http.post(url, post).then(function(res) {
                if (res && res.data && res.data.msgs) {
                    qp.resolve(res.data.msgs);
                } else {
                    qp.reject();
                }
            }, function error() { qp.reject(); });
            return qp.promise;
        }
    };
    return chatSvc;






}]).factory("ProfilePicCache", ["$http", "$q", function($http, $q) {

    var cache = {
        profilePics : {}
    };

    var internal = {
        isLoaded : function(userId) {
            return cache.profilePics.hasOwnProperty(""+userId);
        },

        // Returns a [] of userIds who are not currently cached.
        notLoaded : function(userIds) {
            var result = [];
            userIds.forEach(function(userId) {
                if (!internal.isLoaded(userId)) {
                    result.push(userId);
                }
            });
            return result;
        },

        addResponse : function(response) {
            var o = response.data;
            Object.keys(o).forEach(function(userId) {
                var e = o[userId];
                if (e && e.data && e.data.url) {
                    cache.profilePics[userId] = o[userId].data.url;
                }
            });
        },

        loadProfilePics : function(userIds) {
            var qp = $q.defer();
            $http.post("https://lambdaUrl/profilePic", {
                userIds : userIds
            }).then(function ok(result) {
                internal.addResponse(result);
                qp.resolve(cache.profilePics)
            }, function err(error) {
                console.log(error)
                qp.reject();
            })
            return qp.promise;
        }
    };

    var profilePicCacheAPI = {

        getProfilePics : function (userIds) {
            var qp = $q.defer();
            var notLoaded = internal.notLoaded(userIds);
            if (notLoaded.length > 0) {
                qp.resolve(internal.loadProfilePics(notLoaded));    // TODO Is it resolving with too little?
            } else {
                qp.resolve(cache.profilePics)
            }
            return qp.promise;
        }
    };
    return profilePicCacheAPI;






}]).controller("GroundCtrl", ["LoginSvc", "MapSvc", "PosSvc", "PhotoSvc", "ChatSvc", "PartySvc", "ProfilePicCache", "$q",
                      function(loginSvc,   mapSvc,   posSvc,   photoSvc,   chatSvc,   partySvc,   profilePicCache,   $q) {

    var me = this;
    me.showMap = false;
    console.log("Loaded GroundCtrl");
    me.lat = "";
    me.lng = "";
    me.showLogin = true;
    me.showAddPhoto = false;
    me.showOpenChatBtn = false;
    me.showAboutBtn = false;
    me.showChatWindow = false;
    me.showAboutWindow = false;
    me.showTerms = true;
    me.textInput = "";
    me.termsAccepted = false;
    me.showMapControls = false;

    this.centerMap = function() {
        mapSvc.centerMap();
    };

    this.addPhoto = function() {
        me.showAboutWindow = false;
        me.showChatWindow = false;
        photoSvc.uploadPhoto(function(photoDrop) {
            console.log("Upload photo result");
            console.log(photoDrop);
            mapSvc.addPhotoDrop(photoDrop, true)
        });
    };

    this.openChat = function() {
        me.showChatWindow = !me.showChatWindow;
        me.showAboutWindow = false;
        me.showMapControls = false;
        me.scrollToBottom($("#chatLog"), true);
    };

    this.showAbout = function() {
        me.showAboutWindow = !me.showAboutWindow;
        me.showChatWindow = false;
        me.showMapControls = false;
    };


    this.reloadChat = function() {
        console.log("Reloading chat")
        chatSvc.loadChat().then(function(logs) {
            var chatDiv = $("#chatLog");
            chatDiv.empty();
            console.log("Loaded chat logs");
            console.log(logs);

            var userIds = {};
            logs.forEach(function(log) {
                userIds[log.userId] = true
            });
            profilePicCache.getProfilePics(Object.keys(userIds)).then(function(picsByUserId) {
                console.log("Profile pics loaded: ");
                console.log(picsByUserId);

                logs.forEach(function(log) {
                    var date = new Date(log.addedOn);
                    var mo = date.getMonth()+1;
                    var d = date.getDate();
                    var h = date.getHours();
                    var min = ""+date.getMinutes();
                    if (min.length == 1) min = "0"+min;
                    // console.log(log)

                    var url = "https://m.facebook.com/app_scoped_user_id/" + log.userId;
                    var fbLink = $("<a>", {
                        href : url,
                        "data-scheme" : "fb://facewebmobile/href=" + url
                    }).addClass("profilePic").addClass("intent");
                    var img = $("<img>", {src: picsByUserId[log.userId]});
                    var textBox = $("<div>").addClass("text");
                    var timeSpan =  $("<span>").addClass("time").text(mo + "/" + d + " " + h + ":" + min);
                    var msgSpan = $("<span>").addClass("item").text(log.msg);
                    var lineDiv = $("<div>").addClass("line");

                    fbLink.append(img);
                    textBox.append(timeSpan).append(msgSpan);
                    lineDiv.append(textBox).append(fbLink);
                    chatDiv.append(lineDiv);
                });
                me.scrollToBottom($("#chatLog"), true);
            })

        }, function(err) {
            console.log("Reloading chat failed");
            console.log(err);
        });
    };

    this.send = function() {
        chatSvc.sendMessage(me.textInput).then(function() {
            me.textInput = "";
            me.reloadChat();
        }, function error(err) {
            console.log("Send message failed");
            console.log(err);
        })
    };

    this.scrollToBottom = function(elem, force) {
        setTimeout(function() {
            elem.scrollTop(0);
            elem.animate({ scrollTop: elem[0].scrollHeight + "px" }, 1300);
        }, 25);

        // var isScrolledToBottom = elem.scrollHeight - elem.clientHeight <= elem.scrollTop + 1;
        // console.log(elem.scrollHeight - elem.clientHeight,  elem.scrollTop + 1);
        // // scroll to bottom if isScrolledToBotto
        // if (force || isScrolledToBottom) {
        //     elem.scrollTop = elem.scrollHeight - elem.clientHeight;
        // }
    };

    this.populateMap = function (pos) {
        console.log("Have position");
        me.lat = pos.lat;
        me.lng = pos.lng;
        mapSvc.loadMap({lat:me.lat, lng:me.lng});
        posSvc.savePos(me.lat, me.lng);
        posSvc.loadParty().then(function(users) {

            var qp = $q.defer();
            users.forEach(function(user, i) {
                partySvc.cacheUser(user);

                setTimeout(function() {
                    mapSvc.addUserMarker(user.lat, user.lng, user);
                }, i*300);

                photoSvc.loadPhotos([user.userId]).then(function(photos) {
                    console.log(photos);
                    photos.forEach(function(photo) {
                        var baseURL = "https://s3url/" + photo.userId + "/img" + photo.photoNum;
                        var photoInfo = {
                            thumb : baseURL + "-thumb.jpg",
                            fullSize : baseURL + ".jpg",
                            lat : photo.lat,
                            lng : photo.lng,
                            addedOn : photo.addedOn,
                            userId : ""+photo.userId
                        };
                        mapSvc.addPhotoDrop(photoInfo, false);
                    })
                });
            });
            qp.resolve();
            return qp.promise;
        }).then(function() {

            // Load the party beacons after the users.
            partySvc.loadBeacons().then(function(beacons) {
                console.log("Loaded " + beacons.length + " beacons");
            }, function(err) {
                console.log("Error loading beacons");
                console.log(err);
            });

            return me.reloadChat();
        });
   };

    this.login = function () {
        if (!me.termsAccepted) {
            alert("You must accept the terms before you can use this app");
            return
        }
        loginSvc.login().then(function () {
            console.log("Logged in");

            me.showAddPhoto = true;
            me.showOpenChatBtn = true;
            me.showAboutBtn = true;
            me.showLogin = false;
            me.showTerms = false;
            me.showMapControls = true;
            mapSvc.loadMap();

            var refreshInterval = 3000;

            function onErrorAlertLocationMustBeEnabled(err) {
                alert("Location sharing must be enabled when partying.  Please enable your location (your GPS).");
                console.log(err);
                onErrorCheckAgainLater();
            }

            function onErrorCheckAgainLater(err) {
                console.log("Location still not available");
                console.log(err);
                setTimeout(getPositionThenPopulateMap(onErrorCheckAgainLater), refreshInterval)
            }

            function getPositionThenPopulateMap(onError) {
                return function() {
                    posSvc.getPos().then(me.populateMap, onError);
                }
            }
            getPositionThenPopulateMap(onErrorAlertLocationMustBeEnabled)();
        })
    };






}]).run(["LoginSvc", function(loginSvc) {

    document.addEventListener('deviceready', function() {

    }, false);

}]);


// Credit: http://stackoverflow.com/questions/13675535/how-to-launch-apps-facebook-twitter-etc-from-mobile-browser-but-fall-back-to-h
// Handle facebook clicks
// tries to execute the uri:scheme
function goToUri(uri, href) {
    var start, end, elapsed;

    // start a timer
    start = new Date().getTime();

    // attempt to redirect to the uri:scheme
    // the lovely thing about javascript is that it's single threadded.
    // if this WORKS, it'll stutter for a split second, causing the timer to be off
    document.location = uri;

    // end timer
    end = new Date().getTime();

    elapsed = (end - start);

    // if there's no elapsed time, then the scheme didn't fire, and we head to the url.
    if (elapsed < 1) {
        document.location = href;
    }
}
(function () {

    $(document).on('click', 'a.intent', function (event) {
        var scheme = $(this).data('scheme');
        console.log("Calling goToUri for " + scheme);
        goToUri(scheme, $(this).attr('href'));
        event.preventDefault();
    });
})();

function reportPhoto(userId, addedOn) {
    console.log("Posting: " + userId)
    var post = {
        userId : userId,
        addedOn : addedOn
    };
    var url = "https://lambdaUrl/reportPhoto";
    $.ajax(url, {
        type: "POST",
        contentType: "application/json",
        async: false,
        data: JSON.stringify(post),
        success: function() {
            alert("Photo submitted for review, thanks!");
        }
    });
}
