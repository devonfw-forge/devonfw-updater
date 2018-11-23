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

    /**
    * This function get your Devonfw version and, if there are new updates, then it downloads and install them.
    * @param
    * @returns
    */
    public update(): void {
        let currentVersion: string = "";
        let latestVersion: string = "";
        let currentDatePatch: string = "";

        //Get version of Devon
        try {
            let contents = fs.readFileSync('./conf/settings.json', 'utf8');
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
        latestVersion = this.getLatestVersion(currentVersion);

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
    }

    /**
    * Look If there is a new update in ftp server 
    * @param currentVersion The version of Devonfw 
    * @returns returns last package version in ftp server
    */
    private getLatestVersion(currentVersion: string): string {
        let url = this.ftpUrl + currentVersion + '/';
        let reg: string = '>win_accumulative_patch_';
        let latestVersion: string = "";

        let res = request('GET', url);
        let body = res.getBody('utf8');

        while (body.length != 0) {
            let fromMatch: number = body.search(reg);
            let newBody = body.substr(fromMatch, body.length);

            //Extract the version with a date format (length = 8)
            let versionNumber: string = newBody.substr(reg.length, 8);

            if (latestVersion.length == 0 || latestVersion < versionNumber) {
                latestVersion = versionNumber;
            }
            body = newBody.substr(reg.length);
        }

        return latestVersion;
    }

    /**
    * Download new patch, unzip it and delete it. 
    * @param lastestPatchURL URL where the file is in ftp server
    * @param currentVersion The version of Devonfw 
    * @returns
    */
    private getLastPatch(lastestPatchURL: string, currentVersion: string): void {
        let fileName = 'win_accumulative_patch_' + lastestPatchURL + '.zip';
        let url = this.ftpUrl + currentVersion + '/' + fileName;

        let options = {
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

    /**
    * Update file updater.log whith date of las patch applied
    * @param updaterLogPath Path where updater.log is
    * @param latestVersion Las date of patch applied
    * @returns
    */
    private updateLog(updaterLogPath: string, latestVersion: string): void {
        try {
            fs.writeFileSync(updaterLogPath, latestVersion);
        }
        catch (e) {
            console.log(e);
        }
    }
}

let updater = new Updater();
updater.update();