dvblinechanges
==============

DVB Line Changes - get all timetable changes from Dresdner Verkehrsbetriebe via json


Author: rob.tranquillo
For the OK-Lab Dresden (www.codefor.de/dresden) group and www.offenesdresden.de


Install

needed modules "request" & "cheerio"
install steps:  npm install request cheerio


About the programm:

The first request, reads the DVB page, scrapes the line changes and will return it  as object.

''Object: linechanges
''Params
  # change_id : The DVB internal id for that single change.
  # link : The direct link for that single change.
  # detail : short text about that change. Mostly the time period.
  # reason : The reason for that disturbance.
  # lines : Array of the affected transportation lines.
  # duration : Start and end of the disturbance in unix timestamp seconds.

Functionally advises:
 * No caching atm, every call of the function will request the website.
 * No time information about the changes, only the effected days will be returned.
 * Returns UnixTimestamp in seconds not in miliseconds.
 
