/*
    grunt compress:addUser --> generates addUser.zip for upload to lambda
 */
module.exports = function (grunt) {

    function zipIt(folder) {
        return {
            options : {
                archive : folder + ".zip",
                mode : "zip"
            },
            files : [
                {expand:true, cwd: folder, src : ["**/*"], dest : "/"}
            ]
        }
    }

    grunt.initConfig({
        compress: {
            addUser: zipIt("addUser"),
            ddpImageUploadPolicy: zipIt("ddpImageUploadPolicy"),
            ddpThumbnailIt: zipIt("ddpThumbnailIt"),
            ddpLoadPhotos: zipIt("ddpLoadPhotos")
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compress');

};