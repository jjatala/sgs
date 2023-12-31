import { ChartLayout } from '../../interfaces';
import { actionConstructor, StoreActions } from '../../utils';
import {
  AudioGraphUiStateModel,
  FrequencyUnitState,
  SetChartType,
} from './interfaces';

const action = actionConstructor('AudioGraphUi');

export const audioGraphUiAction: StoreActions = {
  setState: action<AudioGraphUiStateModel>('set state'),

  setFrequencyUnits: action<FrequencyUnitState>('set frequency units'),

  setChartCount: action<number>('set chart count'),
  setChartType: action<SetChartType>('set chart type'),
  setChartLayout: action<ChartLayout>('set chart layout'),

  addChart: action<number>('add chart'),
  removeChart: action<number>('remove chart'),
  moveChartUp: action<number>('move chart up'),
  moveChartDown: action<number>('move chart down'),
  toggleChartLayout: action<void>('toggle chart layout'),
};
