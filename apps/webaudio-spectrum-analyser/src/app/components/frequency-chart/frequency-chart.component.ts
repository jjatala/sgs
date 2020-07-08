import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { merge, map, distinctUntilChanged } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Point } from '../../interfaces';
import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { environment } from '../../../environments/environment';
import { throttleTime_ } from '../../utils/rxjs.util';

@UntilDestroy()
@Component({
  selector: 'app-frequency-chart',
  templateUrl: './frequency-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') public canvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D = null;

  private frame = 0;

  private point: Point = { x: 0, y: 0 };

  private readonly animate = this._animate.bind(this);

  public readonly graph: AudioGraph = this.graphService.graph;

  private readonly error = new BehaviorSubject<Error>(null);

  public readonly error$ = this.error.asObservable();

  private readonly pointFrequency = new BehaviorSubject<number>(0);

  public readonly pointFrequency$ = this.pointFrequency
    .asObservable()
    .pipe(throttleTime_(environment.throttle));

  private readonly pointValues = this.graph.fdata.map(
    _ => new BehaviorSubject<number>(-100)
  );

  public readonly pointValues$ = this.pointValues.map(subject => {
    return subject
      .asObservable()
      .pipe(distinctUntilChanged(), throttleTime_(environment.throttle));
  });

  public readonly pitch = this.graph.pitch.map(pd => pd.short);

  private readonly pitchValue = this.pitch.map(
    _ => new BehaviorSubject<number>(0)
  );

  public readonly pitchValue$ = this.pitchValue.map(subject => {
    return subject.asObservable().pipe(
      distinctUntilChanged(
        (prev: number, cur: number) => Math.abs(cur - prev) < 0.1
      ),
      throttleTime_(environment.throttle)
    );
  });

  public readonly pitchEnabled$ = this.pitch.map(id => {
    return this.graphService.select(AudioGraphState.pitchEnabled(id));
  });

  public width = 0;

  public height = 0;

  public showPoint = false;

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graphService: AudioGraphService) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    try {
      const canvas = this.canvas.nativeElement;
      this.context = canvas.getContext('2d');
      this.frame = requestAnimationFrame(this.animate);
      void fromEvent(canvas, 'click')
        .pipe(
          merge(fromEvent(canvas, 'mousemove')),
          untilDestroyed(this),
          map(
            (ev: MouseEvent): Point => {
              return {
                x: ev.offsetX,
                y: ev.offsetY,
              };
            }
          )
        )
        .subscribe((p: Point) => {
          this.point = p;
          this.pointFrequency.next(this.canvasToFrequency(this.point.x));
        });
    } catch (err) {
      this.setError(err);
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    cancelAnimationFrame(this.frame);
    this.context = null;
    this.error.complete();
    this.pointFrequency.complete();
    for (const subject of this.pointValues) {
      subject.complete();
    }
  }

  /**
   * Set error
   * @param err
   */
  public setError(err: Error) {
    this.error.next(err);
  }

  /**
   * Resizes canvas.
   */
  private resize() {
    const canvas = this.canvas.nativeElement;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    if (canvas.width !== this.width) {
      //console.log('set canvas width');
      canvas.width = this.width;
    }
    if (canvas.height !== this.height) {
      //console.log('set canvas height');
      canvas.height = this.height;
    }
  }

  /**
   * Converts canvas value to frequency.
   * @param x
   */
  private canvasToFrequency(x: number): number {
    return Math.pow(10, 1.301 + (x / this.width) * 3);
  }

  /**
   * Converts frequency to canvas value.
   * @param f
   */
  private frequencyToCanvas(f: number): number {
    return ((Math.log10(f) - 1.301) / 3) * this.width;
  }

  /**
   * Draws grid.
   * @param plotCount
   */
  private drawGrid(plotCount: number): void {
    const ctx = this.context;
    ctx.strokeStyle = '#495865';
    ctx.fillStyle = '#495865';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 20, j = 10; i <= 20000; i += j) {
      const x = this.frequencyToCanvas(i);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      switch (i) {
        case 10:
        case 100:
        case 1000:
        case 10000:
          j = i;
          break;
      }
    }
    for (let i = 1; i < plotCount; i += 1) {
      const y = (i * this.height) / plotCount;
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    if (this.showPoint) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.point.x, 0);
      ctx.lineTo(this.point.x, this.height);
      ctx.stroke();
    }
  }

  /**
   * Draws frequency data.
   * @param data
   * @param yMin
   * @param yMax
   */
  private drawFrequencyData(
    data: Uint8Array,
    yMin: number,
    yMax: number
  ): number {
    const ctx = this.context;
    const yScale = (yMax - yMin) / 255.0;
    const sampleRate = this.graph.sampleRate;
    const fftSize = data.length * 2;
    const binSize = sampleRate / fftSize;
    const halfBinSize = binSize / 2;

    let prevF = 20;
    let prevX = 0;

    const point = this.pointFrequency.getValue();
    let pointValue = 0;

    ctx.strokeStyle = '#4aaed9';
    ctx.fillStyle = '#4aaed9';
    ctx.lineWidth = 0;

    for (let i = 0; i < data.length; i += 1) {
      const f = i * binSize;
      if (f < prevF) {
        continue;
      }
      const x = this.frequencyToCanvas(f + halfBinSize);
      if (data[i]) {
        const y = yScale * data[i];
        ctx.fillRect(prevX, yMax - y, x - prevX, y);
      }
      if (point >= prevF && point <= f) {
        pointValue = data[i];
      }
      prevF = f;
      prevX = x;
    }

    pointValue = Math.round(this.graph.byteToDecibels(pointValue));
    return pointValue;
  }

  /**
   * Draws autocorrelation data.
   * @param data
   * @param yMin
   * @param yMax
   */
  private drawAutocorrelationData(
    data: Float32Array,
    yMin: number,
    yMax: number
  ) {
    const ctx = this.context;
    const yMid = (yMin + yMax) / 2;
    const yScale = yMin - yMid;
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.width + 10, yMid);
    for (let i = 2; i < data.length; i += 1) {
      const f = this.graph.sampleRate / i;
      const x = this.frequencyToCanvas(f);
      const y = yMid + yScale * data[i];
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * Animates canvas.
   */
  private _animate() {
    if (this.context === null) {
      console.log('canvas destroyed');
      return;
    }
    try {
      const plotCount: number = this.graph.fdata.length;
      const plotHeight: number = this.height / plotCount;

      this.resize();
      this.graph.analyse();

      this.context.clearRect(0, 0, this.width, this.height);

      this.graph.fdata.forEach((data, i) => {
        const pointValue: number = this.drawFrequencyData(
          data,
          i * plotHeight,
          (i + 1) * plotHeight
        );
        this.pointValues[i].next(pointValue);
      });
      this.drawGrid(plotCount);

      for (let i = 0; i < this.pitch.length; ++i) {
        this.pitchValue[i].next(this.graph.pitch[i].value);
      }

      if (this.graph.debug) {
        for (const pd of this.graph.pitch) {
          if (pd.enabled) {
            switch (pd.short) {
              case 'AC':
                this.drawAutocorrelationData(
                  this.graph.autocorrdata,
                  0,
                  plotHeight
                );
                break;
              default:
                break;
            }
          }
        }
      }

      this.frame = requestAnimationFrame(this.animate);
    } catch (err) {
      this.setError(err);
    }
  }
}
