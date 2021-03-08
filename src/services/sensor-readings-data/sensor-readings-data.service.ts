import { Injectable } from '@angular/core';

export interface SensorReading {
  id: string; // UUID for this sensor reading
  boxId: string; // UUID of the box
  sensorType: string; // type of the sensor
  name: string; // type of data read by sensor
  rangeLower: number; // measuring range lower bound
  rangeUpper: number; // measuring range upper bound
  longitude: number; // location of the box (lon)
  latitude: number; // location of the box (lat)
  reading: number; // actual value being read
  readingUnit: string; // measurement unit
  readingTime: Date; // when the reading was taken
}

@Injectable({
  providedIn: 'root'
})
export class SensorReadingsDataService {
  readings: ReadonlyArray<SensorReading> = [];

  private async load() {
    const data = await import('../../../../data/sensor_readings.json');
    const sensorReadings = data?.sensor_readings;

    if (!sensorReadings) {
      throw new Error('Sensor readings not found in data');
    }

    this.readings = this.transformSensorReadings(data.sensor_readings);
  }

  private transformSensorReadings(
    sensorReadings: ReadonlyArray<any>
  ): ReadonlyArray<SensorReading> {
    return sensorReadings.map(sensorReading => {
      if (
        !sensorReading.id ||
        !sensorReading.box_id ||
        !sensorReading.sensor_type ||
        !sensorReading.name ||
        sensorReading.range_l === undefined ||
        sensorReading.range_u === undefined ||
        sensorReading.reading === undefined ||
        !sensorReading.unit ||
        !sensorReading.reading_ts
      ) {
        throw new Error('Sensor reading data not valid');
      }

      return {
        id: sensorReading.id,
        boxId: sensorReading.box_id,
        sensorType: sensorReading.sensor_type,
        name: sensorReading.name,
        rangeLower: sensorReading.range_l,
        rangeUpper: sensorReading.range_u,
        longitude: sensorReading.longitude,
        latitude: sensorReading.latitude,
        reading: sensorReading.reading,
        readingUnit: sensorReading.unit,
        readingTime: new Date(sensorReading.reading_ts)
      };
    });
  }

  async get() {
    if (this.readings.length === 0) {
      await this.load();
    }

    return this.readings;
  }
}
