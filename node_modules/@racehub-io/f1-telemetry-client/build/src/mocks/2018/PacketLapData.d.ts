export declare const PACKET_LAP_DATA_BUFFER_2018: number[];
export declare const PACKET_LAP_DATA_PARSED_2018: {
    m_header: {
        m_packetFormat: number;
        m_packetVersion: number;
        m_packetId: number;
        m_sessionTime: number;
        m_frameIdentifier: number;
        m_playerCarIndex: number;
        m_sessionUID: bigint;
    };
    m_lapData: {
        m_lastLapTime: number;
        m_currentLapTime: number;
        m_bestLapTime: number;
        m_sector1Time: number;
        m_sector2Time: number;
        m_lapDistance: number;
        m_totalDistance: number;
        m_safetyCarDelta: number;
        m_carPosition: number;
        m_currentLapNum: number;
        m_pitStatus: number;
        m_sector: number;
        m_currentLapInvalid: number;
        m_penalties: number;
        m_gridPosition: number;
        m_driverStatus: number;
        m_resultStatus: number;
    }[];
};
