import { Inject, Injectable } from '@angular/core';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { Analyser } from '../../classes/analyser/analyser';
import {
  AnalyserFunctionId,
  AnalyserFunctionState,
  FftPeakMask,
  FftPeakType,
} from '../../interfaces';
import { ANALYSER, StoreAction } from '../../utils';
import { analyserAction } from './analyser.actions';
import {
  ANALYSER_STATE_DEFAULTS,
  ANALYSER_STATE_TOKEN,
  AnalyserStateModel,
} from './analyser.model';

@State<AnalyserStateModel>({
  name: ANALYSER_STATE_TOKEN,
  defaults: ANALYSER_STATE_DEFAULTS,
})
@Injectable()
export class AnalyserState {
  /**
   * Constructor
   * @param store
   */
  constructor(@Inject(ANALYSER) public readonly analyser: Analyser) {}

  /**
   * State selector
   * @param state
   */
  @Selector()
  public static state(state: AnalyserStateModel) {
    return state;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static debug(state: AnalyserStateModel) {
    return state.debug;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static historySize(state: AnalyserStateModel) {
    return state.historySize;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static rmsThreshold(state: AnalyserStateModel) {
    return state.rmsThreshold;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static minPitch(state: AnalyserStateModel) {
    return state.pitch.min;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static maxPitch(state: AnalyserStateModel) {
    return state.pitch.max;
  }

  /**
   * Selector
   * @param id
   */
  public static functionEnabled(id: AnalyserFunctionId) {
    return createSelector(
      [AnalyserState],
      (state: AnalyserStateModel) => state.functions[id]
    );
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakType(state: AnalyserStateModel) {
    return state.fftp.type;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceRadius(state: AnalyserStateModel) {
    return state.fftp.prominence.radius;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceThreshold(state: AnalyserStateModel) {
    return state.fftp.prominence.threshold;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceNormalize(state: AnalyserStateModel) {
    return state.fftp.prominence.normalize;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakMask(state: AnalyserStateModel) {
    return state.fftpeaks.mask;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakMaskRadius(state: AnalyserStateModel) {
    return state.fftpeaks.maskRadius;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static harmonicSearchRadius(state: AnalyserStateModel) {
    return state.harmonicSearchRadius;
  }

  /**
   * Set Analyser state action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setState)
  public setState(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<AnalyserStateModel>
  ) {
    this.analyser.setState(payload);
    return ctx.patchState(payload);
  }

  /**
   * Action
   * @param ctx
   */
  @Action(analyserAction.reset)
  public reset(ctx: StateContext<AnalyserStateModel>) {
    this.analyser.clearData();
    return ctx;
  }

  /**
   * Action
   * @param ctx
   */
  @Action(analyserAction.setDebug)
  public setDebug(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<boolean>
  ) {
    this.analyser.debug = payload;
    this.analyser.stateChanged = true;
    return ctx.patchState({ debug: payload });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(analyserAction.setRmsThreshold)
  public setRmsThreshold(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.rmsThreshold = payload;
    this.analyser.stateChanged = true;
    return ctx.patchState({ rmsThreshold: payload });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(analyserAction.setHistorySize)
  public setHistorySize(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    //this.analyser.stateChanged = true;
    return ctx.patchState({ historySize: payload });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setMinPitch)
  public setMinPitch(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.minPitch = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        pitch: patch({ min: payload }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setMaxPitch)
  public setMaxPitch(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.maxPitch = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        pitch: patch({ max: payload }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   */
  @Action(analyserAction.setFunctionState)
  public setFunctionState(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<AnalyserFunctionState>
  ) {
    const { id, enabled } = payload;
    this.analyser.functionById[id].enabled = enabled;
    this.analyser.stateChanged = true;
    const data = {};
    data[id] = enabled;
    return ctx.setState(patch({ functions: patch(data) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakType)
  public setFftPeakType(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<FftPeakType>
  ) {
    this.analyser.fftPeakType = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(patch({ fftp: patch({ type: payload }) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakProminenceRadius)
  public setFftPeakProminenceRadius(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.prominenceRadius = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        fftp: patch({
          prominence: patch({
            radius: payload,
          }),
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakProminenceThreshold)
  public setFftPeakProminenceThreshold(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.prominenceThreshold = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        fftp: patch({
          prominence: patch({
            threshold: payload,
          }),
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakProminenceNormalize)
  public setFftPeakProminenceNormalize(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<boolean>
  ) {
    this.analyser.prominenceNormalize = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        fftp: patch({
          prominence: patch({
            normalize: payload,
          }),
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakMask)
  public setFftPeakMask(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<FftPeakMask>
  ) {
    this.analyser.fftPeakMask = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        fftpeaks: patch({
          mask: payload,
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakMaskRadius)
  public setFftPeakMaskRadius(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.fftPeakMaskRadius = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(
      patch({
        fftpeaks: patch({
          maskRadius: payload,
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setHarmonicSearchRadius)
  public setHarmonicSearchRadius(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.harmonicSearchRadius = payload;
    this.analyser.stateChanged = true;
    return ctx.patchState({
      harmonicSearchRadius: payload,
    });
  }
}
