export declare const PACKET_PARTICIPANTS_DATA_BUFFER_2019: number[];
export declare const PACKET_PARTICIPANTS_DATA_PARSED_2019: {
    m_header: {
        m_frameIdentifier: number;
        m_gameMajorVersion: number;
        m_gameMinorVersion: number;
        m_packetFormat: number;
        m_packetId: number;
        m_packetVersion: number;
        m_playerCarIndex: number;
        m_sessionTime: number;
        m_sessionUID: bigint;
    };
    m_numActiveCars: number;
    m_participants: {
        m_aiControlled: number;
        m_driverId: number;
        m_name: string;
        m_nationality: number;
        m_raceNumber: number;
        m_teamId: number;
        m_yourTelemetry: number;
    }[];
};
