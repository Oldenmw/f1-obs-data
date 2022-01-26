const { F1TelemetryClient, constants } = require("@racehub-io/f1-telemetry-client");
const { PACKETS } = constants;

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

server.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on("connection", (socket) => {
    console.log("New socket connection");

    socket.emit("new-alert", {
        duration: 5000,
        title: "F1 Data system",
        description: "by Freya & SLMN",
        stripe: "lime"
    });

    socket.on("subscribe", (room) => {
        socket.join(room);
    })
});

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
client.on(PACKETS.session, (data) => {
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
            console.log(`Now spectating ${localNumber(driver.m_raceNumber)} @${driver.m_networkId} ${driver.m_name}`)

            io.to("spectating").emit("spectating", {
                number: driver.m_raceNumber,
                networkID: driver.m_networkId,
                carI: driver.carI,
                status: driver.status,
                isAI: driver.m_aiControlled
            })

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
const purple = {
    sectors: [0, 0, 0]
}
const cache = {}
let drivers = [];
let statuses = [];

function getDriver(i) {
    let driver = drivers[i];
    if (!driver) return null;
    return {
        ...driver,
        status: statuses[i] || null
    }
}


function getSectorColor(oldData, newData, i) {
    if (!oldData) return;
    let sector = oldData.m_sector;
    let time = oldData.currentSectorTime;
    if (time < (16000)) return null;
    if (oldData.m_pitStatus !== 0) return;
    let driver = drivers[i];
    if (driver && driver?.m_networkId !== 255) console.log(`${localNumber(driver?.m_raceNumber)} sector ${sector + 1} finished ${msToHMS(time)}`, `Status D${oldData.m_driverStatus} R${oldData.m_resultStatus} P${oldData.m_pitStatus}`)


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
    if (holdData && cache[`car-last-lap-data-${i}`]) {
        newData = cache[`car-last-lap-data-${i}`];
    }

    let currentSector = newData.m_sector + 1;

    return sectors.map(sectorNum => {
        let sectorColor;
        let inSector = (sectorNum === currentSector);
        let sectorTime = inSector ? newData.currentSectorTime : newData[`m_sector${sectorNum}TimeInMS`];

        if (holdData) {
            inSector = false;
        }


        let bestLapSectorTime = cache[`car-bestlap-sector-${i}`]?.[sectorNum - 1]
        if (!inSector && bestLapSectorTime) {
            if (sectorTime <= bestLapSectorTime) {
                sectorColor = "green";
                if (purple.sectors[sectorNum - 1] > sectorTime) {
                    // sectorColor = "purple";
                }
            } else {
                sectorColor = "red"
            }
        }

        // red early
        if (inSector && bestLapSectorTime && (sectorTime > bestLapSectorTime)) sectorColor = "red";

        return {
            inSector, sectorTime: msToHMS(sectorTime), sectorColor, bestLapSectorTime: msToHMS(bestLapSectorTime)
        }


    })
}


function lapComplete(oldData, newData, i) {
    if (oldData.m_pitStatus !== 0) return;
    console.log("last sector", oldData.currentSectorTime)
    oldData.m_sector3TimeInMS = oldData.currentSectorTime;

    cache[`car-last-lap-data-${i}`] = oldData;

    if (!cache[`car-bestlap-time-${i}`]) {
        cache[`car-bestlap-time-${i}`] = newData.m_lastLapTimeInMS;
        cache[`car-bestlap-sector-${i}`] = [
            oldData.m_sector1TimeInMS,
            oldData.m_sector2TimeInMS,
            oldData.currentSectorTime
        ]
        return;
    }
    let driver = drivers[i];

    if (cache[`car-bestlap-time-${i}`] > newData.m_lastLapTimeInMS) {
        // best lap
        cache[`car-bestlap-time-${i}`] = newData.m_lastLapTimeInMS;
        cache[`car-bestlap-sector-${i}`] = [
            oldData.m_sector1TimeInMS,
            oldData.m_sector2TimeInMS,
            oldData.currentSectorTime
        ]
        if (driver && driver?.m_networkId !== 255 && newData.m_currentLapNum >= 3) {

            sendAlert({
                title: `${localNumber(driver?.m_raceNumber, driver?.m_name)} - Driver's best lap!`,
                description: `Time: ${msToHMS(newData.m_lastLapTimeInMS)}`,
                stripe: "white",
                duration: 10000
            })

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
        let driver = getDriver(i);
        let old = cache[`car-lapdata-${i}`];

        let currentSectorTime = (car.m_currentLapTimeInMS - car.m_sector1TimeInMS - car.m_sector2TimeInMS)

        if (old && old.m_currentLapNum !== car.m_currentLapNum) {
            lapComplete(old, car, i);
        }

        if (old && old.m_sector !== car.m_sector) {
            let sectorColor = getSectorColor(old, car, i);
            if (driver && driver?.m_networkId !== 255 && sectorColor === "purple") {
                sendAlert({
                    title: `${localNumber(driver?.m_raceNumber, driver?.m_name)} ${sectorColor} sector ${car.m_sector + 1}`,
                    description: `Sector ${car.m_sector + 1} time: ${msToHMS(old.currentSectorTime)}`,
                    stripe: sectorColor
                })
                console.log("sector color:", sectorColor);
                console.log("current purple sectors: ", [...purple.sectors].map(p => msToHMS(p)));
            }
        }


        cache[`car-lapdata-${i}`] = car;
        cache[`car-lapdata-${i}`].currentSectorTime = currentSectorTime;

        let best = cache[`car-bestlap-time-${i}`];

        return {
            pos: car.m_carPosition,
            carI: i,
            status: car.m_resultStatus,
            carNumber: driver?.m_raceNumber,
            networkID: driver?.m_networkId === 255 ? "~" + driver?.m_driverId : driver?.m_networkId,
            team: constants.TEAMS[driver?.m_teamId],
            name: localNumber(driver?.m_raceNumber, driver?.m_name || car.m_name),
            currentLapNum: car.m_currentLapNum,
            currentLapTime: msToHMS(car.m_currentLapTimeInMS),
            bestLapTime: msToHMS(best || 0),
            lastLapTime: msToHMS(car.m_lastLapTimeInMS || 0),
            inSector: car.m_sector + 1,
            sector1Time: msToHMS(car.m_sector1TimeInMS),
            sector2Time: msToHMS(car.m_sector2TimeInMS),

            sectors: getSectorData(old, car, i),

            currentSectorTime: msToHMS(currentSectorTime),
            carStatus: driver && driver.status,
            ai: driver && driver.m_aiControlled,
            networkID: driver && driver.m_networkId,
            pitTimer: car.m_pitLaneTimerActive,
            tyres: {
                ...constants.TYRES?.[driver?.status?.m_actualTyreCompound],
                internal: {
                    actual: driver?.status?.m_actualTyreCompound,
                    visual: driver?.status?.m_visualTyreCompound,
                    compound: driver?.status?.m_tyreCompound
                }
            },
            gridPosition: car.m_gridPosition,
            // safetyCarDelta: msToHMS(car.m_safetyCarDelta)


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

function localNumber(num, fallbackName) {
    let map = {
        2: "mint",
        8: "daws",
        12: "Lorer",
        13: "Emmy",
        15: "ducks",
        19: "Mega",
        20: "Aaron",
        21: "ChknNuggetGod",
        23: "Freya",
        24: "Jordan",
        25: "shadowkhas",
        26: "Joshen",
        27: "Beastburger",
        28: "timweak",
        30: "Mini",
        39: "Person839",
        42: "butters",
        68: "Mahir",
        69: "Protein",
        96: "Plewt0",
        98: "Marlun"
    }
    if (map[num]) return map[num];
    if (fallbackName === "Player") fallbackName = null;
    return fallbackName || `Car #${num || "--"}`;
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
}, 100);

setInterval(() => {
    // console.log("=====")
    // console.log(leaderboard.filter(e => e.pos !== 0 && e.status !== 7).sort((a,b) => a.pos - b.pos).map(e => e.text).join('\n'))
    // console.log("=====")
}, 2000);

client.start();
