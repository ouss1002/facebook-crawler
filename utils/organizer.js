const fs = require('fs');
const downloader = require('./downloader');

async function writeProfileDirectory(origin, links, rules) {

    let org = `${rules.result}/${origin}/`;

    for(let link of links) {
        let id = link.split('/');
        id = id[id.length - 2];

        fs.mkdir('./' + org + id, { recursive: true }, (err) => {
            if(err) {
                console.log(err);
            }
        });
    }
}

async function writeProfileDirectory2(origin, links, rules) {

    let org = `${rules.result}/${origin}/`;

    fs.mkdir('./' + org, { recursive: true }, (err) => {
        if(err) {
            console.log(err);
        }
    });
}

async function downloadMediaFromPost(post, rules) {
    let counter = 1;

    for(let arr of Object.entries(post.media)) {
        if(arr[1] == 'image') {
            await downloader.downloadRetry(arr[0], `.${rules.result}/${post.profile_id}/${post.post_id}/${counter}.jpg`, 5);
        }
        else if(arr[1] == 'video') {
            await downloader.downloadRetry(arr[0], `.${rules.result}/${post.profile_id}/${post.post_id}/${counter}.mp4`, 5);
        }
        else {
            console.log('ERROR: check file type...');
        }

        counter++;
    }
}

async function downloadMediaFromPost2(post, rules) {
    let counter = 1;

    let org = `${rules.result}/${post.profile_id}/${post.post_directory}`;

    fs.mkdir('./' + org, { recursive: true }, (err) => {
        if(err) {
            console.log(err);
        }
    });

    for(let arr of Object.entries(post.media)) {
        if(arr[1] == 'image') {
            await downloader.downloadRetry(arr[0], `.${rules.result}/${post.profile_id}/${post.post_directory}/${counter}.jpg`, 5);
        }
        else if(arr[1] == 'video') {
            await downloader.downloadRetry(arr[0], `.${rules.result}/${post.profile_id}/${post.post_directory}/${counter}.mp4`, 5);
        }
        else {
            console.log('ERROR: check file type...');
        }

        counter++;
    }
}

function writeJSON(obj, path) {
    jsonContent = JSON.stringify(obj);

    fs.writeFile(path, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log('An error occured while writing JSON Object to File.');
            return console.log(err);
        }
    });
}

module.exports = {
    writeProfileDirectory2,
    downloadMediaFromPost2,
    writeJSON,
}