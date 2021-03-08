import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  SensorReading,
  SensorReadingsDataService
} from '../../services/sensor-readings-data/sensor-readings-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-home',
  template: `
    <input
      class="Search"
      placeholder="Filter by Sensor Type or Name"
      matInput
      [formControl]="searchFilter"
    />

    <mat-table class="Table" matSort [dataSource]="sensorReadings">
      <ng-container matColumnDef="id">
        <mat-header-cell *matHeaderCellDef> ID </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.id }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="boxId">
        <mat-header-cell *matHeaderCellDef> Box ID </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.boxId }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="sensorType">
        <mat-header-cell *matHeaderCellDef mat-sort-header>
          Sensor Type
        </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.sensorType }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.name }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="rangeLower">
        <mat-header-cell *matHeaderCellDef> Range Lower </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.rangeLower }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="rangeUpper">
        <mat-header-cell *matHeaderCellDef> Range Upper </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.rangeUpper }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="longitude">
        <mat-header-cell *matHeaderCellDef> Longitude </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.longitude }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="latitude">
        <mat-header-cell *matHeaderCellDef> Latitude </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.latitude }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="reading">
        <mat-header-cell *matHeaderCellDef> Reading </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.reading }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="readingUnit">
        <mat-header-cell *matHeaderCellDef> Unit </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.readingUnit }} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="readingTime">
        <mat-header-cell *matHeaderCellDef mat-sort-header>
          Time
        </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{ row.readingTime | date:'dd/MM/yy HH:mm' }} </mat-cell>
      </ng-container>

      <mat-header-row
        *matHeaderRowDef="sensorReadingsDisplayedColumns"
      ></mat-header-row>
      <mat-row
        *matRowDef="let row; columns: sensorReadingsDisplayedColumns"
      ></mat-row>
    </mat-table>

    <mat-paginator [pageSizeOptions]="[10, 25, 50, 100, 250]"></mat-paginator>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  sensorReadings: MatTableDataSource<SensorReading> = new MatTableDataSource<
    SensorReading
  >([]);

  readonly sensorReadingsDisplayedColumns = [
    'id',
    'boxId',
    'sensorType',
    'name',
    'rangeLower',
    'rangeUpper',
    'longitude',
    'latitude',
    'reading',
    'readingUnit',
    'readingTime'
  ];

  searchFilter = new FormControl('');
  searchFilterSubscription?: Subscription;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private sensorReadingsData: SensorReadingsDataService
  ) {}

  ngOnInit(): void {
    this.searchFilterSubscription = this.searchFilter.valueChanges
      .pipe(debounceTime(500))
      .subscribe(filter => {
        this.sensorReadings.filter = filter;
      });

    this.sensorReadingsData.get().then(sensorReadings => {
      this.sensorReadings.data = [...sensorReadings];
    });
  }

  ngAfterViewInit(): void {
    if (!(this.sort && this.paginator)) {
      throw new Error('Table sort or paginator not found');
    }

    this.sensorReadings.filterPredicate = this.filterSensorReadings;
    this.sensorReadings.paginator = this.paginator
    this.sensorReadings.sort = this.sort;
  }

  filterSensorReadings(data: SensorReading, filter: string): boolean {
    const sensorType = data.sensorType.toLowerCase();
    const name = data.name.toLowerCase();
    const filterLowercase = filter.toLowerCase();

    return (
      sensorType.indexOf(filterLowercase) !== -1 ||
      name.indexOf(filterLowercase) !== -1
    );
  }

  ngOnDestroy(): void {
    this.searchFilterSubscription?.unsubscribe();
  }
}
