export declare const PACKET_CAR_TELEMETRY_DATA_BUFFER_2018: number[];
export declare const PACKET_CAR_TELEMETRY_DATA_PARSED_2018: {
    m_buttonStatus: number;
    m_carTelemetryData: {
        m_brake: number;
        m_brakesTemperature: number[];
        m_clutch: number;
        m_drs: number;
        m_engineRPM: number;
        m_engineTemperature: number;
        m_gear: number;
        m_revLightsPercent: number;
        m_speed: number;
        m_steer: number;
        m_throttle: number;
        m_tyresInnerTemperature: number[];
        m_tyresPressure: number[];
        m_tyresSurfaceTemperature: number[];
    }[];
    m_header: {
        m_frameIdentifier: number;
        m_packetFormat: number;
        m_packetId: number;
        m_packetVersion: number;
        m_playerCarIndex: number;
        m_sessionTime: number;
        m_sessionUID: bigint;
    };
};
