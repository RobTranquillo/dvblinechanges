/*
 * DVB get Line Changes
 * Version:  1.0
 * Date: 03. Okt 2014
 * Author: rob.tranquillo@gmx.de
 * For the OK-Lab Dresden (www.codefor.de/dresden) group and www.offenesdresden.de
 *
 * 
 * function get all changes of the timetable of the Dresdner Verkehrsbetriebe (dvb) and return them as json object
 *  
 * needed: npm install request cheerio
 *
 * 
 * No caching atm, every call of the function will request the website.
 * No time information about the changes, only the day will be returned.
 * Returns UnixTimestamp in Seconds
 */
//config:
var changes_page = 'http://www.dvb.de/de/Fahrplan/Linienaenderungen'; 
var start_object = '#fa_form_results_dvb div '; //jQuery selctor for the element where the changes information begin 

//depencies
var request = require('request');
var cheerio = require('cheerio');

//start requesting the webpage
request( changes_page , function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var linechanges = changobjects( html );
        console.log( linechanges );
    }
});







/*
 * run through all Objects under "start_object" and return an object
 * that contains the id from website, direct link to the change, 
 * the named reason, effected lines and effected time period
 */
function changobjects( html )
{
    var $ = cheerio.load(html);
    var objects = new Array();
    
    //get all the change_ids
    $( start_object ).each(function(i, element){
        change_id = element.attribs.id;
        objects[i] = new Object();
        objects[i].change_id = change_id;
    });
    
    //get effected lines
    $( start_object + ' h2 ' ).each(function(i, element){
        lines = $(element).text();
        lines = lines.replace('\r','','g')
                .replace('\n','','g')
                .replace('\t','','g')
                .replace('NEU!','','g')
                .replace('DVB','', 'g')
                .replace('Linien','','g')
                .replace('Linie','','g')
                .trim();
        lines = lines.split(',');
                
        objects[i].lines = lines;
    });
    
    //get all the change_details
    $(start_object + ' .detail ').each(function(i,element) {
        var detail = $(element).text();
        detail = detail.replace('\r','','g')
                .replace('\n','','g')
                .replace('\t','','g')
                .trim();
        objects[i].detail = detail;
        objects[i].duration = getDuration( detail ) ;
    });
    
    
    //get direct links to the change
    $( start_object + ' li a ' ).each(function(i, element){
        objects[i].link = changes_page + scrapeLink( $(element).parent().html() );
        objects[i].reason = $(element).text();
    });
 return objects;
}


/*
 * try to get timestamps from details
 * returns start & end time if possible, else false
 * 'ab Mo, 15.09.2014, 07:00 Uhr bis auf Weiteres'
 * { start: 1410764400 , end : false } 
 */
function getDuration(detail)
{
    var date = Array();
    var re = /[0-9]{2}\.[0-9]{2}\.[0-9]{4}/g; //find one datetime over the hole line
    
    var start_date = end_date = false;
    while (match = re.exec(detail)) {
        if(start_date == false) {
            var arr = match[0].split('.');
            start_date = new Date(arr[2],arr[1]-1,arr[0], 7,0,0).getTime();
            start_date = start_date / 1000; //milliseconds to seconds
        }
        else {
            var arr = match[0].split('.');
            end_date = new Date(arr[2],arr[1]-1,arr[0], 18,0,0).getTime();
            end_date = end_date / 1000; //milliseconds to seconds
        }
    }

    return { 'start' : start_date , 'end' : end_date };
}


//does how its called
function scrapeLink(html)
{    
    var link_start = html.indexOf('href=')+6;
    var link_length = html.indexOf('>', link_start)-1 - link_start;
    return html.substr( link_start , link_length );
}
