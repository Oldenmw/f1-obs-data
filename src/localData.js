const rawData = `DAWS\t1\t252\t4\t8\t5\t4\t2\t0\t2\t0\t0\t0\t0\t0\t5\t0\tdaws\tClinched JF1 Champion
FREYA\t2\t202\t2\t23\t2\t4\t3\t2\t0\t0\t1\t0\t2\t0\t1\t0\tFreya\tMust be -2 on Mint for 2nd
MINT\t3\t199\t0\t2\t2\t4\t3\t1\t1\t1\t0\t0\t0\t1\t1\t0\tmint\tNeeds +3 on Freya for 2nd
SHADOWKHAS\t4\t184\t6\t25\t1\t1\t2\t7\t1\t0\t2\t1\t0\t0\t1\t0\tshadowkhas\tP1 & Freya/Mint midtable for 2nd
JORDAN\t5\t132\t1\t24\t1\t2\t2\t2\t1\t0\t1\t0\t0\t0\t1\t0\tJordan\t
AARON\t6\t105\t5\t20\t3\t0\t1\t1\t0\t0\t0\t0\t0\t0\t3\t0\tAaron\t
MINIKA\t7\t54\t3\t30\t1\t0\t1\t0\t1\t0\t0\t1\t0\t0\t0\t0\tMinika\t
CHKNNUGGETGOD\t8\t54\t0\t21\t0\t0\t0\t0\t3\t1\t1\t1\t3\t0\t0\t0\tChknNuggetGod\t
JOSHEN\t9\t49\t2\t26\t0\t0\t1\t1\t0\t1\t1\t1\t1\t2\t0\t0\tJoshen\t
MEGA\t10\t44\t6\t19\t0\t0\t0\t0\t1\t3\t1\t1\t0\t0\t0\t0\tMega\t
MARLUN\t11\t39\t7\t98\t0\t0\t0\t0\t1\t3\t0\t1\t0\t1\t0\t0\tMarlun\t
PROTEIN\t12\t39\t8\t69\t0\t0\t0\t0\t1\t1\t2\t1\t1\t3\t0\t0\tProtein\t
PERSON839\t13\t30\t4\t39\t0\t0\t0\t1\t0\t0\t1\t2\t1\t1\t1\t0\tperson839\t
MRMRMAN\t14\t19\t5\t80\t0\t0\t0\t0\t0\t1\t1\t1\t0\t0\t1\t0\tMrMrMan\t
EMMY\t15\t18\t3\t13\t0\t0\t0\t0\t0\t1\t1\t1\t0\t0\t0\t0\temmy\t
RECURVE\t16\t14\t1\t51\t0\t0\t0\t0\t1\t0\t0\t1\t0\t0\t0\t0\tRecurve\t
SAMUEL\t17\t14\t7\t36\t0\t0\t0\t0\t0\t1\t1\t0\t0\t0\t0\t0\tSamuel\t
BUTTERS\t18\t12\t1\t42\t0\t0\t0\t0\t1\t0\t0\t0\t1\t0\t0\t0\tbutters\t
LORER\t19\t10\t9\t12\t0\t0\t0\t0\t1\t0\t0\t0\t0\t0\t0\t0\tLorer\t
SPOOKEY\t20\t10\t6\t28\t0\t0\t0\t0\t0\t0\t1\t0\t2\t0\t0\t0\tSpookey\t
DUCKS\t21\t8\t5\t15\t0\t0\t0\t0\t0\t1\t0\t0\t0\t0\t0\t0\tducks\t
TIMWEAK\t22\t4\t5\t280\t0\t0\t0\t0\t0\t0\t0\t1\t0\t0\t0\t0\ttimweak\t
BEASTBURGER\t23\t2\t9\t27\t0\t0\t0\t0\t0\t0\t0\t0\t1\t0\t0\t0\tBeastburger\t
DUPIDER\t24\t2\t9\t32\t0\t0\t0\t0\t0\t0\t0\t0\t0\t2\t0\t0\tdupider\t
BAM\t25\t1\t3\t78\t0\t0\t0\t0\t0\t0\t0\t0\t0\t1\t0\t0\tBam\t
SOLOMON\t26\t0\t8\t40\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\tSolomon\t
MAHIR\t27\t0\t8\t68\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\tMahir\t
TRICOLORWHEAT64\t28\t0\t7\t66\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\ttricolorwheat64\t
PLEWT0\t29\t0\t7\t96\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\tPlewt0\t
DI0PTAS\t29\t0\t7\t74\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\tDi0ptas\t`
const headers = `driverCaps\trank\tpoints\tteamID\tnumber\tfinishes.1\tfinishes.2\tfinishes.3\tfinishes.4\tfinishes.5\tfinishes.6\tfinishes.7\tfinishes.8\tfinishes.9\tfinishes.10\tfastestLaps\tpoles\tdriver\tnotes\tlastRace.rank\tcustomTeam.color\tcustomTeam.logo\tcustomTeam.name\tcustomTeam.code\tcustomTeam.id`.split('\t');

data = rawData.split('\n').map(driver => driver.split('\t')).map(cells => {
    let driver = {};

    cells.forEach((cell, i) => {
        let header = headers[i];
        if (header.includes(".")) {
            let [objectKey, objectValue] = header.split('.');
            if (!driver[objectKey]) driver[objectKey] = {};
            driver[objectKey][objectValue] = cell;
        } else {
            driver[header] = cell;
        }
    })

    return driver;
}).filter(driver => driver.number);



module.exports = {
    async getData() {
        return data;
    }
}
