import * as fs from "fs";
var request = require('sync-request');
var download = require('download-file');
var unzip = require('unzip');

class Updater {
    private updaterLogPath: string;
    private root: string;
    private ftpUrl: string;

    constructor() {
        this.updaterLogPath = './updater.log';
        this.root = './';
        this.ftpUrl = 'http://de-mucevolve02/files/devonfw/';
    }

    public update() {
        var currentVersion: string = "";
        var latestVersion: string = "";
        var currentDatePatch: string = "";

        //Get version of Devon
        try {
            var contents = fs.readFileSync('./conf/settings.json', 'utf8');
            currentVersion = JSON.parse(contents)["version"];
        }
        catch(e){
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
        try{
            currentDatePatch = fs.readFileSync(this.updaterLogPath, 'utf8');
        }
        catch(e){
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
    }

    private updateExists(currentVersion: string): string {
        var url = this.ftpUrl + currentVersion + '/';
        var reg: string = '>win_accumulative_patch_';
        var latestVersion: string = "";

        var res = request('GET', url);
        var body = res.getBody('utf8');

        while (body.length != 0) {
            var fromMatch: number = body.search(reg);
            var newBody = body.substr(fromMatch, body.length);

            //Extract the version with a date format (length = 8)
            var versionNumber: string = newBody.substr(reg.length, 8);

            if (latestVersion.length == 0 || latestVersion < versionNumber) {
                latestVersion = versionNumber;
            }
            body = newBody.substr(reg.length);
        }

        return latestVersion;
    }

    private getLastPatch(lastestPatchURL: string, currentVersion: string): void {
        var fileName = 'win_accumulative_patch_' + lastestPatchURL + '.zip';
        var url = this.ftpUrl + currentVersion + '/' + fileName;

        var options = {
            directory: this.root,
            filename: fileName
        }

        console.log("Downloading", url);

        download(url, options, function (err: Error) {
            if (err) throw err;
            //Unzip on Devonfw root. Then delete the .zip
            try {
                console.log("Unzipping", fileName);
                fs.createReadStream('./' + fileName).pipe(unzip.Extract({ path: './' }));
                fs.unlinkSync('./' + fileName);
                console.log("Latest patch applied.");
            }
            catch (e) {
                console.log(e);
            }
        });
    }

    private updateLog(updaterLogPath: string, latestVersion: string): void {
        try{
            fs.writeFileSync(updaterLogPath, latestVersion);
        }
        catch(e){
            console.log(e);
        }
    }
}

var updater = new Updater();

updater.update();