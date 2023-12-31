import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-controls',
  templateUrl: './audio-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/* eslint-disable prettier/prettier -- prettier conflicts with eslint (brace style) */
export class AudioControlsComponent
  implements AfterViewInit, OnDestroy, OnChanges {
  /* eslint-enable prettier/prettier -- prettier conflicts with eslint (brace style) */
  @Input() public src = '';

  @Input() public paused: Nullable<boolean> = true;

  @Output() public readonly pausedChange = new EventEmitter<
    Nullable<boolean>
  >();

  @ViewChild('audio') public audio: Nullable<ElementRef> = null;

  public _playing = false;

  public error: Nullable<AnyError> = null;

  public duration = 0;

  private timeValue = 0;

  private ignoreEvents = 0;

  private nativeElement: Nullable<HTMLAudioElement> = null;

  /**
   * Time getter.
   */
  public get time(): number {
    return this.timeValue;
  }

  /**
   * Time setter.
   */
  public set time(time: number) {
    this.nativeElement!.currentTime = time;
    this.timeValue = time;
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    this.nativeElement = this.audio!.nativeElement;
    this.updateElement();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.nativeElement!.pause();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.paused && this.nativeElement) {
      this.updateElement();
    }
  }

  /**
   * Loaded data handler.
   */
  public loadedData() {
    //console.log('loaded data', this.audio.nativeElement);
    this.error = this.nativeElement!.error;
    this.time = 0;
    this.duration = this.nativeElement!.duration;
    this.updateElement();
  }

  /**
   * Time update handler.
   */
  public timeUpdate() {
    this.timeValue = this.nativeElement!.currentTime;
  }

  /**
   * TODO: description
   */
  public setPaused(value: boolean) {
    if (this.ignoreEvents) {
      --this.ignoreEvents;
    } else {
      this.paused = value;
      this.pausedChange.emit(value);
    }
  }

  /**
   * TODO: description
   */
  public updateElement() {
    if (this.paused !== this.nativeElement!.paused) {
      ++this.ignoreEvents;
    }
    if (this.paused) {
      this.nativeElement!.pause();
    } else {
      void this.nativeElement!.play();
    }
  }

  /**
   * Play/ause toggler.
   */
  public toggle() {
    if (this.paused) {
      if (this.nativeElement!.ended) {
        this.time = 0;
      }
      void this.nativeElement!.play();
    } else {
      this.nativeElement!.pause();
    }
  }
}
