const { F1TelemetryClient, constants } = require("@racehub-io/f1-telemetry-client");
const { PACKETS } = constants;
const fetch = require("node-fetch");

const { getData } = require("./localData.js")
let localData = {};

(async function() {
    localData = (await getData());
    let ids = [];
    localData.forEach(driver => {
        console.log(driver.customTeam);
        if (driver?.customTeam?.id && ids.indexOf(driver?.customTeam?.id) === -1) {
            ids.push(driver.customTeam.id)
        }
    })
    console.log("id", ids);

    if (ids.length) {
        let teamData = await fetch(`https://data.slmn.gg/things/${ids.join(",")}`).then(res => res.json());

        localData.forEach(driver => {
            if (driver?.customTeam?.id) {
                driver._slmnggTeam = teamData.find(thing => thing.id === `rec${driver.customTeam.id}`);
                driver._slmnggTheme = teamData.find(thing => thing.__tableName === 'Themes' && thing.team.includes(`rec${driver.customTeam.id}`))

                if (driver._slmnggTeam && driver._slmnggTheme) driver.team = {
                    name: driver._slmnggTeam.name,
                    code: driver._slmnggTeam.code,
                    color: driver._slmnggTheme.color_theme,
                    logo: driver._slmnggTheme.small_logo
                }
            }
        })
    }

    localData = localData.map(driver => {
        // console.log(driver.teamID);
        driver.team = driver.team?.name ? driver.team : constants.TEAMS[driver.teamID];
        return driver;
    });
})();


const OBSWebSocket = require("obs-websocket-js");
const obs = new OBSWebSocket();
obs.connect({
    address: "192.168.0.24:4444"
}).then(() => {
    console.log("OBS connected!")
}).catch(e => {
    console.error("obs websocket error", e)
});

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../www')));

app.get("/settings/toggle/:id", async (req, res) => {
    settings[req.params.id] = !settings[req.params.id];
    console.log(settings, req.params);
    io.sockets.emit("settings", settings);
    res.send("poggers");
})
app.get("/settings/set/:id/:set", async (req, res) => {
    settings[req.params.id] = (req.params.set === "true");
    console.log(settings, req.params);
    io.sockets.emit("settings", settings);
    res.send("poggers");
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});

const trackCompounds = [
    { name: 'Melbourne', compounds: [4,3,2] },
    { name: 'Paul Ricard', compounds: [4,3,2] },
    { name: 'Shanghai', compounds: [4,3,2] },
    { name: 'Sakhir (Bahrain)', compounds: [4,3,2] },
    { name: 'Catalunya', compounds: [3,2,1] },
    { name: 'Monaco', compounds: [5,4,3] },
    { name: 'Montreal', compounds: [5,4,3] },
    { name: 'Silverstone', compounds: [3,2,1] },
    { name: 'Hockenheim', compounds: [] },
    { name: 'Hungaroring', compounds: [4,3,2] },
    { name: 'Spa', compounds: [4,3,2] },
    { name: 'Monza', compounds: [4,3,2] },
    { name: 'Singapore', compounds: [5,4,3] },
    { name: 'Suzuka', compounds: [3,2,1] },
    // { name: 'Abu Dhabi', compounds: [4,3,2] },
    { name: 'Abu Dhabi', compounds: [5,4,3] },
    { name: 'Texas', compounds: [4,3,2] },
    { name: 'Brazil', compounds: [4,3,2] },
    { name: 'Austria', compounds: [5,4,3] },
    { name: 'Sochi', compounds: [5,4,3] },
    { name: 'Mexico', compounds: [4,3,2] },
    { name: 'Baku (Azerbaijan)', compounds: [5,4,3] },
    { name: 'Sakhir Short', compounds: [] },
    { name: 'Silverstone Short', compounds: [] },
    { name: 'Texas Short', compounds: [] },
    { name: 'Suzuka Short', compounds: [] },
    { name: 'Hanoi', compounds: [] },
    { name: 'Zandvoort', compounds: [3,2,1] },
    { name: 'Imola', compounds: [4,3,2] },
    { name: 'Portimao', compounds: [3,2,1] },
    { name: 'Jeddah', compounds: [4,3,2] },
];

function getTrackTyres(tyreID) {
    if (!cache["session"]?.m_trackId) return tyreID;
    let localTrack = trackCompounds[cache["session"].m_trackId];

    const cTyres = {
        16: 5,
        17: 4,
        18: 3,
        19: 2,
        20: 1
    }

    if (localTrack?.compounds?.length && tyreID >= 16) {
        // 16: C5 -> 20: C1
        // map to soft/medium/hard

        // compounds[0] is soft, see if C3/C4 etc match it
        if (localTrack.compounds[0] === cTyres[tyreID]) return 12;
        if (localTrack.compounds[1] === cTyres[tyreID]) return 13;
        if (localTrack.compounds[2] === cTyres[tyreID]) return 14;
    }

    return tyreID;
}

function plural(number, text, plu) {
    return `${number} ${text}${number === 1 ? '' : plu}`
}

const settings = {
    leaderboardIcons: true,
    alerts: true
};

const purple = {
    sectors: [0, 0, 0]
}

io.on("connection", (socket) => {
    console.log("New socket connection");

    socket.emit("new-alert", {
        duration: 5000,
        title: "F1 Data system",
        description: "by Freya & SLMN",
        stripe: "lime"
    });
    socket.emit("settings", settings);

    socket.on("subscribe", (room) => {
        socket.join(room);
    })

    socket.on("setting", ({ name, value }) => {
        settings[name] = value;
        io.sockets.emit("settings", settings);
    })
});

function persist(name, index, duration) {
    if (cache[`timeout-${name}-${index}`]) clearTimeout(cache[`timeout-${name}-${index}`]);

    cache[`persist-${name}-${index}`] = true;
    cache[`timeout-${name}-${index}`] = setTimeout(() => {
        cache[`persist-${name}-${index}`] = false;
    }, duration * 1.25);
}

function sendAlert(alert) {
    io.sockets.emit("new-alert", alert);
}
// setInterval(() => {
//     sendAlert({
//         title: "Test alert",
//         description: "testing these nuts",
//         duration: 2500
//     })
// }, 2000);

const client = new F1TelemetryClient();

client.on(PACKETS.event, event => {
    if (event.m_eventStringCode === "SPTP") {
        let driver = getDriver(event.m_eventDetails.vehicleIdx);
        event.m_eventDetails.driver = driver;
        if (driver?.m_raceNumber) event.m_eventDetails.driver.name = localNumber(driver.m_raceNumber, driver?.m_teamId);

        io.to("speedTrap").emit("speedTrap", event.m_eventDetails);
        if (event.m_eventDetails.overallFastestInSession) {
            sendAlert({
                title: "Speed trap - fastest in session",
                description: `Driver: ${driver?.name || ''} @ ${(event.m_eventDetails.speed / 1.60934).toFixed(1)}mph`,
                stripe: "dodgerblue",
                only: "speed-trap-fastest"
            })
        }
        // if (event.m_eventDetails.driverFastestInSession) {
        //     sendAlert({
        //         title: "Speed trap - fastest for driver",
        //         description: `Speed: ${event.m_eventDetails.speed.toFixed(1)}kph`,
        //         stripe: "dodgerblue"
        //     })
        // }
        return;
    }

    if (!["SPTP", "PENA"].includes(event.m_eventStringCode)) console.log(event.m_eventStringCode, event.m_eventDetails);

    if (event.m_eventStringCode === "SSTA") {
        settings["leaderboardIcons"] = true;
        settings["podium"] = false;

        // if(cache["session"]?.m_sessionType) console.log("SSTA Session", cache["session"].m_sessionType.short)
        // if (cache["session"]?.m_sessionType && ["ShortQ", "OneShotQ"].includes(cache["session"].m_sessionType.short)) {
        //     settings["qualifying"] = true;
        //     settings["alerts"] = false;
        //     settings["spectatorSectors"] = true;
        // }

        io.sockets.emit("settings", settings);
    }

    if (event.m_eventStringCode === "SEND") {
        settings["leaderboardIcons"] = false;
        settings["qualifying"] = false;
        settings["alerts"] = false;
        settings["spectatorSectors"] = false;


        if (cache["session"]?.m_sessionType.short === "R") {
            setTimeout(() => {
                settings["podium"] = true;
                io.sockets.emit("settings", settings);
            }, 20 * 1000);
        }

        io.sockets.emit("settings", settings);
    }

    if (event.m_eventStringCode === "PENA") {
        let data = {
            penalty: constants.PENALTIES[event.m_eventDetails.penaltyType],
            infringement: constants.INFRINGEMENTS[event.m_eventDetails.infringementType],
            seconds: event.m_eventDetails.time
        };
        let driver = getDriver(event.m_eventDetails.vehicleIdx);
        // console.log(data);

        let other;
        if (event.m_eventDetails.otherVehicleIdx !== 255) {
            other = getDriver(event.m_eventDetails.otherVehicleIdx);
            if (other && other.m_raceNumber) {
                other.name = localNumber(other.m_raceNumber, other.m_teamId)
                data.infringement += ` (with ${other.name})`
            }
        }

        if (data.penalty === "Warning" && driver) {
            sendAlert({
                title: `Warning ${driver ? 'for ' + localNumber(driver.m_raceNumber, driver.m_teamId) : ''}`,
                description: data.infringement,
                stripe: "yellow"
            })
            persist("warning", event.m_eventDetails.vehicleIdx, 8000)
            if (!cache[`counts-${event.m_eventDetails.vehicleIdx}-warnings`]) cache[`counts-${event.m_eventDetails.vehicleIdx}-warnings`] = 0;
            cache[`counts-${event.m_eventDetails.vehicleIdx}-warnings`]++;
        } else if (data.penalty === "Drive through") {
            sendAlert({
                title: `Drive through penalty ${driver ? 'for ' + localNumber(driver.m_raceNumber, driver.m_teamId) : ''}`,
                description: data.infringement,
                stripe: "red",
                duration: 15000
            })
            persist("penalty", event.m_eventDetails.vehicleIdx, 15000)
            if (!cache[`counts-${event.m_eventDetails.vehicleIdx}-warning`]) cache[`counts-${event.m_eventDetails.vehicleIdx}-warning`] = 0;
            cache[`counts-${event.m_eventDetails.vehicleIdx}-warning`]++;
        } else if (data.penalty === "Time penalty") {
            sendAlert({
                title: `${data.seconds}s penalty ${driver ? 'for ' + localNumber(driver.m_raceNumber, driver.m_teamId) : ''}`,
                description: data.infringement,
                stripe: "red",
                duration: 15000
            })
            persist("penalty", event.m_eventDetails.vehicleIdx, 15000)
            if (!cache[`counts-${event.m_eventDetails.vehicleIdx}-penalty`]) {
                cache[`counts-${event.m_eventDetails.vehicleIdx}-penalty`] = 0;
                cache[`counts-${event.m_eventDetails.vehicleIdx}-penaltytime`] = 0;
            }
            cache[`counts-${event.m_eventDetails.vehicleIdx}-penalty`]++;
            cache[`counts-${event.m_eventDetails.vehicleIdx}-penaltytime`] += data.seconds;
        } else if (data.penalty === "Disqualified" && driver) {
            sendAlert({
                major: "Disqualified",
                title: `${driver ? localNumber(driver.m_raceNumber, driver.m_teamId) : ''} disqualified`,
                description: data.infringement,
                stripe: "red",
                duration: 30000
            })
        } else if (data.penalty === "Retired" && driver) {
            sendAlert({
                major: "Retired",
                title: `${driver ? localNumber(driver.m_raceNumber, driver.m_teamId) : ''} retired from the race`,
                description: data.infringement,
                stripe: "white",
                duration: 30000
            })
        } else if (driver && data.penalty !== "This lap invalidated without reason") {
            sendAlert({
                title: `${data.penalty} ${driver ? 'for ' + localNumber(driver.m_raceNumber, driver.m_teamId) : ''}`,
                description: data.infringement,
                stripe: "red",
                duration: 10000
            })
            persist("penalty", event.m_eventDetails.vehicleIdx, 12000)
        }
    }
})

client.on(PACKETS.sessionHistory, (history) => {
    delete history.m_header.m_sessionUID;
    cache["sessionHistory"][history.m_carIdx] = history;


    if (history.m_lapHistoryData[history.m_bestLapTimeLapNum - 1]) cache[`car-bestlap-time-${history.m_carIdx}`] = history.m_lapHistoryData[history.m_bestLapTimeLapNum - 1].m_lapTimeInMS;

    let completedLaps = history.m_lapHistoryData.filter(l => l.m_sector3TimeInMS);

    if (cache[`car-hold-sector-data-${history.m_carIdx}`] && completedLaps.length >= 2) {
        completedLaps = completedLaps.slice(0, -1);
    }

    if (!cache[`car-bestlap-sector-${history.m_carIdx}`]) {
        cache[`car-bestlap-sector-${history.m_carIdx}`] = [];
        cache[`car-best-sector-${history.m_carIdx}`] = [];
    }
    [1,2,3].forEach(sectorNum => {
        let bestSectorLapNum = history[`m_bestSector${sectorNum}LapNum`];
        let bestSectorTime = history.m_lapHistoryData[bestSectorLapNum - 1]?.[`m_sector${sectorNum}TimeInMS`];
        // console.log({sectorNum, bestSectorLapNum, fromHistory:history.m_lapHistoryData[bestSectorLapNum - 1]})

        if (bestSectorTime && bestSectorTime > 10000 && (purple.sectors[sectorNum - 1] === 0) || purple.sectors[sectorNum - 1] > bestSectorTime) {
            purple.sectors[sectorNum - 1] = bestSectorTime;
            console.log(`Purple sector updated ${sectorNum} ${bestSectorTime}`)
            console.log("current purple sectors: ", [...purple.sectors].map(p => msToHMS(p)));
        }

        // best sector
        if (completedLaps[bestSectorLapNum - 1]) {
            // set it
            cache[`car-best-sector-${history.m_carIdx}`][sectorNum - 1] = bestSectorTime;
        } else {
            // fastest is the current lap or something
            let fastestLap = completedLaps.sort((a, b) => a[`m_sector${sectorNum}TimeInMS`] - b[`m_sector${sectorNum}TimeInMS`])
            // console.log(history.m_lapHistoryData)
            if (fastestLap[0]) cache[`car-best-sector-${history.m_carIdx}`][sectorNum - 1] = fastestLap[0][`m_sector${sectorNum}TimeInMS`];
        }

        // best lap
        let bestLapNum = history.m_bestLapTimeLapNum;
        if (completedLaps[bestLapNum - 1]) {
            cache[`car-bestlap-sector-${history.m_carIdx}`][sectorNum - 1] = history.m_lapHistoryData[bestLapNum - 1][`m_sector${sectorNum}TimeInMS`];
        } else {
            let fastestLap = completedLaps.sort((a, b) => a.m_lapTimeInMS - b.m_lapTimeInMS);
            // console.log(fastestLap)
            if (fastestLap[0]) cache[`car-bestlap-sector-${history.m_carIdx}`][sectorNum - 1] = fastestLap[0][`m_sector${sectorNum}TimeInMS`];
        }
    })

    // TODO: will this get messed up with the slicing? maybe...
    let startedLaps = history.m_lapHistoryData.filter(l => l.m_sector1TimeInMS);
    let currentLap = startedLaps[startedLaps.length - 1];
    if (currentLap?.m_lapTimeInMS) {
        cache[`car-current-lap-${history.m_carIdx}`] = { }
    } else {
        cache[`car-current-lap-${history.m_carIdx}`] = currentLap
    }
    cache[`car-latest-lap-${history.m_carIdx}`] = currentLap

    let comparisonLaps = history.m_lapHistoryData.filter(lap => {
        let isComplete = (lap.m_sector1TimeInMS && lap.m_sector2TimeInMS && lap.m_sector3TimeInMS);
        return isComplete
    });



    if (comparisonLaps.length >= 2) {
        let comparisonLap = comparisonLaps.slice(0, -1).sort((a, b) => a.m_lapTimeInMS - b.m_lapTimeInMS);
        if (comparisonLap?.length) cache[`car-comparison-lap-${history.m_carIdx}`] = comparisonLap[0].m_lapTimeInMS;
        // if (history.m_carIdx === 13) {
        //     console.log("-")
        //     console.log(comparisonLaps.map((l, i) => [i+1,cache[`car-comparison-lap-${history.m_carIdx}`] === l.m_lapTimeInMS ? " >" : "  " , l.m_lapTimeInMS, l.m_sector1TimeInMS, l.m_sector3TimeInMS].join('\t')).join('\n'))
        // }
        // if (history.m_carIdx === 13) {
        //     console.log("-")
        //     console.log(JSON.stringify(cache[`car-comparison-lap-${history.m_carIdx}`]))
        // }
    }
    /*
    *  For comparing against just finished laps
    *  Must be a complete lap (all 3 sectors have times)
    *  Must not be the current or last lap (n-2?)
    * */

    // if (history.m_lapHistoryData[history.m_bestSector1LapNum - 1]) cache[`car-bestlap-sector-${history.m_carIdx}`][0] = history.m_lapHistoryData[history.m_bestLapTimeLapNum - 1].m_sector1TimeInMS;
    // if (history.m_lapHistoryData[history.m_bestSector2LapNum - 1]) cache[`car-bestlap-sector-${history.m_carIdx}`][1] = history.m_lapHistoryData[history.m_bestSector2LapNum - 1].m_sector2TimeInMS;
    // if (history.m_lapHistoryData[history.m_bestSector3LapNum - 1]) cache[`car-bestlap-sector-${history.m_carIdx}`][2] = history.m_lapHistoryData[history.m_bestSector3LapNum - 1].m_sector3TimeInMS;


    // cache[`car-bestlap-time-${i}`];
    // cache[`car-bestlap-sector-${i}`];
})

client.on(PACKETS.lobbyInfo, (lobbyInfo) => {
    delete lobbyInfo.m_header.m_sessionUID;
    cache["lobbyInfo"] = lobbyInfo;
})
client.on(PACKETS.finalClassification, (data) => {
    delete data.m_header.m_sessionUID;
    cache["finalClassification"] = data;
})

client.on(PACKETS.session, (data) => {
    if (cache["session"]?.m_sessionType !== constants.SESSION_TYPES[data.m_sessionType]) {
        console.warn("Emptying session data");
        resetCache();
        // sendAlert({
        //     title: `New session started, wiping data`,
        //     description: constants.SESSION_TYPES[data.m_sessionType]?.long,
        //     stripe: "white"
        // });
    }
    delete data.m_header.m_sessionUID;
    cache["session"] = {
        ...data,
        m_weather: constants.WEATHER[data.m_weather],
        m_safetyCarStatus: constants.SAFETY_CAR_STATUSES[data.m_safetyCarStatus],
        m_sessionType: constants.SESSION_TYPES[data.m_sessionType],
        m_trackId: data.m_trackId
    };

    //'m_header',
    //   'm_weather',
    //   'm_trackTemperature',
    //   'm_airTemperature',
    //   'm_totalLaps',
    //   'm_trackLength',
    //   'm_sessionType',
    //   'm_trackId',
    //   'm_formula',
    //   'm_sessionTimeLeft',
    //   'm_sessionDuration',
    //   'm_pitSpeedLimit',
    //   'm_gamePaused',
    //   'm_isSpectating',
    //   'm_spectatorCarIndex',
    //   'm_sliProNativeSupport',
    //   'm_numMarshalZones',
    //   'm_marshalZones',
    //   'm_safetyCarStatus',
    //   'm_networkGame',
    //   'm_numWeatherForecastSamples',
    //   'm_weatherForecastSamples',
    //   'm_forecastAccuracy',
    //   'm_aiDifficulty',
    //   'm_seasonLinkIdentifier',
    //   'm_weekendLinkIdentifier',
    //   'm_sessionLinkIdentifier',
    //   'm_pitStopWindowIdealLap',
    //   'm_pitStopWindowLatestLap',
    //   'm_pitStopRejoinPosition',
    //   'm_steeringAssist',
    //   'm_brakingAssist',
    //   'm_gearboxAssist',
    //   'm_pitAssist',
    //   'm_pitReleaseAssist',
    //   'm_ERSAssist',
    //   'm_DRSAssist',
    //   'm_dynamicRacingLine',
    //   'm_dynamicRacingLineType'

    let driver = getDriver(data.m_spectatorCarIndex)
    if (driver && data.m_isSpectating) {

        if (cache["spectator-networkid"] && cache["spectator-networkid"] !== driver.m_networkId) {
            console.log(`Now spectating ${localNumber(driver.m_raceNumber, driver.m_teamId)} @${driver.m_networkId} ${driver.m_name}`)

            io.to("spectating").emit("spectating", {
                name: localNumber(driver.m_raceNumber, driver.m_teamId),
                number: driver.m_raceNumber,
                networkID: driver.m_networkId,
                carI: driver.carI,
                status: driver.status,
                car: driver.car,
                isAI: driver.m_aiControlled,
                localDriverData: driver.localDriverData,
                driver
            });

            if (obs && driver.m_networkId !== 255) {
                console.log("attempting", `POV ${driver.m_networkId + 1}`)
                obs.send("SetCurrentScene", {
                    "scene-name": `POV ${driver.m_networkId + 1}`
                }).then(c => {
                    console.log(`Switched scenes!`, c);
                }).catch(e => {
                    // console.error("Failed to switch scenes :(", e);
                })
            }
        }

        cache["spectator-networkid"] = driver.m_networkId;
    } else {
        io.to("spectating").emit("spectating", {
            carI: data.m_spectatorCarIndex
        })
    }

    // console.log(Object.keys(data))
});

function zp(num, size) {
    return Math.abs(num).toString().padStart(size, "0")
}

function msToHMS(ms) {
    if (!ms) return "-:--.---"
    let [m, mr] = [Math.floor(ms / (60 * 1000)),ms % (60 * 1000)];
    let [s, sr] = [Math.floor(mr / 1000), ms % 1000]
    // console.log(m, mr);

    return `${m}:${zp(s, 2)}.${zp(sr, 3)}`
}


let leaderboard = [];
let cache = {};
resetCache();
function resetCache() {
    cache = {}
    purple.sectors = [0,0,0]
    cache["sessionHistory"] = [];
}

let drivers = [];
let statuses = [];

function getDriver(i) {
    let driver = drivers[i];
    if (!driver) return null;

    let localDriverData = localData.find(d => d.number === driver.m_raceNumber.toString());
    if (driver.m_raceNumber === 51) {
        // console.log(i, driver.m_raceNumber, driver.m_raceNumber.toString())
    }
    let car = cache[`car-${i}`];
    // let customTeam = localDriverData?.customTeam?.name ? localDriverData.customTeam : null
    return {
        ...driver,
        car,
        pos: car?.m_carPosition,
        gridPos: car?.m_gridPosition,
        gridDiff: car?.m_gridPosition - car?.m_carPosition,
        // team: customTeam ? { ...customTeam, custom: true, original: constants.TEAMS[driver.m_teamId] } : constants.TEAMS[driver.m_teamId],
        team: localDriverData?.team?.name ? localDriverData.team : constants.TEAMS[driver.m_teamId],
        localDriverData,
        status: statuses[i] || null
    }
}

function getSectorColor(oldData, newData, i) {
    if (!oldData) return;
    let sector = oldData.m_sector; // TODO: change this to newData.m_sector, time to cached data
    let time = oldData.currentSectorTime;
    if (time < (16000)) return null;
    if (oldData.m_pitStatus !== 0) return;
    let driver = drivers[i];
    if (driver && driver?.m_networkId !== 255) {

        console.log(`${localNumber(driver?.m_raceNumber, driver?.m_teamId)} sector ${oldData.m_sector} ${newData.m_sector} finished ${msToHMS(time)}`, `Status D${oldData.m_driverStatus} R${oldData.m_resultStatus} P${oldData.m_pitStatus}`)
    }

    return "purple";

    if (!purple.sectors[sector]) {
        purple.sectors[sector] = time
        return null;
    }
    if (purple.sectors[sector] > time) {
        purple.sectors[sector] = time;
        return "purple"
    }

    if (!cache[`car-bestlap-sector-${i}`]?.[sector]) return null;

    if (cache[`car-bestlap-sector-${i}`][sector] > time) {
        return "green"
    } else {
        return "red";
    }

}

function getSectorData(oldData, newData, i) {

    const sectors = [1,2,3];
    // isComplete, color, time

    // Use old data for a little bit
    let holdData = newData.m_currentLapTimeInMS < 10 * 1000;
    cache[`car-hold-sector-data-${i}`] = holdData;
    if (holdData && cache[`car-last-lap-data-${i}`]) {
        newData = cache[`car-last-lap-data-${i}`];
    }

    let currentSector = newData.m_sector + 1;

    return sectors.map(sectorNum => {
        let sectorColor;
        let inSector = (sectorNum === currentSector);
        // let sectorTime = inSector ? newData.currentSectorTime : newData[`m_sector${sectorNum}TimeInMS`];
        let sectorTime = inSector ? newData.currentSectorTime : (cache[`car-current-lap-${i}`]?.[`m_sector${sectorNum}TimeInMS`] || newData[`m_sector${sectorNum}TimeInMS`])

        if (sectorNum === 3 && holdData) {
            if (cache[`car-latest-lap-${i}`]?.m_sector3TimeInMS) {
                sectorTime = cache[`car-latest-lap-${i}`]?.m_sector3TimeInMS;
            }
        }

        if (holdData) {
            inSector = false;
        }


        let bestLapSectorTime = cache[`car-bestlap-sector-${i}`]?.[sectorNum - 1]


        let sectorDiff = sectorTime - bestLapSectorTime;

        if (!sectorTime) {

        } else {
            if (!inSector && bestLapSectorTime) {
                if (sectorTime <= bestLapSectorTime) {
                    sectorColor = "green";
                    let purpleTime = purple.sectors[sectorNum - 1]
                    // purple time is likely to be equal since it is set at the end of sectors
                    if (purpleTime !== 0 && sectorTime > 10000 && sectorTime <= purpleTime) {
                        sectorColor = "purple";
                        // sectorDiff = purpleTime - sectorTime;
                    }
                } else {
                    sectorColor = "red"
                }
            }
            if (!inSector && !bestLapSectorTime) {
                // no best lap
                // sectorColor = "white";
            }
        }

        // red early
        if (inSector && bestLapSectorTime && sectorTime && (sectorTime > bestLapSectorTime)) sectorColor = "red";
        // console.log({ sectorNum, sectorTime, bestLapSectorTime })

        return {
            inSector,
            sectorTime: msToHMS(sectorTime),
            sectorTimeMS: sectorTime,
            sectorColor,
            bestLapSectorTime: msToHMS(bestLapSectorTime),
            sectorDiff,
            _testing: {
                // current: newData.currentSectorTime,
                currentSpecified: newData[`m_sector${sectorNum}TimeInMS`],
                // currentLapSectorTime: cache[`car-current-lap-${i}`]?.[`m_sector${sectorNum}TimeInMS`],
                latestS3: cache[`car-latest-lap-${i}`]?.m_sector3TimeInMS,
                s3Calculated: newData.m_currentLapTimeInMS - newData.m_sector1TimeInMS - newData.m_sector2TimeInMS,
                sectorDiff,
                sectorTime,
                bestLapSectorTime
            }
        }


    })
}


function lapComplete(oldData, newData, i) {
    if (oldData.m_pitStatus !== 0) return;
    // console.log("last sector", cache[`car-current-lap-${i}`])
    // oldData.m_sector3TimeInMS = oldData.currentSectorTime;

    cache[`car-last-lap-data-${i}`] = oldData;

    if (!cache[`car-bestlap-time-${i}`]) {
        // cache[`car-bestlap-time-${i}`] = newData.m_lastLapTimeInMS;
        // cache[`car-bestlap-sector-${i}`] = [
        //     oldData.m_sector1TimeInMS,
        //     oldData.m_sector2TimeInMS,
        //     oldData.currentSectorTime
        // ]
        return;
    }
    let driver = drivers[i];

    if (cache[`car-bestlap-time-${i}`] > newData.m_lastLapTimeInMS) {
        // best lap
        // cache[`car-bestlap-time-${i}`] = newData.m_lastLapTimeInMS;
        // cache[`car-bestlap-sector-${i}`] = [
        //     oldData.m_sector1TimeInMS,
        //     oldData.m_sector2TimeInMS,
        //     oldData.currentSectorTime
        // ]
        if (driver && driver?.m_networkId !== 255 && newData.m_currentLapNum >= 3) {

            // sendAlert({
            //     title: `${localNumber(driver?.m_raceNumber, driver?.m_teamId, driver?.m_name)} - Driver's best lap!`,
            //     description: `Time: ${msToHMS(newData.m_lastLapTimeInMS)}`,
            //     stripe: "white",
            //     duration: 10000
            // })

            console.log("player's best lap!", [
                newData.m_lastLapTimeInMS,
                oldData.m_sector1TimeInMS,
                oldData.m_sector2TimeInMS,
                oldData.currentSectorTime
            ].map(p => msToHMS(p)));
        }
    }
}
client.on(PACKETS.carStatus, (data) => {
    // all cars
    statuses = (data.m_carStatusData || []).map((e, i) => ({...e, carI: i}));
})

client.on(PACKETS.participants, (data) => {
    drivers = (data.m_participants || []).map((e, i) => ({...e, carI: i}));
    // console.log("--- Participants ---")
    // console.log(["ID", "Name", "Car", "Team"].join('\t'))
    // console.log(drivers.filter(d => d.m_networkId !== 255).sort((a,b) => a.m_networkId - b.m_networkId).map(d => [d.m_networkId + 1,d.m_name,d.m_raceNumber, constants.TEAMS[d.m_teamId]?.name].join('\t')).join('\n'))
})

client.on(PACKETS.lapData, (lapData) => {
    // console.log(Object.keys(lapData.m_lapData[0]).join('\n'))


    leaderboard = lapData.m_lapData.map((car, i) => {
        cache[`car-${i}`] = car;
        let driver = getDriver(i);
        let old = cache[`car-lapdata-${i}`];

        let currentSectorTime = (car.m_currentLapTimeInMS - car.m_sector1TimeInMS - car.m_sector2TimeInMS)

        if (old && old.m_currentLapNum !== car.m_currentLapNum) {
            lapComplete(old, car, i);
        }

        if (old && old.m_sector !== car.m_sector) {
            let sectorColor = getSectorColor(old, car, i);

            if (driver && driver?.m_networkId !== 255 && sectorColor === "purple") {
                // sendAlert({
                //     title: `${localNumber(driver?.m_raceNumber, driver?.m_teamId, driver?.m_name)} ${sectorColor} sector ${car.m_sector + 1}`,
                //     description: `Sector ${car.m_sector + 1} time: ${msToHMS(old.currentSectorTime)}`,
                //     stripe: sectorColor
                // })
                console.log("sector color:", sectorColor);
                console.log("current purple sectors: ", [...purple.sectors].map(p => msToHMS(p)));
            }
        }

        try {
            car._tyres = constants.TYRES[getTrackTyres( driver?.status?.m_actualTyreCompound)] || {}
            if (car._tyres.name) car._tyres.laps = driver?.status?.m_tyresAgeLaps;

            if (old?._tyres && car?._tyres?.laps !== JSON.parse(old?._tyres)?.laps) {
                // console.log("lap diff", car._tyres, old._tyres)
            }

            if (old && (old._tyres !== JSON.stringify(car._tyres))) {
                old._tyres = JSON.parse(old._tyres);
                // console.log("new tyres", {
                //     _old: old._tyres,
                //     _new: car._tyres
                // })

                if (old._tyres?.name && old._tyres.name !== car._tyres.name || (old._tyres.laps > car._tyres.laps)) {
                    sendAlert({
                        title: `Tyre swap - ${localNumber(driver.m_raceNumber, driver.m_teamId)}`,
                        // description: `${old._tyres.name} ${plural(old._tyres.laps, "lap", "s")} -> ${car._tyres.laps === 0 ? `Fresh ${car._tyres.name}` : plural(car._tyres.laps, "lap", "s")}`,
                        description: `${old._tyres.name} ${plural(old._tyres.laps, "lap", "s")} -> ${car._tyres.name} ${plural(car._tyres.laps, "lap", "s")}`,
                        stripe: "white"
                    })
                }
            }
        } catch (e) { console.warn(e) }


        car._status = driver && driver.status;
        cache[`car-lapdata-${i}`] = car;
        cache[`car-lapdata-${i}`]._tyres = JSON.stringify(car._tyres || {});
        cache[`car-lapdata-${i}`].currentSectorTime = currentSectorTime;

        let best = cache[`car-bestlap-time-${i}`];

        let drs = {};

        if (driver?.status && old?._status) {
            // active IF
            // previously counted down AND drs allowed = 0

            drs.active = cache[`drs-${i}-active`];

            if (old._status?.m_drsActivationDistance !== driver?.status?.m_drsActivationDistance && old._status?.m_drsActivationDistance > driver?.status?.m_drsActivationDistance) {

                // console.log(`DRS counting down ${localNumber(driver.m_raceNumber)}`, old._status?.m_drsActivationDistance, driver.status.m_drsActivationDistance)
                cache[`drs-${i}-counted-down`] = true;
                drs.distance = driver.status.m_drsActivationDistance;
            }

            if (driver.status.m_drsActivationDistance === 0 && cache[`drs-${i}-counted-down`] && !cache[`drs-${i}-active`]) {
                console.log(`DRS on ${localNumber(driver.m_raceNumber)}`)
                cache[`drs-${i}-active`] = true;
                drs.active = true;

                cache[`drs-${i}-nodisable`] = true;
                setTimeout(() => {
                    cache[`drs-${i}-nodisable`] = false;
                }, 500);
            }

            if (cache[`drs-${i}-counted-down`] && driver.status.m_drsAllowed === 1) {
                // console.log(`DRS off pre ${localNumber(driver.m_raceNumber)}`)
                // drs over
                if (cache[`drs-${i}-nodisable`]) {
                    // console.log(`DRS off but don't ${localNumber(driver.m_raceNumber)}`)
                    // setTimeout(() => {
                    //     cache[`drs-${i}-counted-down`] = false;
                    //     cache[`drs-${i}-nodisable`] = false;
                    //     cache[`drs-${i}-active`] = false;
                    //     drs.active = false;
                    // }, 10000);
                } else {
                    console.log(`DRS off ${localNumber(driver.m_raceNumber)}`)
                    cache[`drs-${i}-counted-down`] = false;
                    cache[`drs-${i}-nodisable`] = false;
                    cache[`drs-${i}-active`] = false;
                    drs.active = false;
                }
            }

            // drs.active = false;


            // finished IF
            // previously active AND drs allowed = 1

            // didn't hit it IF
            // didn't count down
        }

        return {
            pos: car.m_carPosition,
            carI: i,
            status: car.m_resultStatus,
            carNumber: driver?.m_raceNumber,
            networkID: driver?.m_networkId === 255 ? "~" + driver?.m_driverId : driver?.m_networkId,
            team: driver?.team || constants.TEAMS[driver?.m_teamId],
            nationality: constants.NATIONALITIES[driver?.m_nationality],
            name: localNumber(driver?.m_raceNumber, driver?.m_teamId, driver?.m_name || car.m_name),
            currentLapNum: car.m_currentLapNum,
            currentLapTime: msToHMS(car.m_currentLapTimeInMS),
            bestLapTime: msToHMS(best || 0),
            lastLapTime: msToHMS(car.m_lastLapTimeInMS || 0),
            comparisonLap: cache[`car-comparison-lap-${i}`],
            inSector: car.m_sector + 1,
            sector1Time: msToHMS(car.m_sector1TimeInMS),
            sector2Time: msToHMS(car.m_sector2TimeInMS),

            sectors: getSectorData(old, car, i),
            localDriverData: driver && driver.localDriverData,

            currentSectorTime: msToHMS(currentSectorTime),
            carStatus: driver && driver.status,
            ai: driver && driver.m_aiControlled,
            networkID: driver && driver.m_networkId,
            pitTimer: car.m_pitLaneTimerActive,
            tyres: {
                // ...constants.TYRES?.[driver?.status?.m_actualTyreCompound],
                ...constants.TYRES[getTrackTyres( driver?.status?.m_actualTyreCompound)],
                internal: {
                    actual: driver?.status?.m_actualTyreCompound,
                    visual: driver?.status?.m_visualTyreCompound,
                    compound: driver?.status?.m_tyreCompound
                }
            },
            drs: drs,
            gridPosition: car.m_gridPosition,
            // safetyCarDelta: msToHMS(car.m_safetyCarDelta),
            persist: {
                warning: cache[`persist-warning-${i}`],
                penalty: cache[`persist-penalty-${i}`],
                counts: {
                    penalty: cache[`counts-${i}-penalty`],
                    penaltyTime: cache[`counts-${i}-penaltytime`],
                    warnings: cache[`counts-${i}-warnings`],
                }
            },

            // text: [
            //     `P${car.m_carPosition}`,
            //     `@${driver?.m_networkId === 255 ? driver?.m_driverId : driver?.m_networkId}`,
            //     `#${driver?.m_raceNumber}`,
            //     `Lap: ${car.m_currentLapNum}`,
            //     `Best: ${msToHMS(best || 0)}`,
            //     `Last: ${msToHMS(car.m_lastLapTimeInMS)}`,
            //     // `Now: ${msToHMS(car.m_currentLapTimeInMS)}`,
            //     `SC: ${msToHMS(currentSectorTime)}`,
            //     // `S1: ${msToHMS(car.m_sector1TimeInMS)}`,
            //     // `S2: ${msToHMS(car.m_sector2TimeInMS)}`,
            //     `In sector: ${car.m_sector + 1}`,
            //     // `Status D${car.m_driverStatus} R${car.m_resultStatus} P${car.m_pitStatus}`,
            //     // `Result status: ${car.m_resultStatus}`,
            //     `Penalties: ${car.m_penalties} ${car.m_currentLapInvalid}`
            // ]
            penalties: car.m_penalties || car.m_penaltiesTime || driver?.m_penalties || driver?.m_penaltiesTime,
            driveThroughs: car.m_numUnservedDriveThroughPens,
            resultStatus: car.m_resultStatus,
            driverStatus: car.m_driverStatus,
            pitStatus: car.m_pitStatus,
            // carDamage: cache[`cardamage-${i}`],
            allCarData: car
        };
    })
})

function sum(arr) {
    return (arr || []).reduce((a, b) => a + b, 0)
}

let requiredDamageJumps = {
    "m_tyresWear": 2
};

function localNumber(num, teamID, fallbackName) {
    let localDataName = num ? localData.find(d => d.number === num.toString())?.driver : null;

    if (fallbackName === "Player") fallbackName = null;

    let teamName = teamID ? constants.TEAMS[teamID]?.name || 'Car' : 'Car'
    if (teamName === "INVALID") teamName = "Car";
    teamName = teamName.split(' ')[0];

    if (num === 2 && ![85, 0].includes(teamID)) return fallbackName || `${teamName} #${num || "--"}`;

    if (localDataName) return localDataName;
    return fallbackName || `${teamName} #${num || "--"}`;
}

client.on(PACKETS.carDamage, data => {
    data?.m_carDamageData.forEach((car, i) => {
        let old = cache[`cardamage-${i}`];
        if (old) {
            Object.entries(car).forEach(([key, val]) => {
                if (JSON.stringify(old[key]) !== JSON.stringify(val)) {
                    let diff;
                    if (typeof old[key] === "object") {
                        // array check
                        diff = sum(val) - sum(old[key]);
                    } else {
                        // num check
                        diff = val - old[key];
                    }

                    if (!["m_tyresWear", "m_tyresDamage"].includes(key) && diff > 0) {
                        console.log("CAR DAMAGE", key, "car i", i, old[key], "->", val, " ++", diff);
                        // if (requiredDamageJumps[key] && diff >= requiredDamageJumps[key]) {
                        //     sendAlert({
                        //         title: `Car damage: ${key}`,
                        //         description: `Car ${i}`,
                        //         stripe: "red"
                        //     })
                        // }
                    }
                }
            })
        }
        cache[`cardamage-${i}`] = car;
        // console.log(i, JSON.stringify(car));

    })
})

setInterval(() => {
    io.to("leaderboard").emit("leaderboard", leaderboard);
}, 50);

setInterval(() => {
    io.to("session").emit("session", cache["session"]);
    io.to("sessionHistory").emit("sessionHistory", cache["sessionHistory"]);
    io.to("lobbyInfo").emit("lobbyInfo", cache["lobbyInfo"]);
    io.to("finalClassification").emit("finalClassification", cache["finalClassification"]);
    io.to("purple").emit("purple", purple);
    io.to("localData").emit("localData", localData);
}, 1000);

setInterval(() => {
    // console.log("=====")
    // console.log(leaderboard.filter(e => e.pos !== 0 && e.status !== 7).sort((a,b) => a.pos - b.pos).map(e => e.text).join('\n'))
    // console.log("=====")
}, 2000);

client.start();
