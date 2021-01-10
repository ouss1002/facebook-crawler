// This file builds the excel file from the ./results folder

const fs = require('fs');
const json2xls = require('json2xls');

function getJSON(path) {

    if (!fs.existsSync(path)) {
        return {};
    }

    let data = fs.readFileSync(path);
    
    if(data == null) {
        return {};
    }

    let json = JSON.parse(data);

    return json;
}

function normalizeJSON(jsonObj) {
    let ret = {};

    if(Object.entries(jsonObj).length == 0) {
        return ret;
    }

    let firstPost = Object.values(jsonObj)[0];

    let page_id = firstPost['page_id'];
    let page_link = firstPost['page_link'];
    let page_name = firstPost['page_name'];


    ret['page'] = page_id;
    ret['posts'] = [];

    for(let arr of Object.entries(jsonObj)) {
        let postObj = {};
        let value = arr[1];

        let strTime = value['time'];
        strTime = strTime.split(':');
        if(strTime[0].length == 1) {
            strTime[0] = `0${strTime[0]}`;
        }
        if(strTime[1].length == 1) {
            strTime[1] = `0${strTime[1]}`;
        }
        newTime = strTime.join(':');

        postObj['page_id'] = `=HYPERLINK("${page_link}", "${page_id}")`;
        postObj['page_name'] = page_name;
        postObj['date'] = value['date'];
        postObj['time'] = newTime;
        postObj['post'] = value['post'];
        postObj['reacts'] = value['reacts'];
        postObj['like'] = value['like'];
        postObj['love'] = value['love'];
        postObj['care'] = value['care'];
        postObj['haha'] = value['haha'];
        postObj['wow'] = value['wow'];
        postObj['sad'] = value['sad'];
        postObj['angry'] = value['angry'];
        postObj['comments'] = parseInt(value['comments']);
        postObj['shares'] = parseInt(value['shares']);
        postObj['post_link'] = `=HYPERLINK("${value['post_link']}", "link")`;

        ret['posts'].push(postObj);
    }

    return ret;
}

function makeExcelFromJSON(json) {
    
    let arr = Object.entries(json);

    if(arr.length == 0) {
        return ;
    }

    let postList = arr[1][1];

    let xls = json2xls(postList);

    fs.writeFileSync('data.xlsx', xls, 'binary');
}

function excelize() {
    // process.chdir('../');
    process.chdir('result/');

    fs.readdirSync('./').forEach((dir) => {

        if(fs.lstatSync(dir).isDirectory()) {
            process.chdir(dir);
            console.log('Processing directory: ', process.cwd());
    
            let jsonObj = getJSON('./output.json');

            if(Object.entries(jsonObj).length == 0) {
                console.log('Nothing to excelize in directory: ', dir);
            }
            else {
                let norm = normalizeJSON(jsonObj);
                makeExcelFromJSON(norm);
                console.log('Finished writing excel file');
            }      
    
            process.chdir('../');
        }
    });

}

excelize();