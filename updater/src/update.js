"use strict";
exports.__esModule = true;
var fs = require("fs");
var request = require('sync-request');
var download = require('download-file');
var unzip = require('unzip');
var Updater = /** @class */ (function () {
    function Updater() {
        this.updaterLogPath = './updater.log';
        this.root = './';
        this.ftpUrl = 'http://de-mucevolve02/files/devonfw/';
    }
    Updater.prototype.update = function () {
        var currentVersion = "";
        var latestVersion = "";
        var currentDatePatch = "";
        //Get version of Devon
        try {
            var contents = fs.readFileSync('./conf/settings.json', 'utf8');
            currentVersion = JSON.parse(contents)["version"];
        }
        catch (e) {
            console.log(e);
        }
        //Check if updater.log exists
        if (!fs.existsSync(this.updaterLogPath)) {
            //Create a new empty file
            fs.writeFileSync(this.updaterLogPath, "");
        }
        //Check if there is a new version
        latestVersion = this.updateExists(currentVersion);
        //Read from updater.log
        try {
            currentDatePatch = fs.readFileSync(this.updaterLogPath, 'utf8');
        }
        catch (e) {
            console.log(e);
        }
        if (currentDatePatch < latestVersion || currentDatePatch == "") {
            //Download, unzip and delete update
            this.getLastPatch(latestVersion, currentVersion);
            this.updateLog(this.updaterLogPath, latestVersion);
        }
        else if (currentDatePatch === latestVersion) {
            console.log("Patch up to date.");
        }
    };
    Updater.prototype.updateExists = function (currentVersion) {
        var url = this.ftpUrl + currentVersion + '/';
        var reg = '>win_accumulative_patch_';
        var latestVersion = "";
        var res = request('GET', url);
        var body = res.getBody('utf8');
        while (body.length != 0) {
            var fromMatch = body.search(reg);
            var newBody = body.substr(fromMatch, body.length);
            //Extract the version with a date format (length = 8)
            var versionNumber = newBody.substr(reg.length, 8);
            if (latestVersion.length == 0 || latestVersion < versionNumber) {
                latestVersion = versionNumber;
            }
            body = newBody.substr(reg.length);
        }
        return latestVersion;
    };
    Updater.prototype.getLastPatch = function (lastestPatchURL, currentVersion) {
        var fileName = 'win_accumulative_patch_' + lastestPatchURL + '.zip';
        var url = this.ftpUrl + currentVersion + '/' + fileName;
        var options = {
            directory: this.root,
            filename: fileName
        };
        console.log("Downloading", url);
        download(url, options, function (err) {
            if (err)
                throw err;
            //Unzip on Devonfw root. Then delete the .zip
            try {
                fs.createReadStream('./' + fileName).pipe(unzip.Extract({ path: './' }));
                fs.unlinkSync('./' + fileName);
                console.log("Latest patch applied.");
            }
            catch (e) {
                console.log(e);
            }
        });
    };
    Updater.prototype.updateLog = function (updaterLogPath, latestVersion) {
        try {
            fs.writeFileSync(updaterLogPath, latestVersion);
        }
        catch (e) {
            console.log(e);
        }
    };
    return Updater;
}());
var updater = new Updater();
updater.update();
