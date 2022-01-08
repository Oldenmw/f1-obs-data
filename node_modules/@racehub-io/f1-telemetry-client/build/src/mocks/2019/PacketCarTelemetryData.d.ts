export declare const PACKET_CAR_TELEMETRY_DATA_BUFFER_2019: number[];
export declare const PACKET_CAR_TELEMETRY_DATA_PARSED_2019: {
    m_header: {
        m_packetFormat: number;
        m_gameMajorVersion: number;
        m_gameMinorVersion: number;
        m_packetVersion: number;
        m_packetId: number;
        m_sessionTime: number;
        m_frameIdentifier: number;
        m_playerCarIndex: number;
        m_sessionUID: bigint;
    };
    m_carTelemetryData: {
        m_speed: number;
        m_throttle: number;
        m_steer: number;
        m_brake: number;
        m_clutch: number;
        m_gear: number;
        m_engineRPM: number;
        m_drs: number;
        m_revLightsPercent: number;
        m_brakesTemperature: number[];
        m_tyresSurfaceTemperature: number[];
        m_tyresInnerTemperature: number[];
        m_engineTemperature: number;
        m_tyresPressure: number[];
        m_surfaceType: number[];
    }[];
    m_buttonStatus: number;
};
