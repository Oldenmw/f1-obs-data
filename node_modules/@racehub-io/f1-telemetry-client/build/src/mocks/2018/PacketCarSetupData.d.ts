export declare const PACKET_CAR_SETUP_DATA_BUFFER_2018: number[];
export declare const PACKET_CAR_SETUP_DATA_PARSED_2018: {
    m_header: {
        m_packetFormat: number;
        m_packetVersion: number;
        m_packetId: number;
        m_sessionTime: number;
        m_frameIdentifier: number;
        m_playerCarIndex: number;
        m_sessionUID: bigint;
    };
    m_carSetups: {
        m_frontWing: number;
        m_rearWing: number;
        m_onThrottle: number;
        m_offThrottle: number;
        m_frontCamber: number;
        m_rearCamber: number;
        m_frontToe: number;
        m_rearToe: number;
        m_frontSuspension: number;
        m_rearSuspension: number;
        m_frontAntiRollBar: number;
        m_rearAntiRollBar: number;
        m_frontSuspensionHeight: number;
        m_rearSuspensionHeight: number;
        m_brakePressure: number;
        m_brakeBias: number;
        m_frontTyrePressure: number;
        m_rearTyrePressure: number;
        m_ballast: number;
        m_fuelLoad: number;
    }[];
};
