export interface WindTunnelData {
    timestamp: number;
    windSpeed: number;
    temperature: number;
    humidity: number;
    pressure: number;
    dragForce: number;
    liftForce: number;
    reynoldsNumber: number;
    machNumber: number;
    angleOfAttack: number;
    modelPosition: {
        x: number;
        y: number;
        z: number;
    };
    modelRotation: {
        x: number;
        y: number;
        z: number;
    };
    sensorReadings: {
        strainGauge1: number;
        strainGauge2: number;
        strainGauge3: number;
        strainGauge4: number;
        pressureSensor1: number;
        pressureSensor2: number;
        pressureSensor3: number;
        pressureSensor4: number;
    };
    environmentalFactors: {
        airDensity: number;
        dynamicViscosity: number;
        speedOfSound: number;
    };
    simulationConfig: {
        scenario: string;
        modelType: string;
        windTunnelLength: number;
        windTunnelWidth: number;
        windTunnelHeight: number;
    };
}
//# sourceMappingURL=WindTunnelData.d.ts.map