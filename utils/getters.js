const funcs = require('./funcs');
const organizer = require('./organizer');

function getDate(timestamp) {

    let date = new Date(timestamp);

    return date.toDateString();
}

function getTime(timestamp) {
    let date = new Date(timestamp);

    return `${date.getHours()}:${date.getMinutes()}`;
}

async function getPostText(page) {

    let ret = await page.evaluate(() => {
        let more = document.querySelector('span[data-sigil="more"]');
        if(more != null) {
            more.click();
        }

        d = document.querySelector('._5rgt');
        if(d == null) {
            return '';
        }
        return d.innerText;
    });

    return ret;
}

async function getReacts(page) {
    let ret = {
        'reacts': 0,
        'likes': 0,
        'loves': 0,
        'cares': 0,
        'hahas': 0,
        'wows': 0,
        'sads': 0,
        'angrys': 0,
    };

    let bool = await page.evaluate(() => {
        let div = document.querySelector('._45m8');
        return div != null;
    });

    if(bool) {
        await page.waitForSelector('a._45m8');
        const [response] = await Promise.all([
            page.click('a._45m8'),
            page.waitForNavigation(),
        ]);
        await page.waitForSelector('._5p-6');

        let eval = await page.evaluate(() => {

            let obj = {
                'post': 0,
                'Like': 0,
                'Love': 0,
                'Care': 0,
                'Haha': 0,
                'Wow': 0,
                'Sad': 0,
                'Angry': 0,
            };

            let divbar = document.querySelector('._5p-6');
            let sections = divbar.querySelectorAll('span._10tn');
            sections.forEach((element) => {
                let al = element.querySelector('span');
                let ariaLabel = al.getAttribute('aria-label');

                ariaLabel = ariaLabel.split(' ');
                obj[ariaLabel[ariaLabel.length - 1]] = ariaLabel[0];
            });

            return obj;
        });

        ret['reacts'] = eval['post'];
        ret['likes'] = eval['Like'];
        ret['loves'] = eval['Love'];
        ret['cares'] = eval['Care'];
        ret['hahas'] = eval['Haha'];
        ret['wows'] = eval['Wow'];
        ret['sads'] = eval['Sad'];
        ret['angrys'] = eval['Angry'];

        return ret;
    }
}

async function getProfileId(profile_page) {
    let ret = await profile_page.evaluate(() => {
        let d = document.URL.split('/');

        return d[d.length - 2];
    });

    return ret;
}

async function getProfileName(profile_page) {
    let ret = await profile_page.evaluate(() => {
        return document.querySelector('._6j_c').innerText;
    });

    return ret.substring(0, ret.length - 7);
}

async function getPostId(page) {
    let ret = page.evaluate(() => {
        return window.location.pathname.split('/')[2];
    });

    return ret;
}

async function getPost(page, profile_id, profile_name, timestampobj) {
    let meta = {
        'page_link': '',
        'page_name': '',
        'page_id': '',
        'date': '',
        'time': '',
        'post': '',
        'reacts': 0,
        'like': 0,
        'love': 0,
        'care': 0,
        'haha': 0,
        'wow': 0,
        'sad': 0,
        'angry': 0,
        'comments': timestampobj.comments,
        'shares': timestampobj.shares,
        'post_link': '',
        'post_id': '',
        'post_directory': '',
    };
    
    meta.page_link = `https://www.facebook.com/${profile_id}`;
    meta.page_name = profile_name;
    meta.page_id = profile_id;
    meta.date = getDate(timestampobj.timestamp);
    meta.time = getTime(timestampobj.timestamp);
    meta.post = await getPostText(page);

    meta.post_link = await page.evaluate(() => {
        return document.location.href;
    });
    meta.post_id = await getPostId(page);
    meta.post_directory = funcs.getDirectoryFromDate(new Date(timestampobj.timestamp).toISOString());

    let reacts = await getReacts(page);
    meta.reacts = reacts.reacts;
    meta.like = reacts.likes;
    meta.love = reacts.loves;
    meta.care = reacts.cares;
    meta.haha = reacts.hahas;
    meta.wow = reacts.wows;
    meta.sad = reacts.sads;
    meta.angry = reacts.angrys;

    return meta;
}

async function getPostsFromLinks(page, links, profile_id, profile_name, rules) {

    let posts = {};

    for(let arr of links) {
        
        link = arr[0];
        
        if(!link.includes("/videos/") && !link.includes("/reaction/")) {
            await page.goto(link);
            console.log('   crawling post: ', link);
            let post = await getPost(page, profile_id, profile_name, arr[1]);
            posts[link] = post;
            
            console.log('   finished crawling');
            await page.waitForTimeout(1000);
        }
    }
    if(Object.entries(posts).length > 0) {
        organizer.writeJSON(posts, `./${rules.result}/${profile_id}/output.json`);
        console.log('JSON profile file has been saved.');
    }

    return posts;
}

async function getLinksFromProfile(page, rules) {
    if(rules.numberOfPosts <= 0) {
        if(isNaN(Date.parse(rules.startDate))) {
            console.log('check the rules...');
            return [];
        }
        if(isNaN(Date.parse(rules.endDate))) {
            return await getLinksFromProfileRespectDebut(page, rules.startDate, 0);
        }
        return await getLinksFromProfileRespectDates(page, rules.startDate, rules.endDate);
    }
    else {
        if(isNaN(Date.parse(rules.startDate))) {
            if(isNaN(Date.parse(rules.endDate))) {
                console.log('check the rules...');
                return [];
            }
            return await getLinksFromProfileRespectEnding(page, rules.endDate, rules.numberOfPosts);
        }
        else {
            if(isNaN(Date.parse(rules.endDate))) {
                return await getLinksFromProfileRespectDebut(page, rules.endDate, rules.numberOfPosts)
            }
            return await getLinksFromProfileRespectEverything(page, rules.startDate, rules.endDate, rules.numberOfPosts);
        }
    } 
}

async function getLinksFromProfileRespectDates(page, dateDeb, dateEnd) {
    let ret = [];
    let delay = 500;
    let repetitions = 20;

    let dateStartNumber = Date.parse(dateDeb);
    let dateEndNumber = Date.parse(dateEnd);

    let still = true;
    let whenToStop = 0;

    while(still && whenToStop < repetitions) {
        let leng = ret.length;
        let articles = await getCurrentArticles(page);

        for(let arr of Object.entries(articles)) {
            if(arr[1].timestamp < dateStartNumber) {
                return ret;
            }
            if(arr[1].timestamp < dateEndNumber) {
                ret.push(arr);
            }
        }

        if(leng == ret.length && ret.length != 0) {
            whenToStop++;
        }
        else {
            whenToStop = 0;
        }

        await scroll(page);
        await page.waitForTimeout(delay);
    }

    return ret;
}

async function getLinksFromProfileRespectEverything(page, dateDeb, dateEnd, numPosts) {
    let ret = [];

    // TODO: work on this

    return ret;
}

async function getLinksFromProfileRespectDebut(page, dateDeb, numPosts) {
    let ret = [];

    // TODO: work on this

    return ret;
}

async function getLinksFromProfileRespectEnding(page, dateEnd, numPosts) {
    let ret = [];

    // TODO: work on this

    return ret;
}

async function getCurrentArticles(page) {
    let links = await page.evaluate(() => {
        let d = document.querySelectorAll('article');
        let ret = {};

        for (ele of d) {
            let datastorestring = ele.getAttribute('data-store');

            if (datastorestring != null) {
                try {
                    let jsonds = JSON.parse(datastorestring);
                    let str = jsonds.linkdata;
                    if (str != null) {

                        let retobj = {
                            'timestamp': 0,
                            'shares': '0',
                            'comments': '0',
                        };

                        let jsonl = JSON.parse(str.substring(str.indexOf('{'), str.length));
                        let obj = Object.values(jsonl)[0];

                        let timest = obj.post_context.publish_time * 1000;
                        retobj.timestamp = timest;

                        let divsc = ele.querySelector('._1fnt');
                        let divs = divsc.querySelectorAll('._1j-c');

                        divs.forEach(element => {
                            let intext = element.innerText.split(' ');
                            if (element.innerText.includes('omment')) {
                                for(elemtemp of intext) {
                                    if(typeof elemtemp == 'string') {
                                        if(elemtemp[0] >= '0' && elemtemp[0] <= '9') {
                                            retobj.comments = elemtemp;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (element.innerText.includes('hare')) {
                                for(elemtemp of intext) {
                                    if(typeof elemtemp == 'string') {
                                        if(elemtemp[0] >= '0' && elemtemp[0] <= '9') {
                                            retobj.shares = elemtemp;
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                        ret[ele.querySelector('._52jc').querySelector('a').href] = retobj;
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
        }

        return ret;
    });

    return links;
}

async function scroll(page) {
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight*10);
    });
}

async function crawlProfile(page, link, rules) {
    await page.goto(`${link}/`);
    await page.waitForTimeout(3000);

    let error = await page.evaluate(() => {
        return document.querySelector('.error-container');
    });

    if(error != null) {
        return {
            'link': {},
        };
    }

    let pubButton = await page.evaluate(() => {
        pub = document.querySelectorAll('._6zf');

        for(let node of pub) {
            if(node.innerText == "Posts") {
                node.click();
                return 1;
            }
        }
        return null;
    });

    if(pubButton != null) {
        await page.waitForTimeout(3000);
    }

    let profile_id = await getProfileId(page);
    if(profile_id.length == 0) {
        return {};
    }
    
    let profile_name = await getProfileName(page);

    let links = await getLinksFromProfile(page, rules);

    let newLinks = {};
    for(let l of links) {
        newLinks[l[0]] = l[1];
    }

    links = [];
    for(const [key, value] of Object.entries(newLinks)) {
        links.push([key, value]);
    }

    let origin = link;
    origin = origin.split('/');
    origin = origin[origin.length - 1];

    await organizer.writeProfileDirectory2(origin, links, rules);

    let ret = await getPostsFromLinks(page, links, profile_id, profile_name, rules);

    return ret;
}

async function crawlProfilesFromList(page, rules) {

    let meta = {};

    for(let link of rules.links) {
        console.log('>crawling page: ', link);
        let profile = await crawlProfile(page, link, rules);
        meta[link] = profile;
        console.log('>finished crawling page');
        console.log();
        await page.waitForTimeout(5000);
    }

    return meta;
}

module.exports = {
    crawlProfilesFromList,
}