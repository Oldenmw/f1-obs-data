export declare const PACKET_PARTICIPANTS_DATA_BUFFER_2018: number[];
export declare const PACKET_PARTICIPANTS_DATA_PARSED_2018: {
    m_header: {
        m_packetFormat: number;
        m_packetVersion: number;
        m_packetId: number;
        m_sessionTime: number;
        m_frameIdentifier: number;
        m_playerCarIndex: number;
        m_sessionUID: bigint;
    };
    m_numCars: number;
    m_participants: {
        m_aiControlled: number;
        m_driverId: number;
        m_teamId: number;
        m_raceNumber: number;
        m_nationality: number;
        m_name: string;
    }[];
};
